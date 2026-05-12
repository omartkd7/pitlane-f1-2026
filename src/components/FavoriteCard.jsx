import { forwardRef } from 'react';
import './FavoriteCard.css';

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

export const FavoriteCard = forwardRef(({ race, onRemove }, ref) => (
  <article
    ref={ref}
    className="fav-card"
    data-flip-id={race.id}
  >
    <span className="fav-card__ghost" aria-hidden="true">
      {String(race.round).padStart(2, '0')}
    </span>

    <div className="fav-card__top">
      <div className="fav-card__round">
        R {String(race.round).padStart(2, '0')}<span className="of"> / 24</span>
      </div>
      <div className="fav-card__badges">
        {race.isSprint     && <span className="badge badge--sprint">SPRINT</span>}
        {race.isNewCircuit && <span className="badge badge--new">NOUVEAU</span>}
        <button
          className="fav-bookmark"
          onClick={() => onRemove(race.id)}
          aria-label={`Retirer ${race.name} du garage`}
        />
      </div>
    </div>

    <div className="fav-card__mid">
      <h2 className="fav-card__name">{race.name}</h2>
      <p className="fav-card__circuit">{race.circuit} · {race.laps} T</p>
    </div>

    <div className="fav-card__footer">
      <span className="fav-card__flag" aria-hidden="true">
        {flagEmoji(race.countryCode)}
      </span>
      <span className="fav-card__dates">
        <b>{fmtShort(race.dateStart)}</b> — {fmtShort(race.dateEnd)}
      </span>
    </div>
  </article>
));

FavoriteCard.displayName = 'FavoriteCard';
