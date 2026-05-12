import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';
import races from '../data/races.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import './Alerts.css';

gsap.registerPlugin(ScrollTrigger);

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

export const Alerts = () => {
  const pageRef  = useRef(null);
  const rowRefs  = useRef([]);

  const [alerts, setAlerts] = useLocalStorage('pitlane_alerts', []);

  rowRefs.current = [];

  const toggle = (id) => {
    setAlerts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (alerts.length === races.length) {
      setAlerts([]);
    } else {
      setAlerts(races.map((r) => r.id));
    }
  };

  useGSAP(() => {
    const rows = rowRefs.current.filter(Boolean);
    if (!rows.length) return;
    rows.forEach((row, i) => {
      gsap.from(row, {
        opacity: 0,
        y: 6,
        duration: 0.4,
        ease: 'power2.out',
        delay: Math.min(i, 10) * 0.04,
        scrollTrigger: {
          trigger: row,
          start: 'top 93%',
          toggleActions: 'play none none none',
        },
      });
    });
  }, { scope: pageRef, dependencies: [] });

  useEffect(() => { ScrollTrigger.refresh(); }, []);

  const count = alerts.length;
  const allOn = count === races.length;

  return (
    <div className="page alerts-page" ref={pageRef}>

      {/* Breadcrumb */}
      <div className="al-subbar">
        <span className="al-subbar__crumbs">
          Profil <em>/</em> <span>Alertes</span>
        </span>
        <span>Saison 2026</span>
      </div>

      {/* Masthead */}
      <section className="al-head">
        <div className="al-head__ghost" aria-hidden="true">24</div>
        <div className="al-head__left">
          <h1 className="al-title">ALERTES <span className="accent">COURSES</span></h1>
          <div className="al-sub">
            <span>{count} ALERTE{count !== 1 ? 'S' : ''} ACTIVE{count !== 1 ? 'S' : ''}</span>
            <span className="silver">· NOTIFICATIONS · SAISON 2026</span>
          </div>
        </div>
        <div className="al-head__right">
          <div className="al-info">
            <div className="al-info-label">/ Activer toutes les courses</div>
            <button
              className={`al-toggle-all${allOn ? ' al-toggle-all--on' : ''}`}
              onClick={toggleAll}
            >
              <span className="al-toggle-all__dot" />
              {allOn ? 'TOUT DÉSACTIVER' : 'TOUT ACTIVER'}
            </button>
          </div>
        </div>
      </section>

      {/* Meta strip */}
      <section className="al-metabar">
        <div className="al-metacell">
          <div className="al-meta-k">/ Alertes actives</div>
          <div className="al-meta-v al-meta-v--red">
            {String(count).padStart(2, '0')}
            <span className="u">/ 24</span>
          </div>
        </div>
        <div className="al-metacell">
          <div className="al-meta-k">/ Races restantes</div>
          <div className="al-meta-v">{races.length - 6}<span className="u">GP</span></div>
        </div>
        <div className="al-metacell">
          <div className="al-meta-k">/ Sprints</div>
          <div className="al-meta-v">
            {alerts.filter((id) => races.find((r) => r.id === id && r.isSprint)).length}
            <span className="u">/ {races.filter((r) => r.isSprint).length}</span>
          </div>
        </div>
        <div className="al-metacell">
          <div className="al-meta-k">/ Couverture</div>
          <div className="al-meta-v">
            {Math.round((count / races.length) * 100)}
            <span className="u">%</span>
          </div>
        </div>
      </section>

      {/* Table header */}
      <div className="al-table-head">
        <span>RD</span>
        <span>GRAND PRIX</span>
        <span>DATES</span>
        <span>TYPE</span>
        <span>ALERTE</span>
      </div>

      {/* Race rows */}
      <div className="al-table">
        {races.map((race, i) => {
          const active = alerts.includes(race.id);
          return (
            <article
              key={race.id}
              className={`al-row${active ? ' al-row--on' : ''}`}
              ref={(el) => { rowRefs.current[i] = el; }}
            >
              <div className="al-col-round">
                <span className="al-round">{String(race.round).padStart(2, '0')}</span>
              </div>

              <div className="al-col-gp">
                <div className="al-gp-name">
                  <span className="al-flag">{flagEmoji(race.countryCode)}</span>
                  {race.name}
                  {race.isNewCircuit && (
                    <span className="al-badge-new">NEW</span>
                  )}
                </div>
                <div className="al-circuit">{race.circuit}</div>
              </div>

              <div className="al-col-dates">
                <b>{fmtShort(race.dateStart)}</b> — {fmtShort(race.dateEnd)}
              </div>

              <div className="al-col-type">
                {race.isSprint ? (
                  <span className="al-tag al-tag--sprint">SPRINT</span>
                ) : (
                  <span className="al-tag">STANDARD</span>
                )}
              </div>

              <div className="al-col-toggle">
                <button
                  className={`al-toggle${active ? ' al-toggle--on' : ''}`}
                  onClick={() => toggle(race.id)}
                  aria-label={active ? 'Désactiver alerte' : 'Activer alerte'}
                >
                  <span className="al-toggle__track">
                    <span className="al-toggle__thumb" />
                  </span>
                  <span className="al-toggle__label">
                    {active ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
};
