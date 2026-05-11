import React from 'react';
import { NavLink } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">PITLANE F1 2026</div>
      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            Accueil
          </NavLink>
        </li>
        <li>
          <NavLink to="/calendrier" className={({ isActive }) => (isActive ? 'active' : '')}>
            Calendrier
          </NavLink>
        </li>
        <li>
          <NavLink to="/mongarage" className={({ isActive }) => (isActive ? 'active' : '')}>
            Mon Garage
          </NavLink>
        </li>
        <li>
          <NavLink to="/masaison" className={({ isActive }) => (isActive ? 'active' : '')}>
            Ma Saison
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
