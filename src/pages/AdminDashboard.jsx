import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import {
  Search, Clock, AlertCircle, LogOut, ChevronRight,
  ChevronLeft, List, Calendar as FullCalIcon, Users, Phone, Mail, Activity
} from 'lucide-react';
import {
  format, parseISO, addDays, subDays, startOfDay,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  isSameMonth, isSameDay, eachDayOfInterval, addMonths, subMonths
} from 'date-fns';
import { fr } from 'date-fns/locale';
import toast, { Toaster } from 'react-hot-toast';

/* ─── CHARTE BELLE IMAGERIE ───────────────────────────────────────────────
   Fond principal   : #0a0f2e  (bleu marine profond)
   Accent principal : #00c8c8  (cyan turquoise)
   Accent secondaire: #6366f1  (indigo violet)
   Succès           : #00c864
   Danger           : #f43f5e
──────────────────────────────────────────────────────────────────────────── */

const BI_ADMIN_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
  * { font-family: 'Sora', sans-serif; box-sizing: border-box; }
  body, #root { background: #0a0f2e; }

  .bi-glass {
    background: rgba(255,255,255,0.025);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .bi-slot-card {
    background: linear-gradient(135deg, #00c8c8 0%, #6366f1 100%);
    border-left: 4px solid rgba(255,255,255,0.4);
  }
  .bi-view-btn-active {
    background: #00c8c8 !important;
    color: #0a0f2e !important;
    box-shadow: 0 4px 20px rgba(0,200,200,0.3);
  }
  .bi-view-btn-inactive {
    background: transparent;
    color: #475569;
  }
  .bi-view-btn-inactive:hover { color: #94a3b8; }
  .bi-cal-day {
    min-height: 60px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.02);
    transition: all 0.15s ease;
    cursor: pointer;
  }
  .bi-cal-day:hover { background: rgba(0,200,200,0.04); border-color: rgba(0,200,200,0.2); }
  .bi-cal-day.selected { border-color: #00c8c8; background: rgba(0,200,200,0.08); }
  .bi-dir-card:hover { border-color: rgba(0,200,200,0.3) !important; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

  /* ── NAVBAR ── */
  .admin-nav-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* ── HEADER SUPERVISION ── */
  .admin-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 36px;
  }

  /* ── VIEW TABS ── */
  .view-tabs {
    display: flex;
    margin-top: 16px;
    gap: 4px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(0,200,200,0.08);
    border-radius: 14px;
    padding: 4px;
    flex-wrap: wrap;
  }

  /* ── CONTROLS (search + date nav) ── */
  .admin-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(0,200,200,0.1);
    border-radius: 14px;
    padding: 10px 16px;
    min-width: 220px;
    flex: 1;
  }
  .search-box input {
    background: none;
    border: none;
    outline: none;
    color: #e2e8f0;
    font-size: 13px;
    font-weight: 600;
    width: 100%;
    font-family: 'Sora', sans-serif;
  }

  .date-nav {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(0,200,200,0.06);
    border: 1px solid rgba(0,200,200,0.18);
    border-radius: 14px;
    padding: 4px;
  }
  .date-nav-btn {
    padding: 8px 10px;
    background: none;
    border: none;
    color: #00c8c8;
    cursor: pointer;
    border-radius: 8px;
    display: flex;
    align-items: center;
  }
  .date-nav-label {
    text-align: center;
    padding: 0 12px;
    min-width: 130px;
  }

  /* ── LIST / DIRECTORY GRID ── */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  /* ── AGENDA HEADER ── */
  .agenda-header {
    padding: 20px 28px;
    border-bottom: 1px solid rgba(0,200,200,0.08);
    background: rgba(0,200,200,0.03);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  /* ── TIMELINE ── */
  .timeline-wrapper {
    flex: 1;
    overflow-y: auto;
    position: relative;
    padding: 16px 20px;
    background: rgba(10,15,46,0.6);
  }
  .timeline-hour {
    display: flex;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    height: 96px;
    position: relative;
  }
  .timeline-hour-label {
    font-size: 10px;
    font-weight: 700;
    color: #1e293b;
    margin-top: -10px;
    letter-spacing: -0.5px;
    flex-shrink: 0;
    /* width set inline per breakpoint */
  }

  /* ── DIRECTORY CARD ── */
  .dir-card-actions {
    display: flex;
    gap: 10px;
    width: 100%;
  }

  /* ══ RESPONSIVE BREAKPOINTS ══════════════════════════════════════════════ */

  /* Mobile : < 640px */
  @media (max-width: 639px) {
    .admin-main {
      padding: 96px 12px 48px !important;
    }
    .admin-header {
      flex-direction: column;
      align-items: stretch;
    }
    .admin-title {
      font-size: 28px !important;
    }
    .view-tabs {
      overflow-x: auto;
    }
    .view-tab-label {
      display: none;
    }
    .admin-controls {
      flex-direction: column;
      align-items: stretch;
    }
    .search-box {
      min-width: 0;
    }
    .date-nav {
      justify-content: center;
    }
    .date-nav-label {
      min-width: 110px;
    }
    .agenda-container {
      height: 520px !important;
    }
    .agenda-header {
      padding: 14px 16px !important;
    }
    .timeline-wrapper {
      padding: 12px 10px !important;
    }
    .timeline-hour-label {
      width: 40px !important;
    }
    .timeline-col-spacer {
      /* left offset for slot cards on mobile */
    }
    .slot-doctor-name {
      font-size: 11px !important;
    }
    .cards-grid {
      grid-template-columns: 1fr;
    }
    .dir-card-actions {
      flex-direction: column;
    }
  }

  /* Tablette : 640–1023px */
  @media (min-width: 640px) and (max-width: 1023px) {
    .admin-main {
      padding: 104px 20px 48px !important;
    }
    .admin-title {
      font-size: 34px !important;
    }
    .agenda-container {
      height: 620px !important;
    }
    .timeline-hour-label {
      width: 56px !important;
    }
  }

  /* Desktop : ≥ 1024px */
  @media (min-width: 1024px) {
    .admin-main {
      padding: 110px 24px 48px !important;
    }
    .timeline-hour-label {
      width: 72px !important;
    }
  }
`;

/* ══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [allSlots, setAllSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [viewMode, setViewMode] = useState('agenda');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "availability")), snap => {
      setAllSlots(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "users"), where("role", "==", "doctor")), snap => {
      setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => { await signOut(auth); navigate('/auth'); };

  const filteredSlots = allSlots.filter(s =>
    s.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredDoctors = doctors.filter(d =>
    d.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const dailySlots = filteredSlots
    .filter(s => format(parseISO(s.startTime), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  return (
    <div style={{ background: '#0a0f2e', minHeight: '100vh', color: '#e2e8f0' }}>
      <style>{BI_ADMIN_STYLES}</style>
      <Toaster position="top-right"
        toastOptions={{ style: { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(0,200,200,0.2)' } }} />

      {/* Lumières d'ambiance */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-8%', right: '-8%', width: '45%', height: '45%',
          background: 'radial-gradient(circle, rgba(0,200,200,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '-8%', width: '45%', height: '45%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* ─── NAVBAR ────────────────────────────────────────────────── */}
      <nav className="bi-glass" style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        borderBottom: '1px solid rgba(0,200,200,0.1)',
        padding: '14px 24px'
      }}>
        <div className="admin-nav-inner">
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            onClick={() => { setSelectedDate(startOfDay(new Date())); setViewMode('agenda'); }}
          >
            <div style={{ background: '#00c8c8', borderRadius: '12px', padding: '8px', boxShadow: '0 4px 16px rgba(0,200,200,0.25)', flexShrink: 0 }}>
              <Activity style={{ color: '#0a0f2e' }} size={20} />
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', fontStyle: 'italic', textTransform: 'uppercase', margin: 0 }}>
              BI-<span style={{ color: '#00c8c8' }}>AGENDA</span>
              <span style={{
                marginLeft: '10px', fontSize: '10px', fontStyle: 'normal',
                background: 'rgba(0,200,200,0.1)', color: '#00c8c8',
                padding: '3px 10px', borderRadius: '8px',
                border: '1px solid rgba(0,200,200,0.2)', fontWeight: 700, letterSpacing: '1px'
              }}>ADMIN</span>
            </h1>
          </div>
          <button onClick={handleLogout} title="Déconnexion" style={{
            padding: '10px', borderRadius: '12px',
            background: 'rgba(244,63,94,0.08)', color: '#f43f5e',
            border: '1px solid rgba(244,63,94,0.2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* ─── CONTENU PRINCIPAL ─────────────────────────────────────── */}
      <main className="admin-main" style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* En-tête supervision */}
        <div className="admin-header">
          <div>
            <h2 className="admin-title" style={{ fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', fontStyle: 'italic', textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>
              Supervision
            </h2>
            {/* Onglets de vue */}
            <div className="view-tabs">
              {[
                { id: 'agenda',    icon: <Clock size={13}/>,        label: 'Agenda' },
                { id: 'calendar',  icon: <FullCalIcon size={13}/>,   label: 'Calendrier' },
                { id: 'list',      icon: <List size={13}/>,          label: 'Liste' },
                { id: 'directory', icon: <Users size={13}/>,         label: 'Répertoire' },
              ].map(v => (
                <button key={v.id} onClick={() => setViewMode(v.id)}
                  className={viewMode === v.id ? 'bi-view-btn-active' : 'bi-view-btn-inactive'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '9px 14px', borderRadius: '10px', border: 'none',
                    fontWeight: 700, fontSize: '11px', textTransform: 'uppercase',
                    letterSpacing: '0.8px', cursor: 'pointer', transition: 'all 0.15s',
                    whiteSpace: 'nowrap', fontFamily: 'Sora, sans-serif'
                  }}>
                  {v.icon}
                  <span className="view-tab-label">{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Barre de recherche + navigation date */}
          <div className="admin-controls">
            <div className="bi-glass search-box">
              <Search size={16} style={{ color: '#334155', flexShrink: 0 }} />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Chercher un médecin..."
                className="search-input" />
            </div>

            {viewMode !== 'directory' && (
              <div className="date-nav">
                <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="date-nav-btn">
                  <ChevronLeft size={18}/>
                </button>
                <div className="date-nav-label">
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#00c8c8', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {format(selectedDate, 'EEEE', { locale: fr })}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                    {format(selectedDate, 'dd MMM yyyy', { locale: fr })}
                  </div>
                </div>
                <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="date-nav-btn">
                  <ChevronRight size={18}/>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── VUES ────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {viewMode === 'agenda' && (
            <motion.div key="agenda" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <AgendaView slots={dailySlots} selectedDate={selectedDate} />
            </motion.div>
          )}

          {viewMode === 'calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CalendarView allSlots={filteredSlots} selectedDate={selectedDate}
                onDateClick={d => { setSelectedDate(d); setViewMode('agenda'); }} />
            </motion.div>
          )}

          {viewMode === 'list' && (
            <motion.div key="list" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="cards-grid">
                {filteredSlots.length > 0
                  ? filteredSlots.map((s, i) => <DoctorCard key={s.id} slot={s} index={i} showDate />)
                  : <EmptyState message="Aucune disponibilité." />}
              </div>
            </motion.div>
          )}

          {viewMode === 'directory' && (
            <motion.div key="directory" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="cards-grid">
                {filteredDoctors.length > 0
                  ? filteredDoctors.map((doc, i) => <DirectoryCard key={doc.id} doctor={doc} index={i} />)
                  : <EmptyState message="Répertoire vide." />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer style={{ padding: '40px 0', textAlign: 'center', opacity: 0.25 }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '4px', textTransform: 'uppercase', fontStyle: 'italic' }}>
          by Belle Imagerie
        </p>
      </footer>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   VUE AGENDA (timeline horaire)
══════════════════════════════════════════════════════════════════════════ */
const AgendaView = ({ slots, selectedDate }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 640 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (slots.length === 0) return <EmptyState message="Aucun médecin radiologue disponible." />;

  const labelWidth = isMobile ? 40 : isTablet ? 56 : 72;

  const processedSlots = slots.map(slot => {
    const start = parseISO(slot.startTime);
    const end = parseISO(slot.endTime);
    const overlapping = slots.filter(other =>
      slot.id !== other.id && start < parseISO(other.endTime) && end > parseISO(other.startTime)
    );
    const total = overlapping.length + 1;
    const colIdx = overlapping.filter(other => other.id < slot.id).length;
    return { ...slot, start, end, colWidth: 100 / total, colIndex: colIdx };
  });

  return (
    <div className="bi-glass agenda-container" style={{
      borderRadius: '24px', border: '1px solid rgba(0,200,200,0.1)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      boxShadow: '0 24px 64px rgba(0,0,0,0.3)'
    }}>
      {/* En-tête */}
      <div className="agenda-header">
        <h3 style={{ fontWeight: 800, fontSize: isMobile ? '16px' : '20px', color: '#fff', fontStyle: 'italic', textTransform: 'capitalize', letterSpacing: '-0.5px', margin: 0 }}>
          {format(selectedDate, 'EEEE dd MMMM', { locale: fr })}
        </h3>
        <div style={{
          padding: '5px 14px', background: 'rgba(0,200,200,0.08)',
          border: '1px solid rgba(0,200,200,0.2)', borderRadius: '20px', flexShrink: 0
        }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#00c8c8', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {slots.length} Doc{slots.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="scrollbar-hide timeline-wrapper">
        {hours.map(hour => (
          <div key={hour} className="timeline-hour">
            <span className="timeline-hour-label" style={{ width: `${labelWidth}px` }}>
              {hour.toString().padStart(2, '0')}:00
            </span>
            <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.06)' }} />
          </div>
        ))}

        {processedSlots.map(slot => {
          const top = (slot.start.getHours() * 96) + (slot.start.getMinutes() * 96 / 60) + 24;
          const height = Math.max(((slot.end - slot.start) / (1000 * 60) * 96 / 60), 60);
          const leftBase = labelWidth + 4;

          // Sur mobile : pleine largeur empilée ; sinon colonnes côte à côte
          const width = isMobile
            ? `calc(100% - ${leftBase + 4}px)`
            : `calc(${slot.colWidth}% - 4px)`;
          const left = isMobile
            ? `${leftBase}px`
            : `calc(${labelWidth}px + ${slot.colIndex * slot.colWidth}%)`;

          return (
            <motion.div key={slot.id}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bi-slot-card"
              style={{
                position: 'absolute', top: `${top}px`, height: `${height}px`,
                left, width, zIndex: 10 + slot.colIndex,
                borderRadius: '12px', padding: isMobile ? '8px 10px' : '10px 14px',
                boxShadow: '0 8px 24px rgba(0,200,200,0.15)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                cursor: 'pointer', minWidth: '80px', overflow: 'hidden'
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                <Clock size={9} style={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                </span>
              </div>
              <h4 className="slot-doctor-name" style={{
                fontWeight: 800, color: '#fff',
                fontSize: isMobile ? '11px' : '14px',
                textTransform: 'uppercase', fontStyle: 'italic',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                letterSpacing: '-0.3px', margin: 0
              }}>
                Dr. {slot.doctorName}
              </h4>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   VUE CALENDRIER MENSUEL
══════════════════════════════════════════════════════════════════════════ */
const CalendarView = ({ allSlots, selectedDate, onDateClick }) => {
  const [currMonth, setCurrMonth] = useState(startOfMonth(selectedDate));
  useEffect(() => { setCurrMonth(startOfMonth(selectedDate)); }, [selectedDate]);

  const calDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currMonth), { locale: fr, weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currMonth), { locale: fr, weekStartsOn: 1 })
  });

  return (
    <div className="bi-glass" style={{
      borderRadius: '24px', border: '1px solid rgba(0,200,200,0.1)',
      overflow: 'hidden', padding: '28px',
      boxShadow: '0 24px 64px rgba(0,0,0,0.3)'
    }}>
      {/* Navigation mois */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '12px' }}>
        <h3 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#fff', fontStyle: 'italic', textTransform: 'capitalize', letterSpacing: '-1px', margin: 0 }}>
          {format(currMonth, 'MMMM yyyy', { locale: fr })}
        </h3>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,200,200,0.1)', borderRadius: '12px', padding: '4px', flexShrink: 0 }}>
          <button onClick={() => setCurrMonth(subMonths(currMonth, 1))}
            style={{ padding: '8px 10px', background: 'none', border: 'none', color: '#00c8c8', cursor: 'pointer', borderRadius: '8px', display: 'flex' }}>
            <ChevronLeft size={16}/>
          </button>
          <button onClick={() => setCurrMonth(addMonths(currMonth, 1))}
            style={{ padding: '8px 10px', background: 'none', border: 'none', color: '#00c8c8', cursor: 'pointer', borderRadius: '8px', display: 'flex' }}>
            <ChevronRight size={16}/>
          </button>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '8px' }}>
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} style={{ fontSize: '10px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{d}</div>
        ))}
      </div>

      {/* Grille jours */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {calDays.map((day, i) => {
          const daySlots = allSlots.filter(s => isSameDay(parseISO(s.startTime), day));
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currMonth);

          return (
            <button key={i}
              onClick={() => isCurrentMonth && onDateClick(day)}
              className={`bi-cal-day ${isSelected ? 'selected' : ''}`}
              style={{
                opacity: isCurrentMonth ? 1 : 0.08,
                pointerEvents: isCurrentMonth ? 'auto' : 'none',
                padding: '8px 6px',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: '4px', border: 'none', cursor: 'pointer',
                overflow: 'hidden'
              }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#00c8c8' : '#475569' }}>
                {format(day, 'd')}
              </span>
              {daySlots.slice(0, 2).map(s => (
                <div key={s.id} style={{
                  fontSize: '9px', background: 'rgba(0,200,200,0.12)',
                  color: '#00c8c8', padding: '2px 6px', borderRadius: '4px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  fontWeight: 700, textTransform: 'uppercase', width: '100%'
                }}>
                  {s.doctorName?.split(' ')[0]}
                </div>
              ))}
              {daySlots.length > 2 && (
                <span style={{ fontSize: '9px', color: '#475569', fontWeight: 600 }}>+{daySlots.length - 2}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   CARTE CRÉNEAU (vue Liste)
══════════════════════════════════════════════════════════════════════════ */
const DoctorCard = ({ slot, index, showDate }) => (
  <motion.div layout
    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.04 }}
    style={{
      background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(0,200,200,0.1)',
      borderRadius: '20px', padding: '22px', transition: 'border-color 0.2s'
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,200,200,0.3)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,200,200,0.1)'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
      <div style={{
        width: '44px', height: '44px', background: 'rgba(0,200,200,0.1)',
        borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#00c8c8', fontWeight: 800, fontSize: '18px', fontStyle: 'italic', flexShrink: 0
      }}>
        {slot.doctorName?.charAt(0)}
      </div>
      {showDate && (
        <span style={{
          background: 'rgba(255,255,255,0.04)', color: '#475569',
          padding: '4px 12px', borderRadius: '20px',
          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px'
        }}>
          {format(parseISO(slot.startTime), 'dd MMM')}
        </span>
      )}
    </div>
    <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
      Dr. {slot.doctorName}
    </h4>
    <div style={{
      marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px',
      background: 'rgba(0,200,200,0.05)', border: '1px solid rgba(0,200,200,0.1)',
      borderRadius: '12px', padding: '12px 16px'
    }}>
      <Clock size={16} style={{ color: '#00c8c8', flexShrink: 0 }} />
      <span style={{ fontSize: '15px', fontWeight: 700, color: '#94a3b8' }}>
        {format(parseISO(slot.startTime), 'HH:mm')} — {format(parseISO(slot.endTime), 'HH:mm')}
      </span>
    </div>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════════════════
   CARTE ANNUAIRE (vue Répertoire)
══════════════════════════════════════════════════════════════════════════ */
const DirectoryCard = ({ doctor, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    className="bi-dir-card"
    style={{
      background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(0,200,200,0.1)',
      borderRadius: '24px', padding: '32px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', transition: 'border-color 0.2s'
    }}
  >
    {/* Avatar initiale */}
    <div style={{
      width: '72px', height: '72px',
      background: 'linear-gradient(135deg, #00c8c8 0%, #6366f1 100%)',
      borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#0a0f2e', fontSize: '28px', fontWeight: 800, fontStyle: 'italic',
      marginBottom: '20px', boxShadow: '0 8px 28px rgba(0,200,200,0.25)'
    }}>
      {doctor.fullName?.charAt(0)}
    </div>

    <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.5px', marginBottom: '8px', margin: '0 0 8px' }}>
      Dr. {doctor.fullName}
    </h4>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', marginBottom: '24px' }}>
      <Phone size={13} style={{ color: '#00c8c8', flexShrink: 0 }} />
      <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '1px' }}>
        {doctor.phone || '---'}
      </span>
    </div>

    {/* Actions */}
    <div className="dir-card-actions">
      <a href={`tel:${doctor.phone}`}
        style={{
          flex: 1, background: '#00c8c8', color: '#0a0f2e',
          padding: '12px', borderRadius: '12px', fontWeight: 700,
          fontSize: '12px', textDecoration: 'none', textTransform: 'uppercase',
          letterSpacing: '0.5px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '6px',
          transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(0,200,200,0.2)'
        }}>
        <Phone size={14} fill="#0a0f2e" /> Appeler
      </a>
      <a href={`mailto:${doctor.email}`}
        style={{
          padding: '12px 16px', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(0,200,200,0.15)', borderRadius: '12px',
          color: '#94a3b8', display: 'flex', alignItems: 'center',
          justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s'
        }}>
        <Mail size={18} />
      </a>
    </div>
  </motion.div>
);

/* ══════════════════════════════════════════════════════════════════════════
   ÉTAT VIDE
══════════════════════════════════════════════════════════════════════════ */
const EmptyState = ({ message }) => (
  <div style={{
    gridColumn: '1 / -1', padding: '80px 24px',
    background: 'rgba(255,255,255,0.02)',
    border: '2px dashed rgba(0,200,200,0.08)',
    borderRadius: '24px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center'
  }}>
    <AlertCircle size={30} style={{ color: '#1e293b', marginBottom: '14px' }} />
    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.5px', margin: 0 }}>
      {message}
    </h3>
  </div>
);

export default AdminDashboard;