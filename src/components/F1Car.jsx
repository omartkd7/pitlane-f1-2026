import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './F1Car.css';

export const F1Car = ({ isDriving = false, className = '', primaryColor = '#FF1801', accentColor = '#00e5ff' }) => {
  const carRef = useRef(null);

  // Helper to get a darker shade of the primary color for shadows/accents
  const getDarkerColor = (hex) => {
    // Simple naive darkener for the F1 body
    if (hex === '#FF1801') return '#b30000';
    if (hex === '#00F2FE') return '#00a3b3';
    if (hex === '#FFE800') return '#b3a300';
    if (hex === '#B500FF') return '#7a00b3';
    if (hex === '#00FF00') return '#00b300';
    if (hex === '#FFFFFF') return '#b3b3b3';
    return '#b30000'; // fallback
  };

  const darkerColor = getDarkerColor(primaryColor);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Idle chassis bounce
      gsap.to('.f1-chassis', {
        y: 1.5,
        duration: 0.08,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      });

      // Wheels spin faster if driving
      gsap.to('.f1-wheel', {
        rotation: 360,
        duration: isDriving ? 0.15 : 2,
        repeat: -1,
        ease: 'none'
      });
      
      // Exhaust flame flickering
      gsap.to('.f1-exhaust', {
        scaleX: isDriving ? 1.5 : 0.6,
        opacity: isDriving ? 1 : 0.2,
        duration: 0.06,
        yoyo: true,
        repeat: -1,
        ease: 'power1.inOut',
        transformOrigin: "right center"
      });
    });
  }, { scope: carRef, dependencies: [isDriving] });

  return (
    <div className={`f1-car-container ${isDriving ? 'driving' : 'idle'} ${className}`} ref={carRef}>
      <svg className="f1-car-svg" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
        {/* Exhaust Flame */}
        <path className="f1-exhaust" d="M10,40 L0,38 L0,42 Z" fill={accentColor} />
        
        {/* Chassis / Body */}
        <g className="f1-chassis">
          {/* Rear Wing */}
          <rect x="15" y="15" width="10" height="25" fill={primaryColor} rx="2" style={{ transition: 'fill 0.3s ease' }} />
          <rect x="10" y="10" width="20" height="5" fill="#111" />
          
          {/* Main Body */}
          <path d="M25,40 L160,40 L140,25 L60,25 Z" fill={primaryColor} style={{ transition: 'fill 0.3s ease' }} />
          <path d="M40,25 L100,25 L90,15 L60,15 Z" fill={darkerColor} style={{ transition: 'fill 0.3s ease' }} />
          
          {/* Cockpit / Driver */}
          <circle cx="85" cy="20" r="6" fill="#fff" />
          <path d="M75,25 Q85,15 95,25" fill="#111" />

          {/* Front Wing */}
          <rect x="160" y="35" width="30" height="5" fill="#111" rx="2" />
          <path d="M165,30 L190,30 L195,40 L160,40 Z" fill={primaryColor} style={{ transition: 'fill 0.3s ease' }} />
          
          {/* F1 Details / Sponsors */}
          <line x1="70" y1="35" x2="130" y2="35" stroke="#fff" strokeWidth="1" opacity="0.5" />
          <circle cx="120" cy="32" r="3" fill={accentColor} style={{ transition: 'fill 0.3s ease' }} />
        </g>
        
        {/* Rear Wheel */}
        <g className="f1-wheel" style={{ transformOrigin: '40px 40px' }}>
          <circle cx="40" cy="40" r="14" fill="#0a0a0a" />
          <circle cx="40" cy="40" r="7" fill="#333" />
          <circle cx="40" cy="40" r="3" fill={primaryColor} style={{ transition: 'fill 0.3s ease' }} />
          <circle cx="40" cy="40" r="14" fill="none" stroke={accentColor} strokeWidth="1.5" opacity="0.8" style={{ transition: 'stroke 0.3s ease' }} />
        </g>
        
        {/* Front Wheel */}
        <g className="f1-wheel" style={{ transformOrigin: '145px 40px' }}>
          <circle cx="145" cy="40" r="12" fill="#0a0a0a" />
          <circle cx="145" cy="40" r="6" fill="#333" />
          <circle cx="145" cy="40" r="3" fill={primaryColor} style={{ transition: 'fill 0.3s ease' }} />
          <circle cx="145" cy="40" r="12" fill="none" stroke={accentColor} strokeWidth="1.5" opacity="0.8" style={{ transition: 'stroke 0.3s ease' }} />
        </g>
      </svg>
    </div>
  );
};
