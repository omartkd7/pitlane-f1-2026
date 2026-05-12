import { useState, useMemo, useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import races from '../data/races.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import './MySeason.css';

// ─── Filter options ───────────────────────────────────────────────────────────

const CONTINENTS = ['Tous', 'Europe', 'Americas', 'Asia', 'Oceania', 'MiddleEast'];
const CONTINENT_LABELS = {
  Tous: 'Tous', Europe: 'Europe', Americas: 'Amériques',
  Asia: 'Asie', Oceania: 'Océanie', MiddleEast: 'Moyen-Orient',
};
const TYPES = ['Tous', 'Sprint', 'Standard'];
const TYPE_LABELS = { Tous: 'Tous', Sprint: 'Sprint', Standard: 'Standard' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const flagEmoji = (code) =>
  [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');

const fmtShort = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d)
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    .toUpperCase();
};

// ─── Component ────────────────────────────────────────────────────────────────

export const MySeason = () => {
  const progressRef = useRef(null);
  const logRef      = useRef(null);
  const entryRefs   = useRef([]);

  const [watched] = useLocalStorage('pitlane_watched', []);

  const [selectedContinent, setSelectedContinent] = useState('Tous');
  const [selectedType,      setSelectedType]      = useState('Tous');

  const watchedRaces = useMemo(
    () =>
      watched
        .map((id) => races.find((r) => r.id === id))
        .filter(Boolean)
        .sort((a, b) => a.round - b.round),
    [watched]
  );

  const filteredWatched = useMemo(
    () =>
      watchedRaces.filter((race) => {
        const continentMatch = selectedContinent === 'Tous' || race.continent === selectedContinent;
        const typeMatch      = selectedType === 'Tous'     ||
          (selectedType === 'Sprint'   &&  race.isSprint)  ||
          (selectedType === 'Standard' && !race.isSprint);
        return continentMatch && typeMatch;
      }),
    [watchedRaces, selectedContinent, selectedType]
  );

  const count              = watchedRaces.length;
  const totalRaces         = 24;
  const progressPct        = Math.min(100, Math.round((count / totalRaces) * 100));
  const filteredCount      = filteredWatched.length;
  const sprintCount        = filteredWatched.filter((r) => r.isSprint).length;

  // progress bar width animation
  useGSAP(() => {
    if (!progressRef.current) return;
    gsap.fromTo(
      progressRef.current,
      { width: '0%' },
      { width: `${progressPct}%`, duration: 1.4, ease: 'power3.out', delay: 0.15 }
    );
  });

  // row stagger reveal — new animation: y:6 → 0, matches design system
  useGSAP(() => {
    const entries = entryRefs.current.filter(Boolean);
    if (!entries.length) return;
    entries.forEach((entry, i) => {
      gsap.from(entry, {
        opacity: 0,
        y: 6,
        duration: 0.4,
        ease: 'power2.out',
        delay: Math.min(i, 8) * 0.07,
        scrollTrigger: {
          trigger: entry,
          start: 'top 92%',
          toggleActions: 'play none none none',
        },
      });
    });
  }, { scope: logRef, dependencies: [filteredWatched] });

  useEffect(() => { ScrollTrigger.refresh(); }, [filteredWatched]);

  entryRefs.current = [];

  return (
    <div className="page my-season">

      {/* ── Breadcrumb ── */}
      <div className="ms-subbar">
        <span className="ms-subbar__crumbs">
          Profil <em>/</em> <span>Ma Saison</span> <em>/</em> Journal des courses
        </span>
        <span>Saison 2026</span>
      </div>

      {/* ── Masthead ── */}
      <section className="ms-head">
        <div className="ms-head__ghost" aria-hidden="true">26</div>
        <div className="ms-head__left">
          <h1 className="ms-title">MA <span className="accent">SAISON</span></h1>
          <div className="ms-sub">
            <span>{count} COURSE{count !== 1 ? 'S' : ''} REGARDÉE{count !== 1 ? 'S' : ''}</span>
            <span className="silver">· JOURNAL CHRONOLOGIQUE · SAISON 2026</span>
          </div>
        </div>
        <div className="ms-head__right">
          <div className="ms-progress">
            <div className="ms-progress__lbl">
              <span>/ Progression saison</span>
              <b>{count} / {totalRaces}</b>
            </div>
            <div className="ms-progress__track">
              <div className="ms-progress__fill" ref={progressRef} />
            </div>
            <div className="ms-progress__pct">{progressPct} % · {progressPct >= 50 ? 'MI-SAISON' : 'EN COURS'}</div>
          </div>
        </div>
      </section>

      {/* ── Meta strip ── */}
      <section className="ms-metabar">
        <div className="ms-metacell">
          <div className="ms-meta-k">/ Courses regardées</div>
          <div className="ms-meta-v"><span className="red">{String(count).padStart(2,'0')}</span><span className="u">/ 24</span></div>
        </div>
        <div className="ms-metacell">
          <div className="ms-meta-k">/ Sprints regardés</div>
          <div className="ms-meta-v">{String(watchedRaces.filter(r => r.isSprint).length).padStart(2,'0')}<span className="u">/ 06</span></div>
        </div>
        <div className="ms-metacell">
          <div className="ms-meta-k">/ Continents visités</div>
          <div className="ms-meta-v">
            {new Set(watchedRaces.map(r => r.continent)).size}
            <span className="u">continents</span>
          </div>
        </div>
        <div className="ms-metacell">
          <div className="ms-meta-k">/ Progression</div>
          <div className="ms-meta-v">{progressPct}<span className="u">%</span></div>
        </div>
      </section>

      {/* ── Filters ── */}
      <div className="filter-row">
        <span className="filter-row__label">/ Continent</span>
        <div className="filter-pills">
          {CONTINENTS.map((c) => (
            <button
              key={c}
              className={`filter-pill${selectedContinent === c ? ' active' : ''}`}
              onClick={() => setSelectedContinent(c)}
            >
              {CONTINENT_LABELS[c]}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-row">
        <span className="filter-row__label">/ Type</span>
        <div className="filter-pills">
          {TYPES.map((t) => (
            <button
              key={t}
              className={`filter-pill${selectedType === t ? ' active' : ''}`}
              onClick={() => setSelectedType(t)}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {count === 0 ? (
        <div className="ms-empty">
          <p>Aucune course marquée comme regardée — commence depuis la fiche d'un Grand Prix ✓</p>
        </div>
      ) : (
        <div ref={logRef}>

          {/* log table header */}
          <div className="ms-log-head">
            <h2><span className="num">§01</span>JOURNAL CHRONOLOGIQUE</h2>
            <span className="ms-log-head__date">Dates</span>
            <span className="ms-log-head__winner">Vainqueur</span>
            <span className="ms-log-head__status">Statut</span>
          </div>

          {filteredCount === 0 ? (
            <p className="ms-empty-filter">Aucune course ne correspond aux filtres sélectionnés.</p>
          ) : (
            <div className="ms-log">
              {filteredWatched.map((race, i) => (
                <article
                  key={race.id}
                  className={`ms-row${race.isSprint ? ' ms-row--sprint' : ''}`}
                  ref={(el) => { entryRefs.current[i] = el; }}
                >
                  <div className="ms-row__rn">
                    {String(race.round).padStart(2, '0')}
                  </div>
                  <div className="ms-row__gp">
                    <div className="ms-row__name">
                      <span className="flag">{flagEmoji(race.countryCode)}</span>
                      {race.name}
                    </div>
                    <div className="ms-row__circuit">
                      {race.circuit}
                      <span className="ms-sep">·</span>
                      {race.laps} T · {race.circuitLengthKm} KM
                    </div>
                  </div>
                  <div className="ms-row__date">
                    <b>{fmtShort(race.dateStart)}</b> — {fmtShort(race.dateEnd)}
                  </div>
                  <div className="ms-row__winner">—</div>
                  <div className="ms-row__status">
                    <span className="ms-tick">✓</span>REGARDÉ
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
