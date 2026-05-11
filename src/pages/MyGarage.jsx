import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Flip } from 'gsap/Flip';
import races from '../data/races.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { FavoriteCard } from '../components/FavoriteCard.jsx';
import './MyGarage.css';

export const MyGarage = () => {
  // containerRef: Flip scope + exported for any future entrance animation
  const containerRef = useRef(null);

  // flipStateRef stores the pre-removal Flip snapshot across the render boundary.
  // It is written synchronously in handleRemove (before setState) and read
  // synchronously in useGSAP (after React commits the new DOM).
  const flipStateRef = useRef(null);

  const [favorites, setFavorites] = useLocalStorage('pitlane_favorites', []);

  // Derive sorted race objects; races not found in data are silently skipped
  const favoriteRaces = favorites
    .map((id) => races.find((r) => r.id === id))
    .filter(Boolean)
    .sort((a, b) => a.round - b.round);

  const handleRemove = (raceId) => {
    // ── Step 1: capture positions NOW, before React touches the DOM ──────────
    // querySelectorAll('[data-flip-id]') targets every card by its stable id.
    // This must happen synchronously here, not inside useGSAP.
    if (containerRef.current) {
      flipStateRef.current = Flip.getState(
        containerRef.current.querySelectorAll('[data-flip-id]')
      );
    }

    // ── Step 2: update state → React schedules a re-render ──────────────────
    setFavorites((prev) => prev.filter((id) => id !== raceId));
  };

  // ── Step 3: after React commits the updated DOM, animate the delta ─────────
  // useGSAP runs synchronously after layout (like useLayoutEffect), scoped to
  // containerRef so GSAP cleans up properly on unmount.
  // dependencies: [favorites] ensures this fires every time the list changes,
  // not just on mount.
  useGSAP(
    () => {
      // Guard: only run if a Flip snapshot was stored by handleRemove.
      // On initial mount or unrelated re-renders this is null → no-op.
      if (!flipStateRef.current) return;

      Flip.from(flipStateRef.current, {
        duration: 0.45,
        ease: 'power2.inOut',
        // absolute: true lets removed cards animate out independently
        // without displacing the cards that remain in flow
        absolute: true,
        // onLeave receives the removed elements (still measured in the snapshot
        // but absent from the new DOM) — animate them to invisible
        onLeave: (elements) =>
          gsap.to(elements, {
            opacity: 0,
            scale: 0.75,
            duration: 0.25,
            ease: 'power2.in',
          }),
      });

      // Clear after consuming so subsequent unrelated renders are no-ops
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
            Aucune course en garage — ajoute des étoiles depuis le calendrier ⭐
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