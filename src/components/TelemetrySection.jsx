/**
 * TelemetrySection
 * - SVG animated lap-time line chart (stroke-dashoffset on scroll)
 * - Canvas arc gauges: Throttle / Brake / Speed (mock data, updates every 2s)
 * - S1 / S2 / S3 sector bars colour-coded by performance
 */
import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './TelemetrySection.css';

/* ── Mock lap data ─────────────────────────────────────── */
const LAP_COUNT = 20;
const mkLaps = (base, jitter) =>
  Array.from({ length: LAP_COUNT }, (_, i) =>
    base + (Math.random() - 0.5) * jitter + (i > 14 ? -0.4 : 0)
  );

const DRIVER_A = { name: 'NORRIS',    color: '#FF8000', laps: mkLaps(91.2, 0.8) };
const DRIVER_B = { name: 'VERSTAPPEN',color: '#3671C6', laps: mkLaps(91.7, 1.0) };

const MIN_T = 89, MAX_T = 94;
const ty = (t, h) => h - ((t - MIN_T) / (MAX_T - MIN_T)) * h * 0.82 - h * 0.06;

/* ── Mock sector data (seconds) ────────────────────────── */
const SECTORS = [
  { label: 'S1', a: 28.12, b: 28.45 },
  { label: 'S2', a: 32.88, b: 32.55 },
  { label: 'S3', a: 30.20, b: 30.72 },
];

