/**
 * HeroThreeD — Three.js r184 WebGL hero overlay
 *
 * Scene overview
 * ──────────────
 * • Procedural low-poly F1 car: body, nose, sidepods, cockpit,
 *   halo arc, 4 wheels+rims, front wing (2-flap + endplates),
 *   rear wing (element + DRS slot + endplates + pillar).
 * • Lighting: AmbientLight(0.4) + shadow DirectionalLight(1.2)
 *   top-right + cool rim DirectionalLight(0.45) back-left
 *   + accent under-fill.
 * • Auto-rotate Y (0.003 rad/frame) + mouse parallax (max ±0.3 rad,
 *   smooth lerp at 0.055 / frame).
 * • 80 LineSegment speed-lines in world space, each with individual
 *   velocity, reset behind car when they clear the nose.
 * • ShadowMaterial ground plane (opacity 0.15) for grounded feel
 *   without breaking the transparent background.
 * • Transparent WebGLRenderer — CSS hero gradient shows through.
 * • Mobile (< 768 px or touch): particles off, pixelRatio capped at 1,
 *   antialias off.
 * • Cleans up fully on unmount / accentColor prop change.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './HeroThreeD.css';

/* ── hex "#rrggbb" → Three.js integer ───────────────────── */
const h2i = (hex) => parseInt(hex.replace('#', ''), 16);

/* ═══════════════════════════════════════════════════════════
   buildCar — procedural F1 car from Three.js primitives
   Returns a THREE.Group centered roughly at origin.
   ═══════════════════════════════════════════════════════════ */
function buildCar(accentHex) {
  const g   = new THREE.Group();
  const ac  = h2i(accentHex);

  /* Materials */
  const mBody = new THREE.MeshStandardMaterial({ color: ac,       metalness: 0.65, roughness: 0.22 });
  const mDark = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, metalness: 0.22, roughness: 0.80 });
  const mTire = new THREE.MeshStandardMaterial({ color: 0x131313, metalness: 0.04, roughness: 0.96 });
  const mRim  = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.92, roughness: 0.08 });
  const mCarb = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, metalness: 0.55, roughness: 0.42 });
  const mHalo = new THREE.MeshStandardMaterial({ color: ac,       metalness: 0.84, roughness: 0.16 });

  /* Helper: create mesh, position, rotate, add to group */
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  };

  /* ── Main chassis / body ───────────────────────────────── */
  add(new THREE.BoxGeometry(4.20, 0.27, 1.08), mBody,  0.00, 0.135, 0.00); // hull
  add(new THREE.BoxGeometry(1.05, 0.17, 0.76), mBody,  2.55, 0.085, 0.00); // nose cone
  add(new THREE.BoxGeometry(1.60, 0.17, 0.80), mCarb, -0.60, 0.260, 0.00); // engine cover

  /* ── Sidepods ──────────────────────────────────────────── */
  add(new THREE.BoxGeometry(1.45, 0.20, 0.22), mCarb, -0.55, 0.10,  0.64); // L
  add(new THREE.BoxGeometry(1.45, 0.20, 0.22), mCarb, -0.55, 0.10, -0.64); // R

  /* ── Cockpit ───────────────────────────────────────────── */
  add(new THREE.BoxGeometry(0.75, 0.30, 0.64), mDark,  0.28, 0.42,  0.00);

  /* ── Halo — TorusGeometry as a half-ring arch ─────────── */
  const haloMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.275, 0.044, 8, 30, Math.PI),
    mHalo
  );
  haloMesh.position.set(0.22, 0.60, 0);
  haloMesh.rotation.set(0, 0, Math.PI / 2); // arch faces up
  haloMesh.castShadow = true;
  g.add(haloMesh);

  /* ── Wheels: [x, z, radius, tread-width] ──────────────── */
  const wheels = [
    [-1.12,  0.770, 0.335, 0.390],  // rear L
    [-1.12, -0.770, 0.335, 0.390],  // rear R
    [ 1.65,  0.715, 0.308, 0.345],  // front L (narrower)
    [ 1.65, -0.715, 0.308, 0.345],  // front R
  ];
  wheels.forEach(([wx, wz, r, w]) => {
    /* Tyre — black rubber */
    add(new THREE.CylinderGeometry(r,    r,    w,      24), mTire, wx, 0, wz, Math.PI / 2);
    /* Rim — metallic disc */
    add(new THREE.CylinderGeometry(r*.56, r*.56, w+.02, 20), mRim,  wx, 0, wz, Math.PI / 2);
    /* Axle nub — tiny center boss */
    add(new THREE.CylinderGeometry(r*.14, r*.14, w+.04, 10), mDark, wx, 0, wz, Math.PI / 2);
  });

  /* ── Front wing ────────────────────────────────────────── */
  add(new THREE.BoxGeometry(0.055, 0.068, 2.02), mBody,  3.06, -0.080, 0.00); // main element
  add(new THREE.BoxGeometry(0.055, 0.052, 1.88), mCarb,  2.93, -0.040, 0.00); // second flap
  add(new THREE.BoxGeometry(0.060, 0.290, 0.060), mBody, 3.06,  0.038,  1.03); // endplate L
  add(new THREE.BoxGeometry(0.060, 0.290, 0.060), mBody, 3.06,  0.038, -1.03); // endplate R

  /* ── Rear wing ─────────────────────────────────────────── */
  add(new THREE.BoxGeometry(0.090, 0.600, 0.090), mCarb, -2.10, 0.460,  0.00); // pillar
  add(new THREE.BoxGeometry(0.075, 0.115, 1.540), mBody, -2.10, 0.785,  0.00); // upper element
  add(new THREE.BoxGeometry(0.060, 0.080, 1.440), mCarb, -2.10, 0.665,  0.00); // DRS slot
  add(new THREE.BoxGeometry(0.060, 0.540, 0.060), mBody, -2.10, 0.530,  0.78); // endplate L
  add(new THREE.BoxGeometry(0.060, 0.540, 0.060), mBody, -2.10, 0.530, -0.78); // endplate R

  return g;
}

