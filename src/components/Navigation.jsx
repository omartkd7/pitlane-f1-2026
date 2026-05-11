import { NavLink } from 'react-router-dom';

export function Navigation() {
  return (
    <nav className="navigation">
      <div className="logo">
        <h2>PITLANE</h2>
      </div>
      <ul className="nav-links">
        <li>
          <NavLink to="/" end>Accueil</NavLink>
        </li>
        <li>
          <NavLink to="/calendrier">Calendrier</NavLink>
        </li>
        <li>
          <NavLink to="/mongarage">Mon Garage</NavLink>
        </li>
        <li>
          <NavLink to="/masaison">Ma Saison</NavLink>
        </li>
      </ul>
    </nav>
  );
}
