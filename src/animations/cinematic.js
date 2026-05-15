/**
 * cinematic.js — global GSAP cinematic layer
 *
 * Exports two functions:
 *   initPageOverlay()  — fade the black launch veil, call once in App.jsx
 *   initHomeScene()    — circuit dot + heading reveals + parallax, call in Home.jsx
 *                        returns a cleanup fn safe to use as useEffect return value
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

/* ── Black launch veil ─────────────────────────────────────── */
export function initPageOverlay() {
  const el = document.querySelector('.anim-overlay');
  if (!el) return;
  gsap.to(el, {
    opacity: 0,
    duration: 0.6,
    ease: 'power2.inOut',
    delay: 0.18,
    onComplete() {
      el.style.display = 'none';
    },
  });
}

/* ── All home-page cinematic additions ─────────────────────── */
export function initHomeScene() {
  const ctx = gsap.context(() => {
    _dot();
    _headings();
    _parallax();
  });
  /* Return cleanup so React useEffect can call it on unmount */
  return () => ctx.revert();
}

/* Circuit dot travelling along the SVG track path ─────────── */
function _dot() {
  const dot = document.querySelector('#circuit-dot');
  if (!dot) return;
  gsap.set(dot, { opacity: 1 });
  gsap.to(dot, {
    motionPath: {
      path:        '#hero-track-main',
      align:       '#hero-track-main',
      alignOrigin: [0.5, 0.5],
      autoRotate:  false,
    },
    duration:  9,
    ease:      'none',
    repeat:   -1,
  });
}

/* sec-head h2 clip-path wipe-in as each enters view ────────── */
function _headings() {
  ScrollTrigger.batch('.gsap-heading', {
    onEnter(els) {
      gsap.to(els, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.72,
        stagger:  0.04,
        ease:     'power3.out',
        overwrite: 'auto',
      });
    },
    start: 'top 89%',
    once:  true,
  });
}

/* Subtle parallax: ghost number drifts slower than scroll ─── */
function _parallax() {
  const hero   = document.querySelector('.hero');
  const ghost  = document.querySelector('.hero__ghost');
  const canvas = document.querySelector('.hero-threed');
  if (!hero) return;

  const stBase = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.7 };

  if (ghost) {
    gsap.to(ghost,  { y: -78, ease: 'none', scrollTrigger: { ...stBase } });
  }
  if (canvas) {
    gsap.to(canvas, { y: -44, ease: 'none', scrollTrigger: { ...stBase } });
  }
}
