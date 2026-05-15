/**
 * CircuitMap — animated SVG F1 circuit layout
 * - A dot traces the full lap continuously via requestAnimationFrame
 * - 3 sector paths (S1/S2/S3) rendered with stroke-dasharray / dashoffset
 * - Hover on any sector highlights it and shows a tooltip
 * - Lazy-loaded via IntersectionObserver
 */
import { useEffect, useRef, useState } from 'react';
import './CircuitMap.css';

/* Generic F1-ish closed circuit path (Monaco-inspired placeholder) */
const TRACK = [
  'M 62,162',
  'L 198,162',
  'C 228,162 240,144 240,118',
  'L 240,82',
  'C 240,57 260,42 287,42',
  'L 376,42',
  'C 416,42 438,65 438,100',
  'C 438,132 418,154 382,158',
  'L 338,161',
  'C 308,163 288,182 288,208',
  'C 288,234 308,252 338,255',
  'L 382,258',
  'C 418,260 438,281 438,314',
  'C 438,346 416,362 380,362',
  'L 176,362',
  'C 128,362 85,330 77,283',
  'L 66,210',
  'C 63,186 62,173 62,162',
  'Z',
].join(' ');

const SECTORS = [
  { id: 'S1', label: 'SECTOR 1', color: '#22c55e', start: 0,    end: 0.33 },
  { id: 'S2', label: 'SECTOR 2', color: '#eab308', start: 0.33, end: 0.66 },
  { id: 'S3', label: 'SECTOR 3', color: '#E5001A', start: 0.66, end: 1.0  },
];

/* ── Sector path overlay ─────────────────────────────────── */
function SectorPath({ sector, hovered, onEnter, onLeave }) {
  const ref = useRef(null);

  /* Set stroke-dasharray once the element is mounted */
  useEffect(() => {
    const path = ref.current;
    if (!path) return;
    const len = path.getTotalLength();
    const s   = sector.start * len;
    const e   = sector.end   * len;
    path.style.strokeDasharray  = `${e - s} ${len}`;
    path.style.strokeDashoffset = `${-s}`;
  }, [sector]);

  const active = hovered === sector.id;

  return (
    <path
      ref={ref}
      d={TRACK}
      fill="none"
      stroke={active ? sector.color : `${sector.color}55`}
      strokeWidth={active ? 20 : 12}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'stroke .2s ease, stroke-width .2s ease', cursor: 'pointer' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    />
  );
}

/* ── Main component ──────────────────────────────────────── */
export const CircuitMap = () => {
  const containerRef = useRef(null);
  const trackRef     = useRef(null);   /* invisible path used for getTotalLength */
  const dotRef       = useRef(null);   /* <g> that gets translate(x,y) */
  const rafRef       = useRef(null);
  const [visible, setVisible]   = useState(false);
  const [hovered, setHovered]   = useState(null);
  const [tooltip, setTooltip]   = useState(null);

  /* Lazy reveal */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Dot animation loop */
  useEffect(() => {
    if (!visible) return;
    const path = trackRef.current;
    const dot  = dotRef.current;
    if (!path || !dot) return;

    const totalLen = path.getTotalLength();
    const DURATION = 4200; /* ms per lap */
    let startTs = null;

    const tick = (ts) => {
      if (!startTs) startTs = ts;
      const t  = ((ts - startTs) % DURATION) / DURATION;
      const pt = path.getPointAtLength(t * totalLen);
      dot.setAttribute('transform', `translate(${pt.x},${pt.y})`);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible]);

  const handleSectorEnter = (sector, e) => {
    setHovered(sector.id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, sector });
  };

  const handleSectorLeave = () => {
    setHovered(null);
    setTooltip(null);
  };

  return (
    <div className="circuit-map" ref={containerRef}>

      {/* Header */}
      <div className="circuit-map__header">
        <span className="circuit-map__label">CIRCUIT LAYOUT · HOVER TO INSPECT SECTORS</span>
        <div className="circuit-map__sectors">
          {SECTORS.map(s => (
            <span key={s.id} className="circuit-map__sector-key" style={{ color: s.color }}>
              ● {s.id}
            </span>
          ))}
        </div>
      </div>

      {/* SVG */}
      <div className="circuit-map__canvas">
        <svg viewBox="0 0 500 404" className="circuit-map__svg" aria-label="Circuit layout">

          {/* Base track (dim backdrop) */}
          <path
            d={TRACK}
            fill="none"
            stroke="rgba(240,237,232,0.06)"
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Coloured sector overlays */}
          {SECTORS.map(s => (
            <SectorPath
              key={s.id}
              sector={s}
              hovered={hovered}
              onEnter={(e) => handleSectorEnter(s, e)}
              onLeave={handleSectorLeave}
            />
          ))}

          {/* Invisible path used only for getPointAtLength */}
          <path
            ref={trackRef}
            d={TRACK}
            fill="none"
            stroke="transparent"
            strokeWidth="1"
          />

          {/* Animated car dot */}
          <g ref={dotRef} style={{ willChange: 'transform' }}>
            <circle r="11" fill="var(--accent)" style={{ filter: 'blur(6px)', opacity: 0.5 }} />
            <circle r="5"  fill="var(--accent)" />
            <circle r="2.5" fill="#fff" />
          </g>

          {/* Start / Finish line */}
          <rect x="58" y="150" width="4" height="24" fill="var(--accent)" opacity="0.9" />
        </svg>

        {/* Hover tooltip */}
        {tooltip && (
          <div
            className="circuit-map__tooltip"
            style={{
              left: tooltip.x + 14,
              top:  Math.max(8, tooltip.y - 42),
              borderColor: tooltip.sector.color,
            }}
          >
            <span style={{ color: tooltip.sector.color }}>{tooltip.sector.id}</span>
            {' '}{tooltip.sector.label}
          </div>
        )}
      </div>

      {/* Sector time bars */}
      <div className="circuit-map__times">
        {SECTORS.map(s => (
          <div
            key={s.id}
            className={`circuit-map__time${hovered === s.id ? ' is-active' : ''}`}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="circuit-map__time-label" style={{ color: s.color }}>{s.id}</span>
            <div className="circuit-map__time-bar">
              <div
                className="circuit-map__time-fill"
                style={{
                  background: s.color,
                  width: visible ? `${(s.end - s.start) * 100}%` : '0%',
                }}
              />
            </div>
            <span className="circuit-map__time-val">—:—.—</span>
          </div>
        ))}
      </div>

    </div>
  );
};
