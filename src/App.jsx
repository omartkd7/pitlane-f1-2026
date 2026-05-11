import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Calendar } from './pages/Calendar';
import { RaceDetails } from './pages/RaceDetails';
import { MyGarage } from './pages/MyGarage';
import { MySeason } from './pages/MySeason';

export const App = () => {
  return (
    <div className="app-container">
      {/* Persistent navigation component */}
      <Navbar />

      {/* Route definitions */}
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendrier" element={<Calendar />} />
          <Route path="/calendrier/:raceId" element={<RaceDetails />} />
          <Route path="/mongarage" element={<MyGarage />} />
          <Route path="/masaison" element={<MySeason />} />
        </Routes>
      </main>
    </div>
  );
};
