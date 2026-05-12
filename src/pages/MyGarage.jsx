import { useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { Flip } from 'gsap/Flip';
import gsap from 'gsap';
import races from '../data/races.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { FavoriteCard } from '../components/FavoriteCard.jsx';
import './MyGarage.css';

export const MyGarage = () => {
  const containerRef = useRef(null);
  const cardRefs     = useRef([]);
  const flipStateRef = useRef(null);

  const [favorites, setFavorites] = useLocalStorage('pitlane_favorites', []);

  const favoriteRaces = favorites
    .map((id) => races.find((r) => r.id === id))
    .filter(Boolean)
    .sort((a, b) => a.round - b.round);

  // STEP 1 — Flip snapshot before state update
  const handleRemove = (raceId) => {
    flipStateRef.current = Flip.getState(cardRefs.current.filter(Boolean));
    setFavorites((prev) => prev.filter((id) => id !== raceId));
  };

  // STEP 2 — animate after DOM updates
  useLayoutEffect(() => {
    if (!flipStateRef.current) return;
    Flip.from(flipStateRef.current, {
      duration: 0.4,
      ease: 'power2.inOut',
      absolute: true,
      onLeave: (els) =>
        gsap.to(els, { opacity: 0, scale: 0.97, duration: 0.2 }),
    });
    flipStateRef.current = null;
  }, [favorites]);

  // entrance stagger
  useGSAP(() => {
    const cards = cardRefs.current.filter(Boolean);
    if (!cards.length) return;
    gsap.from(cards, {
      opacity: 0, y: 16, stagger: 0.07, duration: 0.4, ease: 'power2.out',
    });
  }, { scope: containerRef });

  const count        = favoriteRaces.length;
  const sprintCount  = favoriteRaces.filter((r) => r.isSprint).length;
  const nextFav      = favoriteRaces[0];

  cardRefs.current = [];

  return (
    <div className="page my-garage">

      {/* ── Breadcrumb ── */}
      <div className="mg-subbar">
        <span className="mg-subbar__crumbs">
          Profil <em>/</em> <span>Mon Garage</span> <em>/</em> Courses sauvegardées
        </span>
        <span>Saison 2026</span>
      </div>

      {/* ── Masthead ── */}
      <section className="mg-head">
        <div className="mg-head__ghost" aria-hidden="true">⚑</div>
        <div className="mg-head__left">
          <h1 className="mg-title">MON <span className="accent">GARAGE</span></h1>
          <div className="mg-sub">
            <span>{count} COURSE{count !== 1 ? 'S' : ''} SAUVEGARDÉE{count !== 1 ? 'S' : ''}</span>
            <span className="silver">· FILTRE CHRONOLOGIQUE · PROCHAINE EN PREMIER</span>
          </div>
        </div>
        {count > 0 && (
          <div className="mg-head__right">
            <button
              className="mg-clear-link"
              onClick={() => setFavorites([])}
            >
              <span className="mg-clear-x">✕</span>TOUT EFFACER
            </button>
          </div>
        )}
      </section>

      {/* ── Meta strip ── */}
      <section className="mg-metabar">
        <div className="mg-metacell">
          <div className="mg-meta-k">/ Total suivies</div>
          <div className="mg-meta-v"><span className="red">{String(count).padStart(2,'0')}</span><span className="sub">/ 24</span></div>
        </div>
        <div className="mg-metacell">
          <div className="mg-meta-k">/ Prochaine course</div>
          <div className="mg-meta-v">{nextFav ? nextFav.country.slice(0,3).toUpperCase() : '—'}</div>
        </div>
        <div className="mg-metacell">
          <div className="mg-meta-k">/ Sprints suivis</div>
          <div className="mg-meta-v">{String(sprintCount).padStart(2,'0')}<span className="sub">/ 06</span></div>
        </div>
        <div className="mg-metacell">
          <div className="mg-meta-k">/ Temps de course</div>
          <div className="mg-meta-v">~{Math.round(count * 1.6)}H<span className="sub">estimé</span></div>
        </div>
      </section>

      {/* ── Section header ── */}
      <div className="sec-head">
        <h2><span className="num">§01</span>COURSES SUIVIES</h2>
        <span className="meta-right">Affichées · <b style={{ color: 'var(--text)' }}>{count}</b></span>
      </div>

      {count === 0 ? (
        /* empty state */
        <div className="mg-empty">
          <div className="mg-empty__corners">
            <span className="etl" /><span className="etr" /><span className="ebl" /><span className="ebr" />
          </div>
          <span className="mg-empty__glyph" aria-hidden="true">⚑</span>
          <div className="mg-empty__title">VOTRE GARAGE EST VIDE</div>
          <div className="mg-empty__sub">Marquez des courses depuis le Calendrier</div>
          <Link to="/calendrier" className="mg-empty__cta">→ OUVRIR LE CALENDRIER</Link>
        </div>
      ) : (
        <div className="garage-grid" ref={containerRef}>
          {favoriteRaces.map((race, i) => (
            <FavoriteCard
              key={race.id}
              race={race}
              onRemove={handleRemove}
              ref={(el) => { cardRefs.current[i] = el; }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
