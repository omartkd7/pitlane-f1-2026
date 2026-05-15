import { useRef, useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useTheme } from '../context/ThemeContext';

const navClass = ({ isActive }) =>
  ['nav-link', isActive ? 'nav-link--active' : ''].filter(Boolean).join(' ');

const LINKS = [
  { to: '/',           end: true,  num: '01', label: 'PADDOCK'    },
  { to: '/calendrier', end: false, num: '02', label: 'CALENDRIER' },
  { to: '/mongarage',  end: false, num: '03', label: 'GARAGE'     },
  { to: '/masaison',   end: false, num: '04', label: 'SAISON'     },
  { to: '/pilotes',    end: false, num: '05', label: 'PILOTES'    },
  { to: '/ecuriess',   end: false, num: '06', label: 'ÉCURIES'    },
  { to: '/alertes',    end: false, num: '07', label: 'ALERTES'    },
];

export const Navbar = () => {
  const navRef       = useRef(null);
  const linksRef     = useRef([]);
  const indicatorRef = useRef(null);
  const overlayRef   = useRef(null);
  const overlayLinksRef = useRef([]);

  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme, accentId, setAccentId, teams } = useTheme();

  /* ── Entrance: brand elastic slam + links stagger ─────── */
  useGSAP(() => {
    if (!navRef.current) return;
    const brand = navRef.current.querySelector('.nav-brand');
    const items = [...navRef.current.querySelectorAll('.nav-link, .nav-theme-btn, .nav-team-select')];

    if (brand) {
      gsap.from(brand, {
        opacity: 0,
        scale: 0.72,
        duration: 0.85,
        ease: 'elastic.out(1.1, 0.45)',
      });
    }
    gsap.from(items, {
      opacity: 0,
      y: -10,
      stagger: 0.055,
      duration: 0.38,
      ease: 'power2.out',
      delay: 0.14,
    });
  }, { scope: navRef });

  /* ── Sliding indicator on route change ───────────────── */
  useEffect(() => {
    if (!indicatorRef.current || !navRef.current) return;
    const activeLink = navRef.current.querySelector('.nav-link--active');
    if (!activeLink) return;

    const navRect  = navRef.current.querySelector('.nav-links').getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    gsap.to(indicatorRef.current, {
      x:        linkRect.left - navRect.left,
      width:    linkRect.width,
      duration: 0.4,
      ease: 'power3.out',
    });
  }, [location.pathname]);

  /* ── Mobile overlay open/close ───────────────────────── */
  useEffect(() => {
    const overlay = overlayRef.current;
    const links   = overlayLinksRef.current.filter(Boolean);
    const bottom  = overlay?.querySelector('.nav-overlay__bottom');
    if (!overlay) return;

    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      gsap.set(overlay, { opacity: 0 });
      overlay.classList.add('is-open');
      gsap.to(overlay, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.fromTo(links,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, stagger: 0.07, duration: 0.4, ease: 'power3.out', delay: 0.1 }
      );
      if (bottom) gsap.fromTo(bottom, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.35 });
    } else {
      document.body.style.overflow = '';
      gsap.to(overlay, {
        opacity: 0, duration: 0.2, ease: 'power2.in',
        onComplete: () => overlay.classList.remove('is-open'),
      });
    }

    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  /* Close overlay on route change */
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <>
      <nav className="navbar" ref={navRef}>
        <div className="navbar__inner">
          <Link to="/" className="nav-brand">
            PIT<span className="nav-brand__dot" aria-hidden="true" />LANE
          </Link>

          {/* Desktop links + sliding indicator */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', height: '100%' }}>
            <ul className="nav-links" ref={el => { if (el) linksRef.current = el; }}>
              {LINKS.map(({ to, end, num, label }) => (
                <li key={to}>
                  <NavLink to={to} end={end} className={navClass}>
                    <span className="nav-num">{num}</span>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
            {/* Sliding red underline */}
            <span className="nav-indicator" ref={indicatorRef} aria-hidden="true" />
          </div>

          {/* Right controls */}
          <div className="nav-controls">
            {/* Team colour selector */}
            <select
              className="nav-team-select"
              value={accentId}
              onChange={e => setAccentId(e.target.value)}
              aria-label="Select team colour theme"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            {/* Dark / light toggle */}
            <button className="nav-theme-btn" onClick={toggleTheme} aria-label="Toggle dark/light mode">
              {theme === 'dark' ? '☀ LIGHT' : '◑ DARK'}
            </button>
          </div>

          {/* Hamburger */}
          <button
            className={`nav-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      <div className="nav-overlay" ref={overlayRef} role="dialog" aria-modal="true" aria-label="Navigation">
        {LINKS.map(({ to, end, num, label }, i) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="nav-overlay__link"
            ref={el => { overlayLinksRef.current[i] = el; }}
          >
            <span className="nav-overlay__num">{num}</span>{label}
          </NavLink>
        ))}

        <div className="nav-overlay__bottom">
          <select
            className="nav-team-select"
            value={accentId}
            onChange={e => setAccentId(e.target.value)}
          >
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button className="nav-theme-btn" onClick={toggleTheme}>
            {theme === 'dark' ? '☀ LIGHT MODE' : '◑ DARK MODE'}
          </button>
        </div>
      </div>
    </>
  );
};
