import { forwardRef } from 'react';
import './FavoriteCard.css';

const flagEmoji = (code) =>
  [...code.toUpperCase()].map((c) =>
    String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)
  ).join('');

const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const FavoriteCard = forwardRef(({ race, onRemove }, ref) => (
  <article
    ref={ref}
    className="favorite-card"
    // data-flip-id is the stable key GSAP Flip uses to match this element
    // across snapshots — must be unique and must survive the state update
    data-flip-id={race.id}
  >
    <p className="favorite-card__round">Round {race.round} / 24</p>

    <div className="favorite-card__header">
      <span className="favorite-card__flag" aria-hidden="true">
        {flagEmoji(race.countryCode)}
      </span>
      <h2 className="favorite-card__name">{race.name}</h2>
    </div>

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
  </article>
));

FavoriteCard.displayName = 'FavoriteCard';