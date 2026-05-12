import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Calendar } from './pages/Calendar';
import { RaceDetails } from './pages/RaceDetails';
import { MyGarage } from './pages/MyGarage';
import { MySeason } from './pages/MySeason';
import { F1Car } from './components/F1Car';

const NotFound = () => (
  <div className="page not-found">
    <h1>404</h1>
    <p>Page non trouvée.</p>
  </div>
);

export const App = () => {
  const location = useLocation();
  const [isDriving, setIsDriving] = useState(false);

  useGSAP(() => {
    // Prevent animation on initial load, only on route changes
    if (location.key === 'default') return; // Not perfect, but we can animate every time

    setIsDriving(true);

    // Position it off-screen left and slightly randomly on Y
    const randomY = Math.random() * 60 + 10; // Between 10vh and 70vh
    gsap.set('.global-f1-car', { x: '-100vw', y: `${randomY}vh`, opacity: 1 });

    // Animate to right side
    gsap.to('.global-f1-car', {
      x: '110vw',
      duration: 1.2,
      ease: 'power2.inOut',
      onComplete: () => {
        setIsDriving(false);
        gsap.set('.global-f1-car', { opacity: 0 }); // Hide when not driving
      }
    });
  }, { dependencies: [location.pathname] });

  return (
    <div className="app-container">
      <Navbar />

      {/* Global animated car */}
      <div className="global-f1-car-wrapper" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
        <F1Car isDriving={isDriving} className="global-f1-car" />
      </div>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendrier" element={<Calendar />} />
          <Route path="/calendrier/:raceId" element={<RaceDetails />} />
          <Route path="/mongarage" element={<MyGarage />} />
          <Route path="/masaison" element={<MySeason />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};
