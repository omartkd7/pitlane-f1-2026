import { useState, useMemo, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import races from '../data/races.js';
import { RaceCard } from '../components/RaceCard.jsx';
import './Calendar.css';

const REGIONS = ['Tous', 'Europe', 'Americas', 'Asia', 'Oceania', 'MiddleEast'];
const REGION_LABELS = {
  Tous: 'Tous', Europe: 'Europe', Americas: 'Amériques',
  Asia: 'Asie', Oceania: 'Océanie', MiddleEast: 'Moyen-Orient',
};
const REGION_COUNTS = {
  Europe: 10, Americas: 6, Asia: 5, Oceania: 1, MiddleEast: 2,
};

const TYPES = ['Tous', 'Sprint', 'Standard'];
const TYPE_LABELS  = { Tous: 'Tous', Sprint: 'Sprint', Standard: 'Standard' };
const TYPE_COUNTS  = { Sprint: 6, Standard: 18 };

export const Calendar = () => {
  const containerRef  = useRef(null);
  const cardRefs      = useRef([]);
  const isFirstRender = useRef(true);

  const [selectedRegion, setSelectedRegion] = useState('Tous');
  const [selectedType,   setSelectedType]   = useState('Tous');

  const filteredRaces = useMemo(() =>
    races.filter((r) => {
      const regionOk = selectedRegion === 'Tous' || r.continent === selectedRegion;
      const typeOk   = selectedType   === 'Tous' ||
        (selectedType === 'Sprint'   &&  r.isSprint) ||
        (selectedType === 'Standard' && !r.isSprint);
      return regionOk && typeOk;
    }),
  [selectedRegion, selectedType]);

  const [displayedRaces, setDisplayedRaces] = useState(filteredRaces);

  // initial stagger — respects prefers-reduced-motion
  useGSAP(() => {
    const cards = cardRefs.current.filter(Boolean);
    if (!cards.length) return;
    const mm = gsap.matchMedia();
    mm.add(
      { isNormal: '(prefers-reduced-motion: no-preference)', isReduced: '(prefers-reduced-motion: reduce)' },
      (ctx) => {
        const { isNormal } = ctx.conditions;
        gsap.from(cards, {
          autoAlpha: 0,
          y:        isNormal ? 20 : 0,
          stagger:  isNormal ? 0.05 : 0,
          duration: isNormal ? 0.4 : 0,
          ease: 'power2.out',
        });
        return () => mm.revert();
      }
    );
  }, { scope: containerRef });

  // filter transition
  useGSAP(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const out = cardRefs.current.filter(Boolean);
    if (!out.length) { setDisplayedRaces(filteredRaces); return; }
    gsap.timeline()
      .to(out, { autoAlpha: 0, y: -8, stagger: 0.02, duration: 0.15 })
      .call(() => flushSync(() => setDisplayedRaces(filteredRaces)))
      .call(() => {
        const inCards = cardRefs.current.filter(Boolean);
        if (inCards.length) gsap.from(inCards, { autoAlpha: 0, y: 16, stagger: 0.04, duration: 0.3 });
      });
  }, { scope: containerRef, dependencies: [filteredRaces] });

  // scroll reveal
  useGSAP(() => {
    cardRefs.current.filter(Boolean).forEach((card) => {
      gsap.from(card, {
        autoAlpha: 0, y: 14, duration: 0.35,
        scrollTrigger: { trigger: card, start: 'top 92%' },
      });
    });
  }, { scope: containerRef, dependencies: [displayedRaces] });

  useEffect(() => { ScrollTrigger.refresh(); }, [filteredRaces]);

  cardRefs.current = [];

  const count = filteredRaces.length;

  return (
    <div className="page calendar">

      {/* ── Breadcrumb ── */}
      <div className="cal-subbar">
        <span className="cal-subbar__crumbs">
          Calendrier <em>/</em> <span>Saison 2026</span> <em>/</em> {races.length} manches
        </span>
        <span>Mise à jour officielle · Saison 2026</span>
      </div>

      {/* ── Masthead ── */}
      <section className="cal-head">
        <div className="cal-head__ghost" aria-hidden="true">26</div>
        <div className="cal-head__main">
          <div className="cal-head__eyebrow">
            <span className="cal-pill">Saison · 2026</span>
            <span>{races.length} Grands Prix · 6 Sprints · 5 continents</span>
            <span className="cal-head__bar" />
            <span>Mise à jour FIA</span>
          </div>
          <h1 className="cal-head__title">
            CALENDRIER<br />
            <span className="accent">SAISON 2026</span>
          </h1>
        </div>
        <aside className="cal-head__side">
          <div className="cal-stat"><span>Manches</span><b>{races.length}</b></div>
          <div className="cal-stat"><span>Sprint Week-ends</span><b className="red">06</b></div>
          <div className="cal-stat"><span>Résultats affichés</span><b>{count}</b></div>
          <div className="cal-stat"><span>Période</span><b>MAR → DÉC</b></div>
        </aside>
      </section>

      {/* ── Filters ── */}
      <div className="cal-filters">
        <div className="filter-row">
          <span className="filter-row__label">/ Région <b>FILTRE</b></span>
          <div className="filter-pills">
            {REGIONS.map((r) => (
              <button
                key={r}
                className={`filter-pill${selectedRegion === r ? ' active' : ''}`}
                onClick={() => setSelectedRegion(r)}
              >
                {REGION_LABELS[r]}
                {r !== 'Tous' && <span className="filter-pill__ct">{REGION_COUNTS[r] || ''}</span>}
                {r === 'Tous' && <span className="filter-pill__ct">{races.length}</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-row">
          <span className="filter-row__label">/ Format <b>FILTRE</b></span>
          <div className="filter-pills">
            {TYPES.map((t) => (
              <button
                key={t}
                className={`filter-pill${selectedType === t ? ' active' : ''}`}
                onClick={() => setSelectedType(t)}
              >
                {TYPE_LABELS[t]}
                {t !== 'Tous' && <span className="filter-pill__ct">{TYPE_COUNTS[t] || ''}</span>}
                {t === 'Tous' && <span className="filter-pill__ct">{races.length}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section header ── */}
      <div className="sec-head">
        <h2><span className="num">§01</span>SAISON 2026</h2>
        <span className="meta-right">Affichées · <b style={{ color: 'var(--text)' }}>{count}</b></span>
      </div>

      {/* ── Grid ── */}
      {displayedRaces.length === 0 ? (
        <p className="cal-empty">Aucune course ne correspond aux filtres sélectionnés.</p>
      ) : (
        <div className="race-grid" ref={containerRef}>
          {displayedRaces.map((race, i) => (
            <Link
              key={race.id}
              to={`/calendrier/${race.id}`}
              className="race-grid__link"
              ref={(el) => { cardRefs.current[i] = el; }}
            >
              <RaceCard race={race} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
