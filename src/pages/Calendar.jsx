import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import races from '../data/races.js';
import { RaceCard } from '../components/RaceCard.jsx';
import './Calendar.css';

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
  Sprint: 'Sprint',
  Standard: 'Standard',
};

export const Calendar = () => {
  const containerRef = useRef(null);

  const [selectedContinent, setSelectedContinent] = useState('Tous');
  const [selectedType, setSelectedType] = useState('Tous');

  const filteredRaces = useMemo(() => {
    return races.filter((race) => {
      const continentMatch =
        selectedContinent === 'Tous' || race.continent === selectedContinent;
      const typeMatch =
        selectedType === 'Tous' ||
        (selectedType === 'Sprint' && race.isSprint) ||
        (selectedType === 'Standard' && !race.isSprint);
      return continentMatch && typeMatch;
    });
  }, [selectedContinent, selectedType]);

  // Per-card ScrollTrigger — re-runs on every filter change, previous triggers auto-cleaned
  useGSAP(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.race-card');
    if (!cards.length) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      cards.forEach((card) => {
        gsap.from(card, {
          autoAlpha: 0,
          y: 30,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        });
      });
      ScrollTrigger.refresh();
    });
  }, { scope: containerRef, dependencies: [filteredRaces] });

  const gp = filteredRaces.length;
  const subtitle = `${gp} Grand${gp > 1 ? 's' : ''} Prix`;

  return (
    <div className="page calendar">
      <h1 className="calendar__title">Calendrier 2026</h1>
      <p className="calendar__subtitle">{subtitle}</p>

      {/* ── Filters ── */}
      <div className="calendar__filters">
        <div className="filter-group">
          <span className="filter-group__label">Continent</span>
          <div className="filter-group__buttons">
            {CONTINENTS.map((c) => (
              <button
                key={c}
                className={`filter-btn${selectedContinent === c ? ' filter-btn--active' : ''}`}
                onClick={() => setSelectedContinent(c)}
              >
                {CONTINENT_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group__label">Type</span>
          <div className="filter-group__buttons">
            {TYPES.map((t) => (
              <button
                key={t}
                className={`filter-btn${selectedType === t ? ' filter-btn--active' : ''}`}
                onClick={() => setSelectedType(t)}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid or empty state ── */}
      {filteredRaces.length === 0 ? (
        <p className="calendar__empty">
          Aucune course ne correspond aux filtres sélectionnés.
        </p>
      ) : (
        <div className="race-grid" ref={containerRef}>
          {filteredRaces.map((race) => (
            <Link
              key={race.id}
              to={`/calendrier/${race.id}`}
              className="race-grid__link"
            >
              <RaceCard race={race} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};