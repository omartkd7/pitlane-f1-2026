import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import drivers from '../data/drivers.js';
import teams from '../data/teams.js';
import './Drivers.css';

gsap.registerPlugin(ScrollTrigger);

const flagEmoji = (code) =>
  [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');

export const Drivers = () => {
  const pageRef = useRef(null);
  const rowRefs = useRef([]);

  rowRefs.current = [];

  useGSAP(() => {
    const rows = rowRefs.current.filter(Boolean);
    if (!rows.length) return;
    rows.forEach((row, i) => {
      gsap.from(row, {
        opacity: 0,
        y: 6,
        duration: 0.4,
        ease: 'power2.out',
        delay: Math.min(i, 10) * 0.045,
        scrollTrigger: {
          trigger: row,
          start: 'top 93%',
          toggleActions: 'play none none none',
        },
      });
    });
  }, { scope: pageRef });

  useEffect(() => { ScrollTrigger.refresh(); }, []);

  const leader = drivers[0];
  const maxPoles = drivers.reduce((m, d) => d.poles > m ? d.poles : m, 0);

  return (
    <div className="page drivers-page" ref={pageRef}>

      {/* Breadcrumb */}
      <div className="dr-subbar">
        <span className="dr-subbar__crumbs">
          Classements <em>/</em> <span>Pilotes</span>
        </span>
        <span>Après Round 06 · Miami</span>
      </div>

      {/* Masthead */}
      <section className="dr-head">
        <div className="dr-head__ghost" aria-hidden="true">26</div>
        <div className="dr-head__left">
          <h1 className="dr-title">CLASSEMENT <span className="accent">PILOTES</span></h1>
          <div className="dr-sub">
            <span>{drivers.length} PILOTES</span>
            <span className="silver">· 10 ÉCURIES · SAISON 2026</span>
          </div>
        </div>
        <div className="dr-head__leader">
          <div className="dr-leader-label">/ Leader du championnat</div>
          <div className="dr-leader-name">
            {leader.firstName} <b>{leader.lastName}</b>
          </div>
          <div className="dr-leader-pts">
            {leader.points} <span className="dr-leader-unit">PTS</span>
          </div>
          <div className="dr-leader-team">{leader.team}</div>
        </div>
      </section>

      {/* Meta strip */}
      <section className="dr-metabar">
        <div className="dr-metacell">
          <div className="dr-meta-k">/ Leader</div>
          <div className="dr-meta-v dr-meta-v--red">{leader.firstName} {leader.lastName}</div>
        </div>
        <div className="dr-metacell">
          <div className="dr-meta-k">/ Points leader</div>
          <div className="dr-meta-v">{leader.points}<span className="u">PTS</span></div>
        </div>
        <div className="dr-metacell">
          <div className="dr-meta-k">/ Victoires max</div>
          <div className="dr-meta-v">{leader.wins}<span className="u">V</span></div>
        </div>
        <div className="dr-metacell">
          <div className="dr-meta-k">/ Poles max</div>
          <div className="dr-meta-v">{maxPoles}<span className="u">PP</span></div>
        </div>
      </section>

      {/* Table header */}
      <div className="dr-table-head">
        <span>POS</span>
        <span>N°</span>
        <span>PILOTE</span>
        <span>ÉCURIE</span>
        <span>NAT</span>
        <span>PTS</span>
        <span>V · P · PP</span>
      </div>

      {/* Standings rows */}
      <div className="dr-table">
        {drivers.map((driver, i) => {
          const team = teams.find((t) => t.id === driver.teamId);
          const gap  = i === 0 ? null : leader.points - driver.points;
          return (
            <article
              key={driver.id}
              className={`dr-row${driver.isChampionshipLead ? ' dr-row--lead' : ''}`}
              ref={(el) => { rowRefs.current[i] = el; }}
            >
              <div className="dr-col-pos">
                <span className="dr-pos">{String(i + 1).padStart(2, '0')}</span>
              </div>

              <div className="dr-col-num">
                <span className="dr-num">{driver.number}</span>
              </div>

              <div className="dr-col-name">
                <div className="dr-name-wrap">
                  <span className="dr-firstname">{driver.firstName}</span>
                  <span className="dr-lastname">{driver.lastName}</span>
                </div>
                {gap !== null && (
                  <div className="dr-gap">— {gap} PTS</div>
                )}
              </div>

              <div className="dr-col-team">
                <span
                  className="dr-team-pip"
                  style={{ background: team?.color ?? 'var(--silver)' }}
                />
                <span className="dr-team-name">{driver.team}</span>
              </div>

              <div className="dr-col-nat">
                <span className="dr-flag">{flagEmoji(driver.countryCode)}</span>
              </div>

              <div className="dr-col-pts">
                <span className="dr-pts">{driver.points}</span>
              </div>

              <div className="dr-col-stats">
                <span className="dr-stat">{driver.wins}</span>
                <span className="dr-stat-sep">·</span>
                <span className="dr-stat">{driver.podiums}</span>
                <span className="dr-stat-sep">·</span>
                <span className="dr-stat">{driver.poles}</span>
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
};
