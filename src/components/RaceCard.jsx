import { forwardRef } from 'react';
import './RaceCard.css';

const flagEmoji = (code) =>
  [...code.toUpperCase()].map((c) =>
    String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)
  ).join('');

// Parse YYYY-MM-DD into local Date parts to avoid UTC timezone shift
const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
};

export const RaceCard = forwardRef(({ race }, ref) => {
  const year = race.dateStart.split('-')[0];

  return (
    <article ref={ref} className="race-card">
      <p className="race-card__round">Round {race.round}</p>

      <div className="race-card__header">
        <span className="race-card__flag" aria-hidden="true">
          {flagEmoji(race.countryCode)}
        </span>
        <h2 className="race-card__name">{race.name}</h2>
      </div>

      <p className="race-card__location">
        {race.city}, {race.country}
      </p>

      <p className="race-card__dates">
        {fmtDate(race.dateStart)} – {fmtDate(race.dateEnd)} {year}
      </p>

      <div className="race-card__badges">
        {race.isSprint && (
          <span className="badge badge--sprint">⚡ Sprint</span>
        )}
        {race.isNewCircuit && (
          <span className="badge badge--new">🆕 Nouveau</span>
        )}
      </div>
    </article>
  );
});

RaceCard.displayName = 'RaceCard';
