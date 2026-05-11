import './FilterBar.css';

export const FilterBar = ({
  continents,
  continentLabels,
  types,
  typeLabels,
  selectedContinent,
  selectedType,
  onContinentChange,
  onTypeChange,
}) => (
  <div className="filter-bar">
    <div className="filter-bar__group">
      <span className="filter-bar__label">Continent</span>
      <div className="filter-bar__buttons">
        {continents.map((c) => (
          <button
            key={c}
            className={`filter-btn${selectedContinent === c ? ' filter-btn--active' : ''}`}
            onClick={() => onContinentChange(c)}
          >
            {continentLabels[c]}
          </button>
        ))}
      </div>
    </div>

    <div className="filter-bar__group">
      <span className="filter-bar__label">Type</span>
      <div className="filter-bar__buttons">
        {types.map((t) => (
          <button
            key={t}
            className={`filter-btn${selectedType === t ? ' filter-btn--active' : ''}`}
            onClick={() => onTypeChange(t)}
          >
            {typeLabels[t]}
          </button>
        ))}
      </div>
    </div>
  </div>
);