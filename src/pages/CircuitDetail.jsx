import { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import races from '../data/races.js';
import './CircuitDetail.css';

const flagEmoji = (code) =>
  [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');

const CONTINENT_LABELS = {
  Europe: 'Europe', Americas: 'Amériques', Asia: 'Asie',
  Oceania: 'Océanie', MiddleEast: 'Moyen-Orient',
};

const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d)
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    .toUpperCase();
};

export const CircuitDetail = () => {
  const { circuitId } = useParams();
  const pageRef       = useRef(null);
  const stat1Ref      = useRef(null);
  const stat2Ref      = useRef(null);
  const stat3Ref      = useRef(null);

  const race = races.find((r) => r.id === circuitId);

  useGSAP(() => {
    if (!pageRef.current || !race) return;

    // page entrance
    gsap.from(pageRef.current.querySelectorAll('.cd-anim'), {
      opacity: 0,
      y: 8,
      duration: 0.4,
      ease: 'power2.out',
      stagger: 0.06,
    });

    // count-up for stats
    const countUp = (el, target, decimals) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { innerText: 0 },
        {
          innerText: target,
          duration: 1.3,
          ease: 'power3.out',
          delay: 0.2,
          snap: { innerText: decimals ? 0.001 : 1 },
          onUpdate() {
            el.innerText = decimals
              ? parseFloat(el.innerText).toFixed(decimals)
              : Math.round(el.innerText).toString();
          },
        }
      );
    };

    if (stat1Ref.current) countUp(stat1Ref.current, race.circuitLengthKm, 3);
    if (stat2Ref.current) countUp(stat2Ref.current, race.laps, 0);
    if (stat3Ref.current)
      countUp(stat3Ref.current, parseFloat((race.laps * race.circuitLengthKm).toFixed(1)), 1);
  }, { scope: pageRef, dependencies: [race] });

  if (!race) {
    return (
      <div className="page cd-notfound">
        <p>Circuit introuvable.</p>
        <Link to="/calendrier" className="cd-back-link">← Retour au calendrier</Link>
      </div>
    );
  }

  return (
    <div className="page circuit-detail" ref={pageRef}>

      {/* Breadcrumb */}
      <div className="cd-subbar cd-anim">
        <span className="cd-subbar__crumbs">
          <Link to="/calendrier">Calendrier</Link>
          <em>/</em>
          <Link to={`/calendrier/${race.id}`}>{race.name}</Link>
          <em>/</em>
          <span>Circuit</span>
        </span>
        <span>Round {String(race.round).padStart(2, '0')} · Saison 2026</span>
      </div>

      {/* Hero */}
      <section className="cd-hero cd-anim">
        <div className="cd-hero__ghost" aria-hidden="true">
          {String(race.round).padStart(2, '0')}
        </div>
        <div className="cd-hero__content">
          <div className="cd-eyebrow">
            <span className="cd-badge">Circuit</span>
            {race.isNewCircuit && <span className="cd-badge cd-badge--new">Nouveau</span>}
            <span className="cd-badge cd-badge--geo">
              {flagEmoji(race.countryCode)} {CONTINENT_LABELS[race.continent] ?? race.continent}
            </span>
          </div>
          <h1 className="cd-title">{race.circuit}</h1>
          <p className="cd-location">
            {race.city} · {race.country}
          </p>
          <p className="cd-dates">
            {fmtDate(race.dateStart)} — {fmtDate(race.dateEnd)}
          </p>
        </div>
      </section>

      {/* Stat blocks */}
      <section className="cd-stats cd-anim">
        <div className="cd-stat-block">
          <div className="cd-stat-value">
            <span ref={stat1Ref}>{race.circuitLengthKm.toFixed(3)}</span>
          </div>
          <div className="cd-stat-label">/ Longueur</div>
          <div className="cd-stat-unit">KM · PAR TOUR</div>
        </div>
        <div className="cd-stat-block">
          <div className="cd-stat-value">
            <span ref={stat2Ref}>{race.laps}</span>
          </div>
          <div className="cd-stat-label">/ Tours</div>
          <div className="cd-stat-unit">TOURS · COURSE</div>
        </div>
        <div className="cd-stat-block">
          <div className="cd-stat-value">
            <span ref={stat3Ref}>{(race.laps * race.circuitLengthKm).toFixed(1)}</span>
          </div>
          <div className="cd-stat-label">/ Distance totale</div>
          <div className="cd-stat-unit">KM · COURSE</div>
        </div>
      </section>

      {/* Description */}
      <section className="cd-desc cd-anim">
        <div className="cd-desc__label">/ À propos du circuit</div>
        <p className="cd-desc__text">{race.description}</p>
      </section>

      {/* CTA back to race */}
      <div className="cd-footer cd-anim">
        <Link to={`/calendrier/${race.id}`} className="cd-btn cd-btn--primary">
          ← Fiche du Grand Prix
        </Link>
        <Link to="/calendrier" className="cd-btn cd-btn--ghost">
          Voir le calendrier
        </Link>
      </div>

    </div>
  );
};
