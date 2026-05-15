/**
 * HeroCanvas — Canvas 2D F1 car with speed-line particles & mouse parallax.
 * Accent color is fully dynamic (passed as prop, drives all glows/lines).
 */
import { useEffect, useRef } from 'react';
import './HeroCanvas.css';

const SPEED_LINE_COUNT = 28;
const MAX_PARTICLES    = 200;

/* Convert #rrggbb → "r,g,b" for rgba() use */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

/* ── Create a single speed particle ─────────────────────── */
function mkParticle(carX, carY) {
  const spread = (Math.random() - 0.5) * 0.45; // cone spread
  const speed  = 3.5 + Math.random() * 9;
  return {
    x:     carX - 50 + (Math.random() - 0.5) * 30,
    y:     carY + 5  + (Math.random() - 0.5) * 44,
    vx:    -Math.cos(spread) * speed,
    vy:     Math.sin(spread) * speed * 0.25,
    life:  1,
    decay: 0.012 + Math.random() * 0.022,
    len:   18  + Math.random() * 70,
    w:     0.6 + Math.random() * 1.8,
  };
}

/* ── Draw procedural F1 car (side view, right-facing) ───── */
function drawCar(ctx, accent, time) {
  // Body silhouette
  ctx.beginPath();
  ctx.moveTo( 130,   4);   // nose tip
  ctx.lineTo(  95,  -2);   // nose-body join top
  ctx.lineTo(  35, -22);   // cockpit front
  ctx.lineTo(  -8, -34);   // cockpit peak
  ctx.lineTo( -52, -22);   // engine cover
  ctx.lineTo( -98,  -6);   // rear top
  ctx.lineTo(-112,  14);   // rear
  ctx.lineTo( -88,  24);   // floor rear
  ctx.lineTo( 122,  24);   // floor front
  ctx.lineTo( 130,   4);
  ctx.closePath();
  ctx.fillStyle   = 'rgba(18,18,18,0.95)';
  ctx.shadowBlur  = 0;
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth   = 1.6;
  ctx.shadowColor = accent;
  ctx.shadowBlur  = 8;
  ctx.stroke();

  // Nose cone colour flash
  ctx.beginPath();
  ctx.moveTo(130,  4);
  ctx.lineTo( 95, -2);
  ctx.lineTo( 95, 24);
  ctx.lineTo(130, 24);
  ctx.closePath();
  ctx.fillStyle  = accent;
  ctx.shadowBlur = 18;
  ctx.fill();

  // Cockpit halo arc
  ctx.beginPath();
  ctx.arc(8, -18, 24, Math.PI * 1.15, Math.PI * -0.05, false);
  ctx.strokeStyle = accent;
  ctx.lineWidth   = 4.5;
  ctx.shadowBlur  = 20;
  ctx.stroke();

  // Engine cover centre line
  ctx.beginPath();
  ctx.moveTo(-8, -34);
  ctx.lineTo(-98, -6);
  ctx.strokeStyle = accent + 'BB';
  ctx.lineWidth   = 1.5;
  ctx.shadowBlur  = 6;
  ctx.stroke();

  // Side pod detail stripe
  ctx.beginPath();
  ctx.moveTo(-52, -22);
  ctx.lineTo(-52,  24);
  ctx.strokeStyle = accent + '55';
  ctx.lineWidth   = 1;
  ctx.shadowBlur  = 0;
  ctx.stroke();

  // Rear wing – vertical pillar
  ctx.beginPath();
  ctx.moveTo(-100, -66);
  ctx.lineTo(-100,   5);
  ctx.strokeStyle = accent;
  ctx.lineWidth   = 3.5;
  ctx.shadowBlur  = 14;
  ctx.stroke();

  // Rear wing – main element
  ctx.beginPath();
  ctx.moveTo(-118, -66);
  ctx.lineTo( -78, -66);
  ctx.lineWidth  = 7;
  ctx.shadowBlur = 18;
  ctx.stroke();

  // Rear wing – DRS slot
  ctx.beginPath();
  ctx.moveTo(-116, -53);
  ctx.lineTo( -80, -53);
  ctx.strokeStyle = accent + '66';
  ctx.lineWidth   = 3;
  ctx.shadowBlur  = 6;
  ctx.stroke();

  // Front wing – vertical endplate
  ctx.beginPath();
  ctx.moveTo(132,  24);
  ctx.lineTo(132,  40);
  ctx.strokeStyle = accent;
  ctx.lineWidth   = 3;
  ctx.shadowBlur  = 10;
  ctx.stroke();

  // Front wing – main element
  ctx.beginPath();
  ctx.moveTo(148,  34);
  ctx.lineTo(108,  34);
  ctx.lineWidth  = 5;
  ctx.shadowBlur = 12;
  ctx.stroke();

  // Front wing – second flap
  ctx.beginPath();
  ctx.moveTo(144,  40);
  ctx.lineTo(110,  40);
  ctx.strokeStyle = accent + '88';
  ctx.lineWidth   = 3;
  ctx.shadowBlur  = 8;
  ctx.stroke();

  // ── Wheels ──────────────────────────────────────────────
  const drawWheel = (wx, wy, r, spokeR) => {
    // Tyre
    ctx.beginPath();
    ctx.arc(wx, wy, r, 0, Math.PI * 2);
    ctx.fillStyle  = '#0E0E0E';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#000';
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth   = 2.5;
    ctx.shadowColor = accent;
    ctx.shadowBlur  = 12;
    ctx.stroke();
    // Rim
    ctx.beginPath();
    ctx.arc(wx, wy, spokeR, 0, Math.PI * 2);
    ctx.strokeStyle = accent + '88';
    ctx.lineWidth   = 1.5;
    ctx.shadowBlur  = 6;
    ctx.stroke();
    // Spokes (rotating)
    for (let s = 0; s < 5; s++) {
      const ang = (s / 5) * Math.PI * 2 + time * 1.2;
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(ang) * (spokeR * 0.35), wy + Math.sin(ang) * (spokeR * 0.35));
      ctx.lineTo(wx + Math.cos(ang) * (spokeR * 0.9),  wy + Math.sin(ang) * (spokeR * 0.9));
      ctx.strokeStyle = accent + 'AA';
      ctx.lineWidth   = 1.5;
      ctx.shadowBlur  = 4;
      ctx.stroke();
    }
  };

  drawWheel(-60, 42, 28, 17);
  drawWheel(110, 42, 22, 13);
}

