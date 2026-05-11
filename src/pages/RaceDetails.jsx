import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import races from '../data/races.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import './RaceDetail.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const flagEmoji = (code) =>
  [...code.toUpperCase()].map((c) =>
    String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)
  ).join('');

const formatDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// ─── Component ────────────────────────────────────────────────────────────────

export const RaceDetails = () => {
  // pageRef attached to root element — GSAP entrance animation targets this
  const pageRef = useRef(null);

  const { raceId } = useParams();
  const navigate = useNavigate();

  // useLocalStorage reads from localStorage synchronously on first render
  // (lazy initializer), so state is correct before the first paint — no flash
  const [favorites, setFavorites] = useLocalStorage('pitlane_favorites', []);
  const [watched, setWatched] = useLocalStorage('pitlane_watched', []);

  const race = races.find((r) => r.id === raceId);

  if (!race) {
    return (
      <div className="page race-detail race-detail--not-found" ref={pageRef}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Retour
        </button>
        <h1>Course introuvable</h1>
        <p>
          Aucune course ne correspond à l'identifiant{' '}
          <code>{raceId}</code>.
        </p>
      </div>
    );
  }

  const isFavorite = favorites.includes(raceId);
  const isWatched = watched.includes(raceId);

  const toggleFavorite = () =>
    setFavorites(
      isFavorite
        ? favorites.filter((id) => id !== raceId)
        : [...favorites, raceId]
    );

  const toggleWatched = () =>
    setWatched(
      isWatched
        ? watched.filter((id) => id !== raceId)
        : [...watched, raceId]
    );

  const totalDistance = (race.laps * race.circuitLengthKm).toFixed(1);

  return (
    <div className="page race-detail" ref={pageRef}>

      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Retour
      </button>

      {/* ── Header ── */}
      <header className="race-header">
        <span className="race-flag" aria-hidden="true">
          {flagEmoji(race.countryCode)}
        </span>
        <div className="race-header__text">
          <p className="race-round">Round {race.round} / 24</p>
          <h1 className="race-name">{race.name}</h1>
          <p className="race-location">
            {race.city}, {race.country}
          </p>
        </div>
      </header>

      {/* ── Weekend badges ── */}
      {(race.isSprint || race.isNewCircuit) && (
        <div className="race-badges">
          {race.isSprint && (
            <span className="badge badge--sprint">⚡ Week-end Sprint</span>
          )}
          {race.isNewCircuit && (
            <span className="badge badge--new">🆕 Nouveau circuit</span>
          )}
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="race-actions">
        <button
          className={`action-btn action-btn--favorite${isFavorite ? ' action-btn--active' : ''}`}
          onClick={toggleFavorite}
          aria-pressed={isFavorite}
        >
          {isFavorite ? '⭐ Dans les favoris' : '☆ Ajouter aux favoris'}
        </button>

        <button
          className={`action-btn action-btn--watched${isWatched ? ' action-btn--active' : ''}`}
          onClick={toggleWatched}
          aria-pressed={isWatched}
        >
          {isWatched ? '✓ Regardé' : '○ J\'ai regardé ça'}
        </button>
      </div>

      {/* ── Info grid ── */}
      <section className="race-info-grid">
        <div className="race-info-item">
          <span className="label">Circuit</span>
          <span className="value">{race.circuit}</span>
        </div>
        <div className="race-info-item">
          <span className="label">Dates</span>
          <span className="value">
            {formatDate(race.dateStart)} – {formatDate(race.dateEnd)}
          </span>
        </div>
        <div className="race-info-item">
          <span className="label">Continent</span>
          <span className="value">{race.continent}</span>
        </div>
        <div className="race-info-item">
          <span className="label">Tours</span>
          <span className="value">{race.laps} tours</span>
        </div>
        <div className="race-info-item">
          <span className="label">Longueur du circuit</span>
          <span className="value">{race.circuitLengthKm} km</span>
        </div>
        <div className="race-info-item">
          <span className="label">Distance totale</span>
          <span className="value">≈ {totalDistance} km</span>
        </div>
      </section>

      {/* ── Editorial description ── */}
      <section className="race-description">
        <p>{race.description}</p>
      </section>

    </div>
  );
};