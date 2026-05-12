import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { Flip } from 'gsap/Flip';
import gsap from 'gsap';
import races from '../data/races.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { FavoriteCard } from '../components/FavoriteCard.jsx';
import { F1Car } from '../components/F1Car.jsx';
import './MyGarage.css';

const PRESET_COLORS = [
  { name: 'Ferrari Red', primary: '#FF1801', accent: '#FFE800' },
  { name: 'Mercedes Silver', primary: '#C0C0C0', accent: '#00D2BE' },
  { name: 'Red Bull Blue', primary: '#0600EF', accent: '#CC0000' },
  { name: 'McLaren Papaya', primary: '#FF8000', accent: '#47C7FC' },
  { name: 'Aston Green', primary: '#006F62', accent: '#CEDC00' },
  { name: 'Alpine Pink', primary: '#FF87BC', accent: '#0090FF' },
];

export const MyGarage = () => {
  const containerRef = useRef(null);
  const flipStateRef = useRef(null);

  const [favorites, setFavorites] = useLocalStorage('pitlane_favorites', []);
  const [carConfig, setCarConfig] = useLocalStorage('pitlane_car_config', PRESET_COLORS[0]);

  const favoriteRaces = favorites
    .map((id) => races.find((r) => r.id === id))
    .filter(Boolean)
    .sort((a, b) => a.round - b.round);

  const handleRemove = (raceId) => {
    // Step 1: capture positions before React touches the DOM
    if (containerRef.current) {
      flipStateRef.current = Flip.getState(
        containerRef.current.querySelectorAll('[data-flip-id]')
      );
    }
    // Step 2: trigger re-render
    setFavorites((prev) => prev.filter((id) => id !== raceId));
  };

  // GSAP entrance — runs once on mount
  useGSAP(() => {
    if (!containerRef.current) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.garage-customization', {
        autoAlpha: 0,
        y: -30,
        duration: 0.6,
        ease: 'power2.out',
      });
      gsap.from(Array.from(containerRef.current.children), {
        autoAlpha: 0,
        y: 30,
        stagger: { each: 0.08 },
        duration: 0.55,
        ease: 'power2.out',
      });
    });
  }, { scope: containerRef });

  // GSAP Flip — runs after every favorites change to animate removal
  useGSAP(
    () => {
      if (!flipStateRef.current) return;
      Flip.from(flipStateRef.current, {
        duration: 0.45,
        ease: 'power2.inOut',
        absolute: true,
        onLeave: (elements) =>
          gsap.to(elements, {
            opacity: 0,
            scale: 0.75,
            duration: 0.25,
            ease: 'power2.in',
          }),
      });
      flipStateRef.current = null;
    },
    { scope: containerRef, dependencies: [favorites] }
  );

  const count = favoriteRaces.length;

  return (
    <div className="page my-garage">
      <h1 className="my-garage__title">Mon Garage</h1>
      
      {/* ── Car Customization Section ── */}
      <div className="garage-customization">
        <div className="garage-customization__showcase">
          <F1Car 
            isDriving={false} 
            className="garage-showcase-car" 
            primaryColor={carConfig.primary} 
            accentColor={carConfig.accent} 
          />
        </div>
        
        <div className="garage-customization__controls">
          <h2 className="controls-title">Personnaliser la monoplace</h2>
          <div className="color-presets">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.name}
                className={`color-btn ${carConfig.name === preset.name ? 'color-btn--active' : ''}`}
                style={{ '--btn-primary': preset.primary, '--btn-accent': preset.accent }}
                onClick={() => setCarConfig(preset)}
                aria-label={`Sélectionner la couleur ${preset.name}`}
                title={preset.name}
              />
            ))}
          </div>
          <p className="selected-color-name">{carConfig.name}</p>
        </div>
      </div>

      <div className="garage-divider"></div>

      {/* ── Favorites Section ── */}
      <h2 className="my-garage__subtitle" style={{ margin: 0, fontSize: '18px' }}>
        Mes Courses Favorites ({count})
      </h2>

      {count === 0 ? (
        <div className="garage-empty">
          <p>
            Aucune course en favori — ajoute des étoiles depuis le calendrier ★
          </p>
        </div>
      ) : (
        <div className="garage-grid" ref={containerRef}>
          {favoriteRaces.map((race) => (
            <FavoriteCard
              key={race.id}
              race={race}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};