/**
 * StandingsDashboard — Drivers | Constructors | Race Calendar
 *
 * Tries the Jolpica F1 API (Ergast replacement) for live driver standings.
 * Falls back silently to local 2026 data on any network/parse error.
 * Points counters animate from 0 on first scroll-into-view.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import driversLocal from '../data/drivers.js';
import teamsLocal   from '../data/teams.js';
import racesLocal   from '../data/races.js';
import './StandingsDashboard.css';

/* ── Helpers ─────────────────────────────────────────────── */
const flagEmoji = (code) =>
  [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');

const fmtShort = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d)
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    .toUpperCase();
};

/* Map an Ergast/Jolpica constructor name → local team color */
const teamColorFor = (constructorName) => {
  const needle = (constructorName ?? '').toLowerCase();
  return (
    teamsLocal.find((t) => needle.includes(t.name.toLowerCase().split(' ')[0]))?.color
    ?? '#9A9A96'
  );
};

const TABS = ['DRIVERS', 'CONSTRUCTORS', 'CALENDAR'];

/* ── Component ───────────────────────────────────────────── */
export const StandingsDashboard = () => {
  const sectionRef  = useRef(null);
  const rowRefs     = useRef([]);
  const [tab, setTab]           = useState('DRIVERS');
  const [apiDrivers, setApiDrivers] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [visible, setVisible]   = useState(false);

  const today = new Date().toISOString().split('T')[0];

  /* ── IntersectionObserver ───────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.06 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ── Row stagger on reveal / tab change ─────────────────── */
  useGSAP(() => {
    if (!visible) return;
    const rows = rowRefs.current.filter(Boolean);
    if (!rows.length) return;
    gsap.fromTo(
      rows,
      { opacity: 0, x: -14 },
      { opacity: 1, x: 0, stagger: 0.03, duration: 0.38, ease: 'power2.out' }
    );
  }, { dependencies: [visible, tab, apiDrivers], scope: sectionRef });

  /* ── Points counter animation ───────────────────────────── */
  const animateCounters = useCallback(() => {
    if (!sectionRef.current) return;
    sectionRef.current.querySelectorAll('.sdb-pts[data-pts]').forEach((el) => {
      const target = Number(el.dataset.pts);
      let n = 0;
      const step = () => {
        n = Math.min(n + Math.max(1, Math.ceil(target / 36)), target);
        el.textContent = n;
        if (n < target) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(animateCounters, 380);
    return () => clearTimeout(id);
  }, [visible, tab, apiDrivers, animateCounters]);

  /* ── Fetch live driver standings (Jolpica / Ergast) ─────── */
  useEffect(() => {
    if (tab !== 'DRIVERS') return;
    setLoading(true);
    fetch('https://api.jolpica.com/ergast/f1/current/driverStandings.json')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const list =
          data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;
        if (list?.length) {
          setApiDrivers(
            list.map((s) => ({
              id:        s.Driver.driverId,
              firstName: s.Driver.givenName,
              lastName:  s.Driver.familyName.toUpperCase(),
              team:      s.Constructors[0]?.name ?? '',
              color:     teamColorFor(s.Constructors[0]?.name),
              points:    Number(s.points),
              position:  Number(s.position),
              wins:      Number(s.wins),
            }))
          );
        }
      })
      .catch(() => { /* silent fallback to local data */ })
      .finally(() => setLoading(false));
  }, [tab]);

  /* Build driver list (API → local fallback) */
  const driverList = apiDrivers ?? driversLocal.map((d, i) => ({
    id:        d.id,
    firstName: d.firstName,
    lastName:  d.lastName,
    team:      d.team,
    color:     teamsLocal.find((t) => t.id === d.teamId)?.color ?? '#9A9A96',
    points:    d.points,
    position:  i + 1,
    wins:      d.wins,
  }));

  rowRefs.current = [];

  return (
    <div className="sdb" ref={sectionRef}>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <div className="sdb-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`sdb-tab${tab === t ? ' sdb-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
        {loading && <span className="sdb-loading">LIVE · FETCHING API…</span>}
      </div>

      {/* ── Panel ─────────────────────────────────────────── */}
      <div className="sdb-panel">

        {/* Drivers */}
        {tab === 'DRIVERS' && (
          <div className="sdb-list">
            <div className="sdb-header">
              <span>POS</span>
              <span>DRV</span>
              <span>NAME</span>
              <span className="sdb-h-team">TEAM</span>
              <span>PTS</span>
            </div>
            {driverList.map((d, i) => (
              <div
                key={d.id}
                className={`sdb-row${i === 0 ? ' sdb-row--lead' : ''}`}
                ref={(el) => { rowRefs.current[i] = el; }}
              >
                <span className="sdb-pos">{String(d.position).padStart(2, '0')}</span>
                <div className="sdb-avatar" style={{ background: d.color }}>
                  {d.firstName[0]}{d.lastName[0]}
                </div>
                <div className="sdb-name-block">
                  <span className="sdb-lastname">{d.lastName}</span>
                  <span className="sdb-firstname">{d.firstName}</span>
                </div>
                <span className="sdb-team-name">{d.team}</span>
                <span className="sdb-pts" data-pts={d.points}>{d.points}</span>
                {i === 0 && <span className="sdb-lead-badge">LEADER</span>}
              </div>
            ))}
          </div>
        )}

        {/* Constructors */}
        {tab === 'CONSTRUCTORS' && (
          <div className="sdb-list">
            <div className="sdb-header">
              <span>POS</span>
              <span>PIP</span>
              <span>TEAM</span>
              <span className="sdb-h-team">W · P</span>
              <span>PTS</span>
            </div>
            {teamsLocal.map((team, i) => (
              <div
                key={team.id}
                className={`sdb-row${i === 0 ? ' sdb-row--lead' : ''}`}
                ref={(el) => { rowRefs.current[i] = el; }}
              >
                <span className="sdb-pos">{String(i + 1).padStart(2, '0')}</span>
                <span className="sdb-pip" style={{ background: team.color }} />
                <div className="sdb-name-block">
                  <span className="sdb-lastname">{team.name}</span>
                  <span className="sdb-firstname">{team.chassis} · {team.engine}</span>
                </div>
                <span className="sdb-team-name">{team.wins}V · {team.podiums}P</span>
                <span className="sdb-pts" data-pts={team.points}>{team.points}</span>
                {i === 0 && <span className="sdb-lead-badge">LEADER</span>}
              </div>
            ))}
          </div>
        )}

        {/* Calendar */}
        {tab === 'CALENDAR' && (
          <div className="sdb-calendar">
            {racesLocal.map((race, i) => (
              <Link
                key={race.id}
                to={`/calendrier/${race.id}`}
                className={`sdb-cal-row${race.dateEnd < today ? ' sdb-cal-row--past' : ''}`}
                ref={(el) => { rowRefs.current[i] = el; }}
              >
                <span className="sdb-cal-round">R{String(race.round).padStart(2, '0')}</span>
                <span className="sdb-cal-flag">{flagEmoji(race.countryCode)}</span>
                <div className="sdb-cal-info">
                  <span className="sdb-cal-name">{race.name}</span>
                  <span className="sdb-cal-circuit">{race.circuit} · {race.city}</span>
                </div>
                <span className="sdb-cal-date">
                  {fmtShort(race.dateStart)} — {fmtShort(race.dateEnd)}
                </span>
                {race.isSprint && <span className="sdb-cal-sprint">SPRINT</span>}
                <span className="sdb-cal-arrow">→</span>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
