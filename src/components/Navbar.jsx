import { useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const navClass = ({ isActive }) =>
  ['nav-link', isActive ? 'nav-link--active' : ''].filter(Boolean).join(' ');

export const Navbar = () => {
  const navRef = useRef(null);

  useGSAP(() => {
    if (!navRef.current) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.nav-brand', {
        autoAlpha: 0,
        x: -20,
        duration: 0.5,
        ease: 'power2.out',
      });
      gsap.from('.nav-links > li', {
        autoAlpha: 0,
        y: -10,
        stagger: 0.08,
        duration: 0.4,
        ease: 'power2.out',
        delay: 0.15,
      });
    });
  }, { scope: navRef });

  return (
    <nav className="navbar" ref={navRef}>
      <Link to="/" className="nav-brand">
        PIT·LANE
      </Link>
      <ul className="nav-links">
        <li>
          <NavLink to="/" end className={navClass}>
            Accueil
          </NavLink>
        </li>
        <li>
          <NavLink to="/calendrier" className={navClass}>
            Calendrier
          </NavLink>
        </li>
        <li>
          <NavLink to="/mongarage" className={navClass}>
            Mon Garage
          </NavLink>
        </li>
        <li>
          <NavLink to="/masaison" className={navClass}>
            Ma Saison
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};