/* ═══════════════════════════════════════════════════════════
   buildSpeedLines — 80 LineSegment speed-lines that
   advance along +X every frame and reset behind the car.
   ═══════════════════════════════════════════════════════════ */
function buildSpeedLines(accentHex, count = 80) {
  /* Each line = 2 vertices × 3 floats in a flat buffer */
  const pos  = new Float32Array(count * 6);
  const vels = new Float32Array(count);
  const lens = new Float32Array(count);

  /* Reset one line to a random position behind the car */
  const reset = (i) => {
    const x = -3.8 - Math.random() * 9.0;      // behind car
    const y = (Math.random() - 0.5) * 1.80;
    const z = (Math.random() - 0.5) * 2.60;
    const l = lens[i];
    pos[i*6]   = x;     pos[i*6+1] = y; pos[i*6+2] = z;     // tail vertex
    pos[i*6+3] = x + l; pos[i*6+4] = y; pos[i*6+5] = z;     // head vertex
  };

  /* Initialise with scattered positions so they don't all start together */
  for (let i = 0; i < count; i++) {
    vels[i] = 0.055 + Math.random() * 0.14;
    lens[i] = 0.10  + Math.random() * 0.60;
    reset(i);
    /* Scatter initial X so lines fill the space from the start */
    const scatter = Math.random() * 14;
    pos[i*6]   += scatter;
    pos[i*6+3] += scatter;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.LineBasicMaterial({
    color:       h2i(accentHex),
    transparent: true,
    opacity:     0.42,
  });

  const lines = new THREE.LineSegments(geo, mat);

  /* tick() called once per animation frame */
  lines.tick = () => {
    for (let i = 0; i < count; i++) {
      const v = vels[i];
      pos[i*6]   += v;
      pos[i*6+3] += v;
      /* Reset when the trailing vertex clears the car nose (~x 3.8) */
      if (pos[i*6] > 4.0) reset(i);
    }
    geo.attributes.position.needsUpdate = true;
  };

  return lines;
}

/* ═══════════════════════════════════════════════════════════
   HeroThreeD — React component
   ═══════════════════════════════════════════════════════════ */
export const HeroThreeD = ({ accentColor = '#E5001A' }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const mobile = window.innerWidth < 768 || 'ontouchstart' in window;

    /* ── Renderer ────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({
      antialias:       !mobile,
      alpha:            true,          // transparent bg — CSS gradient shows through
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(mobile ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;

    const initW = container.clientWidth  || 800;
    const initH = container.clientHeight || 420;
    renderer.setSize(initW, initH);
    container.appendChild(renderer.domElement);

    /* ── Scene ───────────────────────────────────────────── */
    const scene = new THREE.Scene();
    /* No fog/background — alpha transparent */

    /* ── Camera ──────────────────────────────────────────── */
    const camera = new THREE.PerspectiveCamera(42, initW / initH, 0.1, 100);
    /* Position: slightly left of car, elevated, looking at car origin */
    camera.position.set(-0.6, 1.5, 7.8);
    camera.lookAt(0, 0, 0);

    /* ── Lighting ────────────────────────────────────────── */
    /* Ambient fill — soft, no directionality */
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    /* Key light — top-right, warm white, casts PCF shadow */
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(4, 6, 3);
    key.castShadow               = true;
    key.shadow.mapSize.setScalar(1024);
    key.shadow.camera.near       = 1;
    key.shadow.camera.far        = 20;
    key.shadow.camera.left       = -6;
    key.shadow.camera.right      = 6;
    key.shadow.camera.top        = 5;
    key.shadow.camera.bottom     = -5;
    scene.add(key);

    /* Rim light — cool blue-violet from behind-left for depth */
    const rim = new THREE.DirectionalLight(0x3355ff, 0.45);
    rim.position.set(-5, 1.5, -3);
    scene.add(rim);

    /* Accent under-fill — makes coloured panels glow slightly */
    const fill = new THREE.DirectionalLight(h2i(accentColor), 0.18);
    fill.position.set(0, -4, 3);
    scene.add(fill);

    /* ── Shadow-catcher ground plane ─────────────────────── */
    /* Invisible plane that only shows shadows — keeps car "grounded"
       without interfering with the transparent WebGL background.     */
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 16),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    );
    ground.rotation.x    = -Math.PI / 2;
    ground.position.y    = -0.34;           // just below wheel centre
    ground.receiveShadow = true;
    scene.add(ground);

    /* ── F1 Car ──────────────────────────────────────────── */
    const car = buildCar(accentColor);
    car.scale.setScalar(0.78);
    /* Shift right of centre so hero text can live on the left */
    car.position.set(1.6, 0.27, 0);
    scene.add(car);

    /* ── Speed-line particles (world space, desktop only) ── */
    let lines = null;
    if (!mobile) {
      lines = buildSpeedLines(accentColor);
      /* Match the car's world-space X/Y so lines pass through the car */
      lines.position.set(car.position.x, car.position.y, 0);
      scene.add(lines);
    }

    /* ── Animation state ─────────────────────────────────── */
    const state = {
      autoY:  0,     // accumulated Y auto-rotation (radians)
      lerpX:  0,     // current parallax X (pitch)
      lerpY:  0,     // current parallax Y (yaw additive)
      mouseX: 0,     // normalised cursor -1…1
      mouseY: 0,
    };

    /* ── Mouse parallax ──────────────────────────────────── */
    const onMove = (e) => {
      state.mouseX =  (e.clientX / window.innerWidth)  * 2 - 1;
      state.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    /* ── Responsive resize via ResizeObserver ────────────── */
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    /* ── Render loop ─────────────────────────────────────── */
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);

      /* 1. Continuous Y auto-rotation */
      state.autoY += 0.003;

      /* 2. Smooth parallax — lerp toward cursor (max ±0.30 rad) */
      state.lerpX += (state.mouseY * 0.30 - state.lerpX) * 0.055;
      state.lerpY += (state.mouseX * 0.30 - state.lerpY) * 0.055;

      /* 3. Apply: pitch = parallax, yaw = auto + parallax */
      car.rotation.x = state.lerpX;
      car.rotation.y = state.autoY + state.lerpY;

      /* 4. Advance speed lines */
      if (lines) lines.tick();

      renderer.render(scene, camera);
    };
    animate();

    /* ── Cleanup on unmount or accentColor change ────────── */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      ro.disconnect();

      /* Dispose every geometry and material in the scene */
      scene.traverse((obj) => {
        if (obj.isMesh || obj.isLineSegments) {
          obj.geometry?.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m?.dispose());
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [accentColor]); /* re-run whenever theme accent changes */

  return (
    <div
      ref={mountRef}
      className="hero-threed"
      aria-hidden="true"
      role="presentation"
    />
  );
};
