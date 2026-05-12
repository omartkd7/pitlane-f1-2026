import { useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import races from '../data/races.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import './RaceDetail.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const flagEmoji = (code) =>
  [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');

const fmtShort = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d)
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    .toUpperCase();
};

const splitGPName = (name) => {
  const upper = name.toUpperCase();
  const idx = upper.indexOf(' ', 6);
  if (idx === -1) return ['GRAND PRIX', upper];
  return ['GRAND PRIX', upper.slice(idx + 1)];
};

// ─── Component ────────────────────────────────────────────────────────────────

export const RaceDetails = () => {
  const pageRef    = useRef(null);
  const heroRef    = useRef(null);
  const statsRef   = useRef(null);
  const stat1Ref   = useRef(null);
  const stat2Ref   = useRef(null);
  const stat3Ref   = useRef(null);
  const starRef    = useRef(null);
  const checkRef   = useRef(null);

  const { raceId } = useParams();
  const navigate   = useNavigate();

  const [favorites, setFavorites] = useLocalStorage('pitlane_favorites', []);
  const [watched,   setWatched]   = useLocalStorage('pitlane_watched',   []);

  const race = races.find((r) => r.id === raceId);

  // hero + stats entrance
  useGSAP(() => {
    if (!heroRef.current || !statsRef.current) return;
    gsap.timeline()
      .from(heroRef.current.querySelector('.rd-hero__inner').children, {
        opacity: 0, y: 16, stagger: 0.09, duration: 0.5, ease: 'power2.out',
      })
      .from(statsRef.current.children, {
        opacity: 0, y: 12, stagger: 0.1, duration: 0.4, ease: 'power2.out',
      }, '-=0.25');
  }, { scope: pageRef });

  // count-up animation — fires after mount
  useGSAP(() => {
    if (!race || !stat1Ref.current) return;

    const countUp = (el, target, decimals) => {
      gsap.fromTo(
        el,
        { innerText: 0 },
        {
          innerText: target,
          duration: 1.3,
          ease: 'power3.out',
          snap: { innerText: decimals ? 0.001 : 1 },
          onUpdate() {
            const val = parseFloat(el.innerText);
            el.innerText = decimals ? val.toFixed(decimals) : Math.round(val).toString().padStart(2, '0');
          },
        }
      );
    };

    countUp(stat1Ref.current, race.circuitLengthKm, 3);
    countUp(stat2Ref.current, race.laps,            0);
    countUp(stat3Ref.current, parseFloat((race.laps * race.circuitLengthKm).toFixed(1)), 1);
  }, { scope: pageRef });

  if (!race) {
    return (
      <div className="page race-detail" ref={pageRef}>
        <button className="rd-back" onClick={() => navigate(-1)}>← Retour</button>
        <h1>Course introuvable</h1>
        <p className="rd-missing">Aucune course ne correspond à l'identifiant <code>{raceId}</code>.</p>
      </div>
    );
  }

  const isFavorite = favorites.includes(raceId);
  const isWatched  = watched.includes(raceId);

  const toggleFavorite = () => {
    setFavorites(isFavorite ? favorites.filter((id) => id !== raceId) : [...favorites, raceId]);
    gsap.fromTo(starRef.current, { scale: 1.25 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
  };
  const toggleWatched = () => {
    setWatched(isWatched ? watched.filter((id) => id !== raceId) : [...watched, raceId]);
    gsap.fromTo(checkRef.current, { scale: 1.2 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
  };

  const [line1, line2] = splitGPName(race.name);

  return (
    <div className="page race-detail" ref={pageRef}>

      {/* ── Breadcrumb ── */}
      <div className="rd-subbar">
        <span className="rd-subbar__crumbs">
          <span className="rd-back-link" onClick={() => navigate(-1)}>
            <span className="rd-back-arr">←</span>Retour
          </span>
          {' '}<em>/</em> Calendrier <em>/</em> <span>R{String(race.round).padStart(2,'0')} · {race.country}</span>
        </span>
        <span>Fiche course · Saison 2026</span>
      </div>

      {/* ── Hero ── */}
      <section className="rd-hero" ref={heroRef}>
        <div className="rd-hero__ghost" aria-hidden="true">
          {String(race.round).padStart(2, '0')}
        </div>
        <div className="rd-hero__inner">
          <div className="rd-hero__round">
            <span>ROUND {String(race.round).padStart(2,'0')} · {race.continent}</span>
            <span className="rd-hero__tick" />
            <span className="rd-hero__silver">/ 24 manches · Saison 2026</span>
          </div>

          <h1 className="rd-hero__title">
            {line1}<br />
            <span className="accent">{line2}</span>
          </h1>

          <div className="rd-hero__meta">
            <span className="flag">{flagEmoji(race.countryCode)}</span>
            <span className="strong">{race.circuit}</span>
            <span className="sep">·</span>
            <span>{race.city}</span>
            <span className="sep">·</span>
            <span className="rd-date-pill">
              {fmtShort(race.dateStart)} — {fmtShort(race.dateEnd)}
            </span>
          </div>
        </div>
        <div className="rd-hero__rule" />
      </section>

      {/* ── Stats ── */}
      <section className="rd-stats" ref={statsRef}>
        <div className="rd-stat">
          <div className="rd-stat__k"><span>/ Distance par tour</span><span className="rd-stat__idx">A.01</span></div>
          <div className="rd-stat__v">
            <span ref={stat1Ref}>{race.circuitLengthKm.toFixed(3)}</span>
            <span className="rd-stat__u">km</span>
          </div>
          <div className="rd-stat__desc">Longueur officielle · <b>{race.circuitLengthKm} KM</b></div>
        </div>
        <div className="rd-stat">
          <div className="rd-stat__k"><span>/ Nombre de tours</span><span className="rd-stat__idx">A.02</span></div>
          <div className="rd-stat__v">
            <span ref={stat2Ref}>{String(race.laps).padStart(2,'0')}</span>
            <span className="rd-stat__u">laps</span>
          </div>
          <div className="rd-stat__desc">Course complète · <b>{race.laps} TOURS</b></div>
        </div>
        <div className="rd-stat">
          <div className="rd-stat__k"><span>/ Distance totale</span><span className="rd-stat__idx">A.03</span></div>
          <div className="rd-stat__v">
            <span ref={stat3Ref}>{(race.laps * race.circuitLengthKm).toFixed(1)}</span>
            <span className="rd-stat__u">km</span>
          </div>
          <div className="rd-stat__desc">Distance de course · <b>{race.round} / 24</b></div>
        </div>
      </section>

      {/* ── Content: description + factsheet ── */}
      <section className="rd-content">
        <div className="rd-desc">
          <div className="rd-desc__kicker">
            / Briefing course <span className="red">● R{String(race.round).padStart(2,'0')}</span>
          </div>
          <p className="rd-desc__lede">{race.description}</p>
        </div>

        <aside className="rd-factsheet">
          <h4 className="rd-factsheet__head">
            Fiche circuit <span className="red">● Officielle</span>
          </h4>
          <div className="rd-factsheet__row"><span>Tours</span><b>{race.laps}</b></div>
          <div className="rd-factsheet__row"><span>Longueur</span><b>{race.circuitLengthKm} KM</b></div>
          <div className="rd-factsheet__row"><span>Distance totale</span><b>≈ {(race.laps * race.circuitLengthKm).toFixed(1)} KM</b></div>
          <div className="rd-factsheet__row"><span>Continent</span><b>{race.continent}</b></div>
          {race.isSprint && <div className="rd-factsheet__row"><span>Format</span><b className="red">SPRINT</b></div>}
          {race.isNewCircuit && <div className="rd-factsheet__row"><span>Circuit</span><b>NOUVEAU</b></div>}
        </aside>
      </section>

      {/* ── Tags ── */}
      <div className="rd-tags-row">
        <span className="rd-tag rd-tag--round">ROUND {race.round}</span>
        <span className="rd-tag rd-tag--outline">{race.continent}</span>
        {race.isSprint     && <span className="rd-tag rd-tag--fill">SPRINT WEEKEND</span>}
        {race.isNewCircuit && <span className="rd-tag rd-tag--outline">NOUVEAU CIRCUIT</span>}
      </div>

      {/* ── CTA buttons ── */}
      <div className="rd-cta">
        <button
          ref={starRef}
          className={`rd-btn rd-btn--primary${isFavorite ? ' rd-btn--saved' : ''}`}
          onClick={toggleFavorite}
        >
          <span>{isFavorite ? 'AJOUTÉ AU GARAGE' : 'AJOUTER AU GARAGE'}</span>
          <span className="rd-btn__glyph">{isFavorite ? '✓' : '⊞'}</span>
        </button>
        <button
          ref={checkRef}
          className={`rd-btn rd-btn--ghost${isWatched ? ' rd-btn--checked' : ''}`}
          onClick={toggleWatched}
        >
          <span>{isWatched ? "COURSE REGARDÉE" : "J'AI REGARDÉ"}</span>
          <span className="rd-btn__glyph">{isWatched ? '✓' : '○'}</span>
        </button>
        <Link to={`/circuits/${race.id}`} className="rd-btn rd-btn--ghost">
          <span>VOIR LE CIRCUIT</span>
          <span className="rd-btn__glyph">⬡</span>
        </Link>
      </div>

    </div>
  );
};
