import { useRef, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { initPageOverlay } from './animations/cinematic.js';
import './animations/cinematic.css';
import { Navbar } from './components/Navbar';
import { ThemeProvider } from './context/ThemeContext';
import { Home } from './pages/Home';
import { Calendar } from './pages/Calendar';
import { RaceDetails } from './pages/RaceDetails';
import { MyGarage } from './pages/MyGarage';
import { MySeason } from './pages/MySeason';
import { Drivers } from './pages/Drivers';
import { Teams } from './pages/Teams';
import { CircuitDetail } from './pages/CircuitDetail';
import { Alerts } from './pages/Alerts';

const NotFound = () => (
  <div className="page not-found">
    <h1>404</h1>
    <p>Page non trouvée.</p>
  </div>
);

export const App = () => {
  const location    = useLocation();
  const pageWrapRef = useRef(null);

  /* Fire the black launch veil once on first mount */
  useEffect(() => { initPageOverlay(); }, []);

  // clean page transition — fade + lift on every route change
  useGSAP(() => {
    if (!pageWrapRef.current) return;
    gsap.fromTo(
      pageWrapRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
  }, { dependencies: [location.pathname] });

  return (
    <ThemeProvider>
    <div className="app-container">
      {/* Black veil that fades away on load — see cinematic.js */}
      <div className="anim-overlay" aria-hidden="true" />
      {/* Viewport corner ticks */}
      <div className="ticks" aria-hidden="true">
        <span className="tl" />
        <span className="tr" />
        <span className="bl" />
        <span className="br" />
      </div>

      {/* Status bar */}
      <div className="status-bar">
        <div className="status-bar__inner">
          <span>FR · Saison 2026 · 24 Grands Prix</span>
          <span className="status-bar__live">
            <span className="blink-dot" />
            Companion non officiel · Live
          </span>
          <span>Édition 2026</span>
        </div>
      </div>

      <Navbar />

      <main className="content" ref={pageWrapRef}>
        <Routes>
          <Route path="/"                  element={<Home />} />
          <Route path="/calendrier"        element={<Calendar />} />
          <Route path="/calendrier/:raceId" element={<RaceDetails />} />
          <Route path="/mongarage"         element={<MyGarage />} />
          <Route path="/masaison"          element={<MySeason />} />
          <Route path="/pilotes"           element={<Drivers />} />
          <Route path="/ecuriess"          element={<Teams />} />
          <Route path="/circuits/:circuitId" element={<CircuitDetail />} />
          <Route path="/alertes"           element={<Alerts />} />
          <Route path="*"                  element={<NotFound />} />
        </Routes>
      </main>
    </div>
    </ThemeProvider>
  );
};
