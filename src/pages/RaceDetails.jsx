import { useParams, Link } from 'react-router-dom';
import races from '../data/races.js';

// ISO 3166-1 alpha-2 → flag emoji via Unicode regional indicators
const flagEmoji = (code) =>
  [...code.toUpperCase()].map((c) =>
    String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)
  ).join('');

// Construct Date from parts to avoid UTC-vs-local timezone shift
const formatDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const RaceDetails = () => {
  const { raceId } = useParams();
  const race = races.find((r) => r.id === raceId);

  if (!race) {
    return (
      <div className="page race-details race-details--not-found">
        <Link to="/calendrier" className="back-link">
          ← Retour au calendrier
        </Link>
        <h1>Course introuvable</h1>
        <p>
          Aucune course ne correspond à l'identifiant{' '}
          <code>{raceId}</code>.
        </p>
      </div>
    );
  }

  const totalDistance = (race.laps * race.circuitLengthKm).toFixed(1);

  return (
    <div className="page race-details">
      <Link to="/calendrier" className="back-link">
        ← Retour au calendrier
      </Link>

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

      <div className="race-badges">
        {race.isSprint && (
          <span className="badge badge--sprint">⚡ Week-end Sprint</span>
        )}
        {race.isNewCircuit && (
          <span className="badge badge--new">🆕 Nouveau circuit</span>
        )}
      </div>

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

      <section className="race-description">
        <p>{race.description}</p>
      </section>
    </div>
  );
};