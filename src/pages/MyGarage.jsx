import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Flip } from 'gsap/Flip';
import gsap from 'gsap';
import races from '../data/races.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { FavoriteCard } from '../components/FavoriteCard.jsx';
import './MyGarage.css';

export const MyGarage = () => {
  const containerRef = useRef(null);
  const flipStateRef = useRef(null);

  const [favorites, setFavorites] = useLocalStorage('pitlane_favorites', []);

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
      {count > 0 && (
        <p className="my-garage__subtitle">
          {count} course{count > 1 ? 's' : ''} en garage
        </p>
      )}

      {count === 0 ? (
        <div className="garage-empty">
          <p>
            Aucune course en garage — ajoute des étoiles depuis le calendrier ★
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