import { forwardRef } from 'react';
import './FavoriteCard.css';

const flagEmoji = (code) =>
  [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');

const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const FavoriteCard = forwardRef(({ race, onRemove }, ref) => (
  <article
    ref={ref}
    className="favorite-card"
    data-flip-id={race.id}
  >
    <span className="favorite-card__ghost" aria-hidden="true">
      {String(race.round).padStart(2, '0')}
    </span>

    <div className="favorite-card__top">
      <div>
        <p className="favorite-card__round">
          Round {String(race.round).padStart(2, '0')}
        </p>
        <h2 className="favorite-card__name">{race.name}</h2>
        <p className="favorite-card__circuit">{race.circuit}</p>
      </div>
      <span className="favorite-card__flag" aria-hidden="true">
        {flagEmoji(race.countryCode)}
      </span>
    </div>

    <div className="favorite-card__footer">
      <p className="favorite-card__date">
        {fmtDate(race.dateStart)} – {fmtDate(race.dateEnd)}
      </p>
      <button
        className="favorite-card__remove"
        onClick={() => onRemove(race.id)}
        aria-label={`Retirer ${race.name} des favoris`}
      >
        Retirer ✕
      </button>
    </div>
  </article>
));

FavoriteCard.displayName = 'FavoriteCard';