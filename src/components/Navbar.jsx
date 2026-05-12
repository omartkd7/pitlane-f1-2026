import { useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const navClass = ({ isActive }) =>
  ['nav-link', isActive ? 'nav-link--active' : ''].filter(Boolean).join(' ');

const LINKS = [
  { to: '/',           end: true,  num: '01', label: 'PADDOCK'    },
  { to: '/calendrier', end: false, num: '02', label: 'CALENDRIER' },
  { to: '/mongarage',  end: false, num: '03', label: 'MON GARAGE' },
  { to: '/masaison',   end: false, num: '04', label: 'MA SAISON'  },
  { to: '/pilotes',    end: false, num: '05', label: 'PILOTES'    },
  { to: '/ecuriess',   end: false, num: '06', label: 'ÉCURIES'    },
  { to: '/alertes',    end: false, num: '07', label: 'ALERTES'    },
];

export const Navbar = () => {
  const navRef = useRef(null);

  // entrance stagger
  useGSAP(() => {
    if (!navRef.current) return;
    gsap.from([...navRef.current.querySelectorAll('.nav-brand, .nav-link')], {
      opacity: 0,
      y: -8,
      stagger: 0.06,
      duration: 0.35,
      ease: 'power2.out',
    });
  }, { scope: navRef });

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar__inner">
        <Link to="/" className="nav-brand">
          PIT
          <span className="nav-brand__dot" aria-hidden="true" />
          LANE
        </Link>

        <ul className="nav-links">
          {LINKS.map(({ to, end, num, label }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={navClass}>
                <span className="nav-num">{num}</span>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
