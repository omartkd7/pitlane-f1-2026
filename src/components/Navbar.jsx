import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const navClass = ({ isActive }) =>
  ['nav-link', isActive ? 'nav-link--active' : ''].filter(Boolean).join(' ');

export const Navbar = () => (
  <nav className="navbar">
    <Link to="/" className="nav-brand">
      🏁 PITLANE
    </Link>
    <ul className="nav-links">
      <li>
        <NavLink to="/" end className={navClass}>
          🏠 Accueil
        </NavLink>
      </li>
      <li>
        {/* no `end` — stays active on /calendrier/:raceId sub-routes */}
        <NavLink to="/calendrier" className={navClass}>
          📅 Calendrier
        </NavLink>
      </li>
      <li>
        <NavLink to="/mongarage" className={navClass}>
          🔧 Mon Garage
        </NavLink>
      </li>
      <li>
        <NavLink to="/masaison" className={navClass}>
          📊 Ma Saison
        </NavLink>
      </li>
    </ul>
  </nav>
);