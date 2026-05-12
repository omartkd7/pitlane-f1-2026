import { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import races from '../data/races.js';
import drivers from '../data/drivers.js';
import teams from '../data/teams.js';
import './Home.css';

// ScrollTrigger already registered in main.jsx

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const getCountdown = (dateStart) => {
  const target = new Date(`${dateStart}T00:00:00Z`);
  const diff = Math.max(0, target - Date.now());
  const s = Math.floor(diff / 1000);
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
};

const pad = (n) => String(n).padStart(2, '0');

// Split "Grand Prix de Monaco" → ["GRAND PRIX", "DE MONACO"]
const splitGPName = (name) => {
  const upper = name.toUpperCase();
  const idx = upper.indexOf(' ', 6); // skip "GRAND "
  if (idx === -1) return ['GRAND PRIX', upper];
  return ['GRAND PRIX', upper.slice(idx + 1)];
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Home = () => {
  const heroRef        = useRef(null);
  const cdRef          = useRef(null);
  const cardRef        = useRef(null);
  const standingsRef   = useRef(null);
  const driverRowRefs  = useRef([]);
  const teamRowRefs    = useRef([]);

  const today    = useMemo(() => new Date().toISOString().split('T')[0], []);
  const nextRace = useMemo(() => races.find((r) => r.dateStart > today), [today]);

  const [countdown, setCountdown] = useState(
    () => (nextRace ? getCountdown(nextRace.dateStart) : null)
  );

  useEffect(() => {
    if (!nextRace) return;
    const id = setInterval(() => setCountdown(getCountdown(nextRace.dateStart)), 1000);
    return () => clearInterval(id);
  }, [nextRace]);

  // hero entrance — stagger children, no glow
  useGSAP(() => {
    if (!heroRef.current) return;
    gsap.from(heroRef.current.querySelector('.hero__inner').children, {
      opacity: 0,
      y: 18,
      duration: 0.55,
      stagger: 0.1,
      ease: 'power2.out',
    });
  }, { scope: heroRef });

  // countdown seconds tick — subtle scale on the seconds number
  useGSAP(() => {
    if (!cdRef.current) return;
    const secNum = cdRef.current.querySelector('.cd-block--sec .cd-num');
    if (!secNum) return;
    gsap.fromTo(
      secNum,
      { opacity: 0.5, scaleY: 0.85 },
      { opacity: 1, scaleY: 1, duration: 0.12, ease: 'power2.out', transformOrigin: 'bottom' }
    );
  }, { scope: cdRef, dependencies: [countdown?.seconds] });

  // feature card scroll reveal
  useGSAP(() => {
    if (!cardRef.current) return;
    gsap.from(cardRef.current, {
      autoAlpha: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: { trigger: cardRef.current, start: 'top 88%' },
    });
  });

  // standings section — matchMedia respects prefers-reduced-motion
  useGSAP(() => {
    if (!standingsRef.current) return;
    const allRows = [
      ...driverRowRefs.current.filter(Boolean),
      ...teamRowRefs.current.filter(Boolean),
    ];
    if (!allRows.length) return;

    const mm = gsap.matchMedia();
    mm.add(
      {
        isNormal:  '(prefers-reduced-motion: no-preference)',
        isReduced: '(prefers-reduced-motion: reduce)',
      },
      (ctx) => {
        const { isNormal } = ctx.conditions;
        gsap.from(allRows, {
          autoAlpha: 0,
          y:        isNormal ? 8 : 0,
          duration: isNormal ? 0.4 : 0,
          stagger:  isNormal ? 0.04 : 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: standingsRef.current,
            start: 'top 88%',
          },
        });
      }
    );
    return () => mm.revert();
  }, { scope: standingsRef });

  driverRowRefs.current = [];
  teamRowRefs.current   = [];

  if (!nextRace) {
    return (
      <div className="page home">
        <div className="season-ended">
          <h1>Saison terminée</h1>
          <p>Rendez-vous en 2027 !</p>
        </div>
      </div>
    );
  }

  const [line1, line2] = splitGPName(nextRace.name);
  const totalDistance  = (nextRace.laps * nextRace.circuitLengthKm).toFixed(1);

  const cdUnits = [
    { value: countdown.days,    label: 'Jours',    id: 'D' },
    { value: countdown.hours,   label: 'Heures',   id: 'H' },
    { value: countdown.minutes, label: 'Minutes',  id: 'M' },
    { value: countdown.seconds, label: 'Secondes', id: 'S', isSec: true },
  ];

  return (
    <div className="page home">

      {/* ── Breadcrumb ── */}
      <div className="subbar">
        <span className="subbar__crumbs">
          Paddock <em>/</em> <span>Manche en cours</span> <em>/</em> Aperçu
        </span>
        <span>Saison 2026 · {nextRace.round} / 24 manches</span>
      </div>

      {/* ── Hero ── */}
      <section className="hero" ref={heroRef}>
        <div className="hero__ghost" aria-hidden="true">
          {String(nextRace.round).padStart(2, '0')}
        </div>

        <div className="hero__inner">
          <div className="hero__eyebrow">
            <span className="hero__pill hero__pill--accent">▶ EN DIRECT</span>
            <span className="hero__pill">Round {nextRace.round} / 24</span>
            <span className="hero__eyebrow-bar" />
            <span>Prochain Grand Prix · 2026</span>
          </div>

          <h1 className="hero__title">
            {line1}
            <span className="hero__title-line2">{line2}</span>
          </h1>

          <div className="hero__meta">
            <span>Round {nextRace.round}</span>
            <span className="sep">·</span>
            <span className="strong">{nextRace.circuit}</span>
            <span className="sep">·</span>
            <span>{nextRace.city}</span>
            <span className="flag">{flagEmoji(nextRace.countryCode)}</span>
            <span className="sep">·</span>
            <span>{fmtShort(nextRace.dateStart)} — {fmtShort(nextRace.dateEnd)}</span>
          </div>

          <div className="hero__telemetry">
            <h4 className="hero__tele-head">Aperçu Circuit</h4>
            <div className="hero__tele-grid">
              <div><span>Tours</span><b>{nextRace.laps}</b></div>
              <div><span>Longueur</span><b>{nextRace.circuitLengthKm} KM</b></div>
              <div><span>Distance</span><b>{totalDistance} KM</b></div>
              {nextRace.isSprint && <div><span>Format</span><b className="red">SPRINT</b></div>}
            </div>
          </div>
        </div>
      </section>

      {/* ── Countdown ── */}
      <section className="countdown-wrap" ref={cdRef}>
        <div className="cd-label">
          <div className="cd-tag">/ Compte à rebours · Course</div>
          <div className="cd-title">DÉPART<br /><em>EN…</em></div>
        </div>
        <div className="cd-blocks">
          {cdUnits.map(({ value, label, id, isSec }) => (
            <div key={id} className={`cd-block${isSec ? ' cd-block--sec' : ''}`}>
              <div className="cd-num">{pad(value)}</div>
              <div className="cd-lbl">
                <span>{label}</span>
                <span className="cd-idx">{id}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section header ── */}
      <div className="sec-head">
        <h2><span className="num">§01</span>COURSE À LA UNE</h2>
        <span className="meta-right">Mise à jour · Saison 2026</span>
      </div>

      {/* ── Feature card ── */}
      <article className="feature" ref={cardRef}>
        <span className="feature__ghost" aria-hidden="true">
          {String(nextRace.round).padStart(2, '0')}
        </span>

        <div className="feature__main">
          <div className="feature__tag">
            <span className="feature__round">ROUND {String(nextRace.round).padStart(2,'0')} / 24</span>
            <span>· {fmtShort(nextRace.dateStart)} — {fmtShort(nextRace.dateEnd)}</span>
            {nextRace.isSprint && <span className="feature__sprint">SPRINT</span>}
            {nextRace.isNewCircuit && <span className="feature__new">NOUVEAU</span>}
          </div>

          <h3 className="feature__title">{nextRace.name}</h3>

          <div className="feature__circuit">
            <span className="flag">{flagEmoji(nextRace.countryCode)}</span>
            <span className="strong">{nextRace.circuit}</span>
            <span className="sep">·</span>
            <span>{nextRace.city}, {nextRace.country}</span>
          </div>
        </div>

        <div className="feature__side">
          <div className="feature__stat">
            <div className="k">Tours</div>
            <div className="v">{nextRace.laps}</div>
          </div>
          <div className="feature__stat">
            <div className="k">Longueur circuit</div>
            <div className="v">{nextRace.circuitLengthKm} KM</div>
          </div>
          <Link to={`/calendrier/${nextRace.id}`} className="feature__cta">
            <span>Ouvrir le dossier course</span>
            <span className="arrow">→ {String(nextRace.round).padStart(2,'0')} / 24</span>
          </Link>
        </div>
      </article>

      {/* ── Section header — Standings ── */}
      <div className="sec-head" style={{ marginTop: 48 }}>
        <h2><span className="num">§02</span>CLASSEMENT LIVE</h2>
        <span className="meta-right">Après Round 06 · Miami</span>
      </div>

      {/* ── Standings grid ── */}
      <div className="standings-grid" ref={standingsRef}>

        {/* Drivers panel */}
        <div className="standings-panel">
          <div className="standings-panel__head">
            <span className="standings-panel__title">/ Pilotes</span>
            <Link to="/pilotes" className="standings-panel__link">Classement complet →</Link>
          </div>
          {drivers.slice(0, 5).map((driver, i) => {
            const team = teams.find((t) => t.id === driver.teamId);
            return (
              <div
                key={driver.id}
                className={`st-row${i === 0 ? ' st-row--lead' : ''}`}
                ref={(el) => { driverRowRefs.current[i] = el; }}
              >
                <span className="st-pos">{String(i + 1).padStart(2, '0')}</span>
                <span
                  className="st-pip"
                  style={{ background: team?.color ?? 'var(--silver)' }}
                />
                <div className="st-name-block">
                  <span className="st-firstname">{driver.firstName}</span>
                  <span className="st-lastname">{driver.lastName}</span>
                </div>
                <span className="st-team">{driver.team}</span>
                <span className="st-pts">{driver.points}</span>
              </div>
            );
          })}
        </div>

        {/* Teams panel */}
        <div className="standings-panel">
          <div className="standings-panel__head">
            <span className="standings-panel__title">/ Écuries</span>
            <Link to="/ecuriess" className="standings-panel__link">Classement complet →</Link>
          </div>
          {teams.slice(0, 5).map((team, i) => (
            <div
              key={team.id}
              className={`st-row${i === 0 ? ' st-row--lead' : ''}`}
              ref={(el) => { teamRowRefs.current[i] = el; }}
            >
              <span className="st-pos">{String(i + 1).padStart(2, '0')}</span>
              <span
                className="st-pip"
                style={{ background: team.color }}
              />
              <div className="st-name-block">
                <span className="st-lastname">{team.name}</span>
                <span className="st-firstname">{team.chassis} · {team.engine}</span>
              </div>
              <span className="st-team">{team.wins}V · {team.podiums}P</span>
              <span className="st-pts">{team.points}</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
