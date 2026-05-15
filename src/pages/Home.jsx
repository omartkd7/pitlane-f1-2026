import { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import races from '../data/races.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { HeroThreeD }         from '../components/HeroThreeD.jsx';
import { StandingsDashboard } from '../components/StandingsDashboard.jsx';
import { TelemetrySection }   from '../components/TelemetrySection.jsx';
import { CircuitMap }         from '../components/CircuitMap.jsx';
import { initHomeScene }      from '../animations/cinematic.js';
import './Home.css';

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

const getCountdown = (dateStart) => {
  const diff = Math.max(0, new Date(`${dateStart}T00:00:00Z`) - Date.now());
  const s    = Math.floor(diff / 1000);
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
};

const pad = (n) => String(n).padStart(2, '0');

const splitGPName = (name) => {
  const upper = name.toUpperCase();
  const idx   = upper.indexOf(' ', 6);
  return idx === -1 ? ['GRAND PRIX', upper] : ['GRAND PRIX', upper.slice(idx + 1)];
};

/* ── Component ───────────────────────────────────────────── */
export const Home = () => {
  const heroRef       = useRef(null);
  const cdRef         = useRef(null);
  const cardRef       = useRef(null);
  const roundNumRef   = useRef(null); /* animated round counter */

  const { currentTeam } = useTheme();

  const today    = useMemo(() => new Date().toISOString().split('T')[0], []);
  const nextRace = useMemo(() => races.find((r) => r.dateStart > today), [today]);

  const [countdown, setCountdown] = useState(
    () => (nextRace ? getCountdown(nextRace.dateStart) : null)
  );

  /* Live countdown tick */
  useEffect(() => {
    if (!nextRace) return;
    const id = setInterval(() => setCountdown(getCountdown(nextRace.dateStart)), 1000);
    return () => clearInterval(id);
  }, [nextRace]);

  /* Cinematic hero scene — circuit dot, heading reveals, parallax */
  useEffect(() => {
    const cleanup = initHomeScene();
    return cleanup;
  }, []);

  /* ── Hero entrance — split-text word stagger ──────────── */
  useGSAP(() => {
    if (!heroRef.current) return;

    /* each .hero__word flies up from below */
    gsap.from(heroRef.current.querySelectorAll('.hero__word'), {
      opacity: 0,
      y: 48,
      duration: 0.7,
      stagger: 0.07,
      ease: 'power3.out',
      delay: 0.05,
    });

    /* eyebrow / meta / telemetry / CTA fade in after words */
    gsap.from(
      [
        heroRef.current.querySelector('.hero__eyebrow'),
        heroRef.current.querySelector('.hero__meta'),
        heroRef.current.querySelector('.hero__telemetry'),
        heroRef.current.querySelector('.hero__cta'),
      ].filter(Boolean),
      { opacity: 0, y: 20, duration: 0.55, stagger: 0.1, ease: 'power2.out', delay: 0.55 }
    );
  }, { scope: heroRef });

  /* ── Round counter tick-up ───────────────────────────────  */
  useEffect(() => {
    if (!roundNumRef.current || !nextRace) return;
    const target = nextRace.round;
    let n = 0;
    const step = () => {
      n = Math.min(n + 1, target);
      if (roundNumRef.current) roundNumRef.current.textContent = pad(n);
      if (n < target) setTimeout(step, 65);
    };
    const id = setTimeout(step, 700);
    return () => clearTimeout(id);
  }, [nextRace?.round]);

  /* ── Seconds tick — scale pulse ─────────────────────────── */
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

  /* ── Feature card scroll reveal ─────────────────────────── */
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

  const [line1, line2]  = splitGPName(nextRace.name);
  const totalDistance   = (nextRace.laps * nextRace.circuitLengthKm).toFixed(1);
  const accentColor     = currentTeam?.accent ?? '#E5001A';

  const cdUnits = [
    { value: countdown.days,    label: 'Jours',    id: 'D' },
    { value: countdown.hours,   label: 'Heures',   id: 'H' },
    { value: countdown.minutes, label: 'Minutes',  id: 'M' },
    { value: countdown.seconds, label: 'Secondes', id: 'S', isSec: true },
  ];

  return (
    <div className="page home">

      {/* ── Breadcrumb ────────────────────────────────────── */}
      <div className="subbar">
        <span className="subbar__crumbs">
          Paddock <em>/</em> <span>Manche en cours</span> <em>/</em> Aperçu
        </span>
        <span>Saison 2026 · {nextRace.round} / 24 manches</span>
      </div>

      {/* ══════════════════════════════════════════════════════
          HERO — Canvas F1 car + track SVG background + split-text
          ══════════════════════════════════════════════════════ */}
      <section className="hero" ref={heroRef}>

        {/* Three.js 3D F1 car (procedural primitives, shadow, parallax) */}
        <HeroThreeD accentColor={accentColor} />

        {/* Looping animated track SVG + circuit dot */}
        <svg
          className="hero__track-bg"
          viewBox="0 0 1200 400"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <filter id="dot-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            id="hero-track-main"
            className="hero__track-path"
            d="M -100,200 C 200,50 400,350 600,200 S 1000,50 1300,200 S 1700,350 1900,200"
          />
          <path
            className="hero__track-path hero__track-path--b"
            d="M -100,310 C 150,160 350,460 550,310 S 950,160 1150,310"
          />
          <circle id="circuit-dot" r="5" className="circuit-dot" filter="url(#dot-glow)" />
        </svg>

        {/* CRT scanline overlay */}
        <div className="anim-scanlines" aria-hidden="true" />

        {/* Ghost round number */}
        <div className="hero__ghost" aria-hidden="true">
          {pad(nextRace.round)}
        </div>

        <div className="hero__inner">

          {/* Eyebrow */}
          <div className="hero__eyebrow">
            <span className="hero__pill hero__pill--accent">▶ EN DIRECT</span>
            <span className="hero__pill">
              ROUND <span ref={roundNumRef}>{pad(nextRace.round)}</span> / 24
            </span>
            <span className="hero__eyebrow-bar" />
            <span>Prochain Grand Prix · 2026</span>
          </div>

          {/* ── Split-text headline ── */}
          <h1 className="hero__title">
            <span className="hero__title-line1">
              {line1.split(' ').map((word, i) => (
                <span key={i} className="hero__word">{word}&nbsp;</span>
              ))}
            </span>
            <span className="hero__title-line2">
              {line2.split(' ').map((word, i) => (
                <span key={i} className="hero__word">{word}&nbsp;</span>
              ))}
            </span>
          </h1>

          {/* Meta row */}
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

          {/* Telemetry panel */}
          <div className="hero__telemetry">
            <h4 className="hero__tele-head">Aperçu Circuit</h4>
            <div className="hero__tele-grid">
              <div><span>Tours</span><b>{nextRace.laps}</b></div>
              <div><span>Longueur</span><b>{nextRace.circuitLengthKm} KM</b></div>
              <div><span>Distance</span><b>{totalDistance} KM</b></div>
              {nextRace.isSprint && <div><span>Format</span><b className="red">SPRINT</b></div>}
            </div>
          </div>

          {/* CTA — throttle-fill on hover */}
          <Link to={`/calendrier/${nextRace.id}`} className="hero__cta">
            <span className="hero__cta-inner">
              <span>OUVRIR LE DOSSIER COURSE</span>
              <span className="hero__cta-arrow">→ {pad(nextRace.round)} / 24</span>
            </span>
          </Link>

        </div>
      </section>

      {/* ── Countdown ─────────────────────────────────────── */}
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

      {/* ── §01 Feature race ──────────────────────────────── */}
      <div className="sec-head">
        <h2 className="gsap-heading"><span className="num">§01</span>COURSE À LA UNE</h2>
        <span className="meta-right">Mise à jour · Saison 2026</span>
      </div>

      <article className="feature" ref={cardRef}>
        <span className="feature__ghost" aria-hidden="true">
          {pad(nextRace.round)}
        </span>
        <div className="feature__main">
          <div className="feature__tag">
            <span className="feature__round">ROUND {pad(nextRace.round)} / 24</span>
            <span>· {fmtShort(nextRace.dateStart)} — {fmtShort(nextRace.dateEnd)}</span>
            {nextRace.isSprint    && <span className="feature__sprint">SPRINT</span>}
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
            <span className="arrow">→ {pad(nextRace.round)} / 24</span>
          </Link>
        </div>
      </article>

      {/* ── §02 Standings dashboard ───────────────────────── */}
      <div className="sec-head" style={{ marginTop: 48 }}>
        <h2 className="gsap-heading"><span className="num">§02</span>STANDINGS DASHBOARD</h2>
        <span className="meta-right">Live · Saison 2026</span>
      </div>
      <StandingsDashboard />

      {/* ── §03 Telemetry ─────────────────────────────────── */}
      <div className="sec-head" style={{ marginTop: 48 }}>
        <h2 className="gsap-heading"><span className="num">§03</span>LAP TELEMETRY</h2>
        <span className="meta-right">Mock Data · Scroll to reveal</span>
      </div>
      <TelemetrySection />

      {/* ── §04 Circuit map ───────────────────────────────── */}
      <div className="sec-head" style={{ marginTop: 48 }}>
        <h2 className="gsap-heading"><span className="num">§04</span>CIRCUIT MAP</h2>
        <span className="meta-right">Hover sectors · Live dot</span>
      </div>
      <CircuitMap />

    </div>
  );
};