/* ── Component ──────────────────────────────────────────── */
export const HeroCanvas = ({ accentColor = '#E5001A' }) => {
  const canvasRef = useRef(null);
  const stateRef  = useRef({
    particles: [],
    mouseX: 0, mouseY: 0,
    tiltX: 0,  tiltY: 0,
    time: 0,
    raf: null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx   = canvas.getContext('2d');
    const state = stateRef.current;

    /* Sizing */
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* Mouse tilt */
    const onMouse = e => {
      const r = canvas.getBoundingClientRect();
      state.mouseX = ((e.clientX - r.left)  / r.width)  * 2 - 1;
      state.mouseY = ((e.clientY - r.top)   / r.height) * 2 - 1;
    };
    window.addEventListener('mousemove', onMouse);

    /* Gyroscope fallback (mobile) */
    const onGyro = e => {
      state.mouseX = (e.gamma ?? 0) / 45;
      state.mouseY = (e.beta  ?? 0) / 45;
    };
    window.addEventListener('deviceorientation', onGyro);

    /* Animation loop */
    const loop = () => {
      state.raf  = requestAnimationFrame(loop);
      state.time += 0.016;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      // Smooth tilt lerp
      state.tiltX += (state.mouseY * 0.25 - state.tiltX) * 0.06;
      state.tiltY += (state.mouseX * 0.25 - state.tiltY) * 0.06;

      ctx.clearRect(0, 0, w, h);

      const rgb = hexToRgb(accentColor);

      // ── Grid ─────────────────────────────────────────────
      ctx.save();
      ctx.strokeStyle = `rgba(${rgb},0.035)`;
      ctx.lineWidth   = 1;
      for (let x = 0; x < w; x += 64) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 64) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.restore();

      // Car world position
      const carX = w * 0.52;
      const carY = h * 0.50;

      // ── Static speed lines ───────────────────────────────
      ctx.save();
      for (let i = 0; i < SPEED_LINE_COUNT; i++) {
        const t      = ((i * 137.5 + state.time * 25) % (carX - 60)) / (carX - 60);
        const lx     = (carX - 80) * (1 - t);
        const ly     = carY - 55 + (i / SPEED_LINE_COUNT) * 115;
        const alpha  = (0.03 + (i % 4) * 0.018) * (1 - t * 0.6);
        const llen   = 35 + (i % 5) * 25;
        ctx.beginPath();
        ctx.moveTo(lx,        ly);
        ctx.lineTo(lx - llen, ly);
        ctx.strokeStyle = `rgba(${rgb},${alpha})`;
        ctx.lineWidth   = 0.8 + (i % 3) * 0.4;
        ctx.stroke();
      }
      ctx.restore();

      // ── Particles ────────────────────────────────────────
      if (state.particles.length < MAX_PARTICLES && Math.random() < 0.55) {
        state.particles.push(mkParticle(carX, carY));
      }
      state.particles = state.particles.filter(p => p.life > 0);
      ctx.save();
      for (const p of state.particles) {
        p.x   += p.vx;
        p.y   += p.vy;
        p.life -= p.decay;
        const a = p.life * 0.65;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.len, p.y);
        ctx.strokeStyle = `rgba(${rgb},${a})`;
        ctx.lineWidth   = p.w;
        ctx.stroke();
      }
      ctx.restore();

      // ── Ground glow ──────────────────────────────────────
      const grd = ctx.createRadialGradient(carX - 20, carY + 58, 0, carX - 20, carY + 58, 150);
      grd.addColorStop(0, accentColor + '28');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.ellipse(carX - 20, carY + 62, 155, 18, 0, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // ── Car ──────────────────────────────────────────────
      const scale = Math.min(w / 620, h / 350, 1.8);
      ctx.save();
      ctx.translate(
        carX + state.tiltY * 22,
        carY + state.tiltX * 14,
      );
      ctx.scale(scale, scale);
      // Subtle float oscillation
      ctx.translate(0, Math.sin(state.time * 0.8) * 3);
      drawCar(ctx, accentColor, state.time);
      ctx.restore();

      // ── Scanlines ────────────────────────────────────────
      ctx.save();
      for (let sy = 0; sy < h; sy += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.055)';
        ctx.fillRect(0, sy, w, 2);
      }
      ctx.restore();
    };

    loop();
    return () => {
      cancelAnimationFrame(state.raf);
      ro.disconnect();
      window.removeEventListener('mousemove',         onMouse);
      window.removeEventListener('deviceorientation', onGyro);
    };
  }, [accentColor]);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
      aria-hidden="true"
    />
  );
};