/* ── Gauge drawing ─────────────────────────────────────── */
function drawGauge(ctx, cx, cy, r, value, max, label, unit, accentColor) {
  const startA = Math.PI * 0.75;
  const endA   = Math.PI * 2.25;
  const fillA  = startA + (value / max) * (endA - startA);

  ctx.clearRect(cx - r - 16, cy - r - 16, (r + 16) * 2, (r + 16) * 2 + 36);

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, r, startA, endA);
  ctx.strokeStyle = 'rgba(240,237,232,0.08)';
  ctx.lineWidth   = 10;
  ctx.lineCap     = 'butt';
  ctx.stroke();

  // Fill
  const grd = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  grd.addColorStop(0, accentColor + '88');
  grd.addColorStop(1, accentColor);
  ctx.beginPath();
  ctx.arc(cx, cy, r, startA, fillA);
  ctx.strokeStyle = grd;
  ctx.lineWidth   = 10;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur  = 14;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Value text
  ctx.fillStyle    = '#F0EDE8';
  ctx.font         = `bold 22px "Barlow Condensed", sans-serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(Math.round(value) + unit, cx, cy);

  // Label
  ctx.font         = `500 10px "JetBrains Mono", monospace`;
  ctx.fillStyle    = 'rgba(154,154,150,0.9)';
  ctx.letterSpacing = '0.15em';
  ctx.fillText(label, cx, cy + r + 18);
}

/* ── Component ─────────────────────────────────────────── */
export const TelemetrySection = () => {
  const sectionRef  = useRef(null);
  const svgRef      = useRef(null);
  const canvasRef   = useRef(null);
  const [visible, setVisible] = useState(false);

  // Mock telemetry state
  const [tele, setTele] = useState({ throttle: 78, brake: 12, speed: 287 });

  /* ── IntersectionObserver — trigger on scroll ──────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ── SVG lap chart animation on reveal ─────────────── */
  useGSAP(() => {
    if (!visible || !svgRef.current) return;
    const paths = svgRef.current.querySelectorAll('.tele-path');
    paths.forEach(path => {
      const len = path.getTotalLength();
      gsap.fromTo(path,
        { strokeDasharray: len, strokeDashoffset: len },
        { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' }
      );
    });
    // Sector bars
    gsap.fromTo('.sector-fill',
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, stagger: 0.12, ease: 'power2.out', delay: 0.4,
        transformOrigin: 'left center' }
    );
  }, { dependencies: [visible] });

  /* ── Mock telemetry update every 2s ────────────────── */
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      setTele({
        throttle: 55 + Math.random() * 45,
        brake:    Math.random() * 30,
        speed:    220 + Math.random() * 100,
      });
    }, 2000);
    return () => clearInterval(id);
  }, [visible]);

  /* ── Canvas gauge rendering ─────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const r = Math.min(w / 6, 62);
    const cy = h * 0.48;
    const spacing = w / 3;

    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim() || '#E5001A';

    ctx.clearRect(0, 0, w, h);
    drawGauge(ctx, spacing * 0.5, cy, r, tele.throttle, 100, 'THROTTLE', '%', '#22c55e');
    drawGauge(ctx, spacing * 1.5, cy, r, tele.brake,    100, 'BRAKE',    '%', '#ef4444');
    drawGauge(ctx, spacing * 2.5, cy, r, tele.speed,    350, 'SPEED',  ' km/h', accent);
  }, [tele, visible]);

  /* ── Build SVG path strings ─────────────────────────── */
  const W = 640, H = 180;
  const mkPath = laps =>
    laps.map((t, i) => `${i === 0 ? 'M' : 'L'}${(i / (LAP_COUNT - 1)) * (W - 40) + 20},${ty(t, H)}`).join(' ');

  const bestA = Math.min(...DRIVER_A.laps);
  const bestB = Math.min(...DRIVER_B.laps);

  return (
    <section className="tele-section" ref={sectionRef}>
      <div className="tele-row">
        {/* ── SVG Line Chart ─────────────────────────── */}
        <div className="tele-chart-wrap">
          <div className="tele-chart-label">LAP TIME COMPARISON</div>
          <div className="tele-chart-drivers">
            <span style={{ color: DRIVER_A.color }}>● {DRIVER_A.name}</span>
            <span style={{ color: DRIVER_B.color }}>● {DRIVER_B.name}</span>
          </div>
          <svg
            ref={svgRef}
            className="tele-svg"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            {[89, 90, 91, 92, 93, 94].map(t => (
              <line key={t}
                x1={20} x2={W - 20}
                y1={ty(t, H)} y2={ty(t, H)}
                stroke="rgba(240,237,232,0.06)" strokeWidth="1"
              />
            ))}
            {/* Lap tick marks */}
            {DRIVER_A.laps.map((_, i) => (
              <line key={i}
                x1={(i / (LAP_COUNT - 1)) * (W - 40) + 20} x2={(i / (LAP_COUNT - 1)) * (W - 40) + 20}
                y1={H - 4} y2={H}
                stroke="rgba(240,237,232,0.14)" strokeWidth="1"
              />
            ))}
            {/* Driver A path */}
            <path
              className="tele-path"
              d={mkPath(DRIVER_A.laps)}
              fill="none"
              stroke={DRIVER_A.color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Driver B path */}
            <path
              className="tele-path"
              d={mkPath(DRIVER_B.laps)}
              fill="none"
              stroke={DRIVER_B.color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Best lap dots */}
            {[{ d: DRIVER_A, best: bestA }, { d: DRIVER_B, best: bestB }].map(({ d, best }) => {
              const idx = d.laps.indexOf(best);
              return (
                <circle key={d.name}
                  cx={(idx / (LAP_COUNT - 1)) * (W - 40) + 20}
                  cy={ty(best, H)}
                  r={4} fill={d.color}
                />
              );
            })}
          </svg>
          <div className="tele-xaxis">
            {Array.from({ length: 5 }, (_, i) => Math.round(i * (LAP_COUNT - 1) / 4)).map(i => (
              <span key={i}>L{i + 1}</span>
            ))}
          </div>
        </div>

        {/* ── Sector Bars ────────────────────────────── */}
        <div className="tele-sectors">
          <div className="tele-chart-label">SECTOR TIMES</div>
          {SECTORS.map(s => {
            const aFaster = s.a <= s.b;
            const maxT    = Math.max(s.a, s.b);
            return (
              <div key={s.label} className="sector-group">
                <div className="sector-label">{s.label}</div>
                <div className="sector-bars">
                  <div className="sector-bar-row">
                    <span className="sector-driver">{DRIVER_A.name}</span>
                    <div className="sector-track">
                      <div
                        className="sector-fill"
                        style={{
                          width: `${(s.a / maxT) * 100}%`,
                          background: aFaster ? '#22c55e' : '#eab308',
                        }}
                      />
                    </div>
                    <span className="sector-time">{s.a.toFixed(3)}s</span>
                  </div>
                  <div className="sector-bar-row">
                    <span className="sector-driver">{DRIVER_B.name}</span>
                    <div className="sector-track">
                      <div
                        className="sector-fill"
                        style={{
                          width: `${(s.b / maxT) * 100}%`,
                          background: !aFaster ? '#22c55e' : '#eab308',
                        }}
                      />
                    </div>
                    <span className="sector-time">{s.b.toFixed(3)}s</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Gauges ─────────────────────────────────────── */}
      <div className="tele-gauges-wrap">
        <div className="tele-chart-label">LIVE TELEMETRY · MOCK</div>
        <canvas ref={canvasRef} className="tele-canvas" />
      </div>
    </section>
  );
};
