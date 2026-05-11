import { forwardRef } from 'react';
import './RaceCard.css';

const flagEmoji = (code) =>
  [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');

const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
};

export const RaceCard = forwardRef(({ race }, ref) => (
  <article ref={ref} className="race-card">
    <span className="race-card__ghost" aria-hidden="true">
      {String(race.round).padStart(2, '0')}
    </span>

    <div className="race-card__top">
      <span className="race-card__round">
        Round {String(race.round).padStart(2, '0')}
      </span>
      <div className="race-card__badges">
        {race.isSprint && (
          <span className="race-card__badge race-card__badge--sprint">Sprint</span>
        )}
        {race.isNewCircuit && (
          <span className="race-card__badge race-card__badge--new">New</span>
        )}
      </div>
    </div>

    <div className="race-card__body">
      <h2 className="race-card__name">{race.name}</h2>
      <p className="race-card__circuit">{race.circuit}</p>
    </div>

    <div className="race-card__footer">
      <span className="race-card__flag" aria-hidden="true">
        {flagEmoji(race.countryCode)}
      </span>
      <span className="race-card__dates">
        {fmtDate(race.dateStart)} – {fmtDate(race.dateEnd)}
      </span>
    </div>
  </article>
));

RaceCard.displayName = 'RaceCard';