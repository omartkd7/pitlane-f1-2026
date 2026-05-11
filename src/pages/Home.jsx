import { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import races from '../data/races.js';
import './Home.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const flagEmoji = (code) =>
  [...code.toUpperCase()].map((c) =>
    String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)
  ).join('');

// Parse YYYY-MM-DD into a local Date to avoid UTC timezone shift
const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getCountdown = (dateStart) => {
  // UTC midnight on the first day of the race weekend
  const target = new Date(`${dateStart}T00:00:00Z`);
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
};

const pad = (n) => String(n).padStart(2, '0');

// ─── Component ────────────────────────────────────────────────────────────────

export const Home = () => {
  // Refs attached here; GSAP animations will target these in the next step
  const heroRef = useRef(null);
  const countdownRef = useRef(null);
  const cardRef = useRef(null);

  // Stable today string — YYYY-MM-DD lexicographic order matches chronological order
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const nextRace = useMemo(
    () => races.find((r) => r.dateStart > today),
    [today]
  );

  const [countdown, setCountdown] = useState(
    () => (nextRace ? getCountdown(nextRace.dateStart) : null)
  );

  useEffect(() => {
    if (!nextRace) return;
    const id = setInterval(
      () => setCountdown(getCountdown(nextRace.dateStart)),
      1000
    );
    return () => clearInterval(id);
  }, [nextRace]);

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

  const countdownUnits = [
    { value: countdown.days, label: 'Jours' },
    { value: countdown.hours, label: 'Heures' },
    { value: countdown.minutes, label: 'Minutes' },
    { value: countdown.seconds, label: 'Secondes' },
  ];

  const totalDistance = (nextRace.laps * nextRace.circuitLengthKm).toFixed(1);

  return (
    <div className="page home">

      {/* ── Hero ── */}
      <section className="hero" ref={heroRef}>
        <p className="hero__eyebrow">Prochain Grand Prix</p>

        <span className="hero__flag" aria-hidden="true">
          {flagEmoji(nextRace.countryCode)}
        </span>

        <h1 className="hero__race-name">{nextRace.name}</h1>

        <div className="hero__meta">
          <div className="hero__meta-item">
            <span className="hero__meta-label">Circuit</span>
            <span className="hero__meta-value">{nextRace.circuit}</span>
          </div>
          <div className="hero__meta-item">
            <span className="hero__meta-label">Lieu</span>
            <span className="hero__meta-value">
              {nextRace.city}, {nextRace.country}
            </span>
          </div>
          <div className="hero__meta-item">
            <span className="hero__meta-label">Round</span>
            <span className="hero__meta-value">{nextRace.round} / 24</span>
          </div>
          <div className="hero__meta-item">
            <span className="hero__meta-label">Dates</span>
            <span className="hero__meta-value">
              {fmtDate(nextRace.dateStart)} – {fmtDate(nextRace.dateEnd)}
            </span>
          </div>
        </div>

        {/* Live countdown — aria-live so screen readers announce updates */}
        <div className="countdown" ref={countdownRef} aria-live="polite">
          {countdownUnits.map(({ value, label }) => (
            <div key={label} className="countdown__unit">
              <span className="countdown__value">{pad(value)}</span>
              <span className="countdown__label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature card ── */}
      <section className="feature-card" ref={cardRef}>
        <p className="feature-card__eyebrow">Course à la une</p>
        <p className="feature-card__circuit">{nextRace.circuit}</p>

        <div className="feature-card__stats">
          <div className="feature-card__stat">
            <span className="feature-card__stat-label">Tours</span>
            <span className="feature-card__stat-value">{nextRace.laps}</span>
          </div>
          <div className="feature-card__stat">
            <span className="feature-card__stat-label">Longueur</span>
            <span className="feature-card__stat-value">
              {nextRace.circuitLengthKm} km
            </span>
          </div>
          <div className="feature-card__stat">
            <span className="feature-card__stat-label">Distance totale</span>
            <span className="feature-card__stat-value">≈ {totalDistance} km</span>
          </div>
        </div>

        <div className="badges">
          {nextRace.isSprint && (
            <span className="badge badge--sprint">⚡ Week-end Sprint</span>
          )}
          {nextRace.isNewCircuit && (
            <span className="badge badge--new">🆕 Nouveau circuit</span>
          )}
        </div>

        <Link to={`/calendrier/${nextRace.id}`} className="feature-card__link">
          Voir tous les détails →
        </Link>
      </section>

    </div>
  );
};