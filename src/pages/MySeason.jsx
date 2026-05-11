import { useState, useMemo, useRef } from 'react';
import races from '../data/races.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { FilterBar } from '../components/FilterBar.jsx';
import './MySeason.css';

// ─── Filter options ───────────────────────────────────────────────────────────

const CONTINENTS = ['Tous', 'Europe', 'Americas', 'Asia', 'Oceania', 'MiddleEast'];
const CONTINENT_LABELS = {
  Tous: 'Tous',
  Europe: 'Europe',
  Americas: 'Amériques',
  Asia: 'Asie',
  Oceania: 'Océanie',
  MiddleEast: 'Moyen-Orient',
};

const TYPES = ['Tous', 'Sprint', 'Standard'];
const TYPE_LABELS = {
  Tous: 'Tous',
  Sprint: '⚡ Sprint',
  Standard: 'Standard',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const flagEmoji = (code) =>
  [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');

const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// ─── Component ────────────────────────────────────────────────────────────────

export const MySeason = () => {
  // logRef: ScrollTrigger reveal animation target
  const logRef = useRef(null);

  // useLocalStorage reads once on mount via lazy initializer — no polling
  const [watched] = useLocalStorage('pitlane_watched', []);

  const [selectedContinent, setSelectedContinent] = useState('Tous');
  const [selectedType, setSelectedType] = useState('Tous');

  // Derive sorted race objects from watched ids — stable across filter changes
  const watchedRaces = useMemo(
    () =>
      watched
        .map((id) => races.find((r) => r.id === id))
        .filter(Boolean)
        .sort((a, b) => a.round - b.round),
    [watched]
  );

  // Apply continent + type filters — stats derive from this, not watchedRaces
  const filteredWatched = useMemo(
    () =>
      watchedRaces.filter((race) => {
        const continentMatch =
          selectedContinent === 'Tous' || race.continent === selectedContinent;
        const typeMatch =
          selectedType === 'Tous' ||
          (selectedType === 'Sprint' && race.isSprint) ||
          (selectedType === 'Standard' && !race.isSprint);
        return continentMatch && typeMatch;
      }),
    [watchedRaces, selectedContinent, selectedType]
  );

  const count = filteredWatched.length;
  const sprintCount = filteredWatched.filter((r) => r.isSprint).length;

  return (
    <div className="page my-season">
      <h1 className="my-season__title">Ma Saison</h1>

      {watchedRaces.length > 0 && (
        <p className="my-season__subtitle">
          {count} course{count !== 1 ? 's' : ''} regardée{count !== 1 ? 's' : ''} sur 24
          {sprintCount > 0 && ` — ${sprintCount} sprint${sprintCount > 1 ? 's' : ''}`}
        </p>
      )}

      <FilterBar
        continents={CONTINENTS}
        continentLabels={CONTINENT_LABELS}
        types={TYPES}
        typeLabels={TYPE_LABELS}
        selectedContinent={selectedContinent}
        selectedType={selectedType}
        onContinentChange={setSelectedContinent}
        onTypeChange={setSelectedType}
      />

      {watchedRaces.length === 0 ? (
        <div className="season-empty">
          <p>
            Aucune course marquée comme regardée — commence depuis la fiche d'un Grand Prix ✓
          </p>
        </div>
      ) : filteredWatched.length === 0 ? (
        <p className="season__empty-filter">
          Aucune course ne correspond aux filtres sélectionnés.
        </p>
      ) : (
        <ol className="season-log" ref={logRef}>
          {filteredWatched.map((race) => (
            <li key={race.id} className="season-entry">
              <span className="season-entry__round">R{race.round}</span>
              <span className="season-entry__flag" aria-hidden="true">
                {flagEmoji(race.countryCode)}
              </span>
              <div className="season-entry__info">
                <h2 className="season-entry__name">{race.name}</h2>
                <p className="season-entry__date">
                  {fmtDate(race.dateStart)} – {fmtDate(race.dateEnd)}
                </p>
              </div>
              <div className="season-entry__badges">
                <span className="season-badge season-badge--continent">
                  {CONTINENT_LABELS[race.continent]}
                </span>
                {race.isSprint && (
                  <span className="season-badge season-badge--sprint">⚡ Sprint</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};