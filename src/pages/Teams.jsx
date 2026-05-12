import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import teams from '../data/teams.js';
import drivers from '../data/drivers.js';
import './Teams.css';

gsap.registerPlugin(ScrollTrigger);

export const Teams = () => {
  const pageRef = useRef(null);
  const rowRefs = useRef([]);
  const barRefs = useRef([]);

  rowRefs.current = [];
  barRefs.current = [];

  const maxPoints = teams[0]?.points ?? 1;
  const leader    = teams[0];

  useGSAP(() => {
    const rows = rowRefs.current.filter(Boolean);
    const bars = barRefs.current.filter(Boolean);

    const mm = gsap.matchMedia();
    mm.add(
      {
        isNormal:  '(prefers-reduced-motion: no-preference)',
        isReduced: '(prefers-reduced-motion: reduce)',
      },
      (ctx) => {
        const { isNormal } = ctx.conditions;

        rows.forEach((row, i) => {
          gsap.from(row, {
            autoAlpha: 0,
            y:        isNormal ? 6 : 0,
            duration: isNormal ? 0.4 : 0,
            ease: 'power2.out',
            delay: isNormal ? Math.min(i, 8) * 0.055 : 0,
            scrollTrigger: { trigger: row, start: 'top 93%', toggleActions: 'play none none none' },
          });
        });

        bars.forEach((bar, i) => {
          const team = teams[i];
          const pct  = Math.round((team.points / maxPoints) * 100);
          gsap.fromTo(bar, { width: '0%' }, {
            width: `${pct}%`,
            duration: isNormal ? 1.2 : 0,
            ease: 'power3.out',
            delay: isNormal ? Math.min(i, 8) * 0.055 + 0.18 : 0,
            scrollTrigger: { trigger: bar, start: 'top 93%', toggleActions: 'play none none none' },
          });
        });

        return () => mm.revert();
      }
    );
  }, { scope: pageRef });

  useEffect(() => { ScrollTrigger.refresh(); }, []);

  return (
    <div className="page teams-page" ref={pageRef}>

      {/* Breadcrumb */}
      <div className="tm-subbar">
        <span className="tm-subbar__crumbs">
          Classements <em>/</em> <span>Écuries</span>
        </span>
        <span>Après Round 06 · Miami</span>
      </div>

      {/* Masthead */}
      <section className="tm-head">
        <div className="tm-head__ghost" aria-hidden="true">26</div>
        <div className="tm-head__left">
          <h1 className="tm-title">CLASSEMENT <span className="accent">ÉCURIES</span></h1>
          <div className="tm-sub">
            <span>{teams.length} CONSTRUCTEURS</span>
            <span className="silver">· 20 PILOTES · SAISON 2026</span>
          </div>
        </div>
        <div className="tm-head__leader">
          <div className="tm-leader-label">/ Leader constructeurs</div>
          <div className="tm-leader-name">
            <span
              className="tm-leader-pip"
              style={{ background: leader.color }}
            />
            <b>{leader.name}</b>
          </div>
          <div className="tm-leader-pts">
            {leader.points} <span className="tm-leader-unit">PTS</span>
          </div>
          <div className="tm-leader-chassis">{leader.chassis} · {leader.engine}</div>
        </div>
      </section>

      {/* Meta strip */}
      <section className="tm-metabar">
        <div className="tm-metacell">
          <div className="tm-meta-k">/ Leader</div>
          <div className="tm-meta-v tm-meta-v--red">{leader.name}</div>
        </div>
        <div className="tm-metacell">
          <div className="tm-meta-k">/ Points leader</div>
          <div className="tm-meta-v">{leader.points}<span className="u">PTS</span></div>
        </div>
        <div className="tm-metacell">
          <div className="tm-meta-k">/ Victoires leader</div>
          <div className="tm-meta-v">{leader.wins}<span className="u">V</span></div>
        </div>
        <div className="tm-metacell">
          <div className="tm-meta-k">/ Podiums leader</div>
          <div className="tm-meta-v">{leader.podiums}<span className="u">P</span></div>
        </div>
      </section>

      {/* Table header */}
      <div className="tm-table-head">
        <span>POS</span>
        <span>ÉCURIE</span>
        <span>CHÂSSIS</span>
        <span>MOTEUR</span>
        <span>PILOTES</span>
        <span>PTS</span>
        <span>V · P · PP</span>
      </div>

      {/* Standings rows */}
      <div className="tm-table">
        {teams.map((team, i) => {
          const teamDrivers = drivers.filter((d) => d.teamId === team.id);
          const gap = i === 0 ? null : leader.points - team.points;
          const pct = Math.round((team.points / maxPoints) * 100);
          return (
            <article
              key={team.id}
              className="tm-row"
              ref={(el) => { rowRefs.current[i] = el; }}
            >
              <div className="tm-col-pos">
                <span className="tm-pos">{String(i + 1).padStart(2, '0')}</span>
              </div>

              <div className="tm-col-name">
                <div className="tm-name-wrap">
                  <span
                    className="tm-color-bar"
                    style={{ background: team.color }}
                  />
                  <div>
                    <div className="tm-name">{team.name}</div>
                    <div className="tm-fullname">{team.fullName}</div>
                  </div>
                </div>
                {gap !== null && (
                  <div className="tm-gap">— {gap} PTS</div>
                )}
              </div>

              <div className="tm-col-chassis">
                <span className="tm-chassis">{team.chassis}</span>
              </div>

              <div className="tm-col-engine">
                <span className="tm-engine">{team.engine}</span>
              </div>

              <div className="tm-col-drivers">
                {teamDrivers.map((d) => (
                  <span key={d.id} className="tm-driver-pill">
                    {d.number}
                  </span>
                ))}
              </div>

              <div className="tm-col-pts">
                <div className="tm-pts-block">
                  <span className="tm-pts">{team.points}</span>
                  <div className="tm-pts-bar-track">
                    <div
                      className="tm-pts-bar-fill"
                      style={{ '--team-color': team.color }}
                      ref={(el) => { barRefs.current[i] = el; }}
                    />
                  </div>
                </div>
              </div>

              <div className="tm-col-stats">
                <span className="tm-stat">{team.wins}</span>
                <span className="tm-stat-sep">·</span>
                <span className="tm-stat">{team.podiums}</span>
                <span className="tm-stat-sep">·</span>
                <span className="tm-stat">{team.poles}</span>
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
};
