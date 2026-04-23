import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  collection, addDoc, query, where, onSnapshot,
  deleteDoc, doc, serverTimestamp, updateDoc
} from 'firebase/firestore';
import {
  Plus, Trash2, Clock, Calendar as CalIcon,
  RotateCw, LogOut, Activity, CheckCircle2, X, Bell, Edit3
} from 'lucide-react';
import { format, addWeeks, startOfToday, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast, { Toaster } from 'react-hot-toast';

/* ─── CHARTE BELLE IMAGERIE ───────────────────────────────────────────────
   Fond principal  : #0a0f2e (bleu marine profond)
   Accent principal: #00c8c8 (cyan turquoise)
   Accent secondaire: #6366f1 (indigo violet)
   Succès          : #00c864 (vert émeraude)
   Danger          : #f43f5e (rose rouge)
──────────────────────────────────────────────────────────────────────────── */

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const daysOfWeek = [
  { label: 'Lun', value: 1 }, { label: 'Mar', value: 2 }, { label: 'Mer', value: 3 },
  { label: 'Jeu', value: 4 }, { label: 'Ven', value: 5 }, { label: 'Sam', value: 6 }, { label: 'Dim', value: 0 }
];

/* ─── STYLES GLOBAUX ────────────────────────────────────────────────────── */
const BI_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
  * { font-family: 'Sora', sans-serif; }
  body, #root { background: #0a0f2e; }

  .bi-glass {
    background: rgba(255,255,255,0.025);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .bi-card-slot {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(0,200,200,0.1);
    border-radius: 20px;
    transition: all 0.2s ease;
  }
  .bi-card-slot:hover {
    border-color: rgba(0,200,200,0.3);
    background: rgba(0,200,200,0.03);
    cursor: pointer;
  }
  .bi-input-dark {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(0,200,200,0.15);
    border-radius: 12px;
    padding: 12px 16px;
    color: #e2e8f0;
    font-size: 14px;
    font-weight: 600;
    outline: none;
    transition: border-color 0.2s;
  }
  .bi-input-dark:focus { border-color: rgba(0,200,200,0.45); }
  .bi-day-btn {
    flex: 1; min-width: 52px; padding: 12px 4px;
    border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);
    color: #475569; font-weight: 800; font-size: 11px;
    text-transform: uppercase; cursor: pointer;
    background: transparent; transition: all 0.15s;
  }
  .bi-day-btn:hover { border-color: rgba(0,200,200,0.3); color: #94a3b8; }
  .bi-day-btn.selected {
    background: #00c8c8; border-color: #00c8c8;
    color: #0a0f2e;
    box-shadow: 0 4px 16px rgba(0,200,200,0.3);
  }
  .bi-toggle-track {
    width: 52px; height: 30px; border-radius: 15px;
    display: flex; align-items: center; padding: 0 4px;
    cursor: pointer; transition: background 0.2s;
  }
  .bi-submit-modal {
    flex: 1; padding: 16px;
    background: #00c8c8; color: #0a0f2e;
    border: none; border-radius: 14px;
    font-weight: 800; font-size: 14px;
    text-transform: uppercase; letter-spacing: 0.5px;
    cursor: pointer; transition: all 0.2s;
  }
  .bi-submit-modal:hover {
    background: #00e0e0;
    box-shadow: 0 8px 28px rgba(0,200,200,0.3);
    transform: translateY(-1px);
  }
`;

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [notifiedSlots, setNotifiedSlots] = useState(new Set());
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    start: '08:00', end: '12:00', weeks: 4
  });

  const doctorName = user?.fullName || user?.displayName || "Médecin";

  /* ── Notifications ── */
  const sendNotification = (title, body) => {
    if (Notification.permission !== "granted") return;
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.play().catch(() => {});
    if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
    new Notification(title, {
      body, icon: "/pwa.png", badge: "/pwa.png",
      tag: "bi-agenda-alert", requireInteraction: true
    });
  };

  const checkUpcomingSlots = () => {
    const now = new Date();
    const thirtyMin = new Date(now.getTime() + 30 * 60000);
    slots.forEach(slot => {
      const startTime = parseISO(slot.startTime);
      if (startTime > now && startTime <= thirtyMin && !notifiedSlots.has(`${slot.id}-30`)) {
        sendNotification("⏳ Rappel : 30 minutes", `Dr. ${doctorName}, votre séance de ${format(startTime, 'HH:mm')} approche.`);
        setNotifiedSlots(prev => new Set(prev).add(`${slot.id}-30`));
      }
      const diff = Math.abs((startTime.getTime() - now.getTime()) / 1000);
      if (diff < 60 && !notifiedSlots.has(`${slot.id}-now`)) {
        sendNotification("🚨 DÉBUT DU CRÉNEAU", `Il est ${format(startTime, 'HH:mm')}. Votre vacation commence maintenant.`);
        setNotifiedSlots(prev => new Set(prev).add(`${slot.id}-now`));
      }
    });
  };

  useEffect(() => {
    if (Notification.permission === "granted" && slots.length > 0) {
      checkUpcomingSlots();
      const iv = setInterval(checkUpcomingSlots, 5 * 60000);
      return () => clearInterval(iv);
    }
  }, [slots, notifiedSlots]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) { toast.error("Notifications non supportées."); return; }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      sendNotification("BI-AGENDA", "Rappels automatiques activés ! ⏳");
      toast.success("Alertes activées !");
    }
  };

  /* ── Firestore ── */
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "availability"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSlots(data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
    });
    return () => unsub();
  }, [user?.uid]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce créneau ?")) return;
    try {
      await deleteDoc(doc(db, "availability", id));
      toast.success("Supprimé");
    } catch { toast.error("Erreur de suppression"); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const loading = toast.loading(editingId ? "Mise à jour..." : "Planification...");
    try {
      const startDateTime = new Date(`${formData.date}T${formData.start}`).toISOString();
      const endDateTime = new Date(`${formData.date}T${formData.end}`).toISOString();

      if (editingId) {
        await updateDoc(doc(db, "availability", editingId), { startTime: startDateTime, endTime: endDateTime });
      } else if (isRecurring) {
        if (selectedDays.length === 0) throw new Error("Choisissez au moins un jour");
        const batchPromises = selectedDays.flatMap(dayValue => {
          let ptr = startOfToday();
          while (ptr.getDay() !== dayValue) ptr = addDays(ptr, 1);
          return Array.from({ length: formData.weeks }).map((_, i) => {
            const targetDate = addWeeks(ptr, i);
            return addDoc(collection(db, "availability"), {
              userId: user.uid, doctorName, isRecurring: true, createdAt: serverTimestamp(),
              startTime: new Date(`${format(targetDate, 'yyyy-MM-dd')}T${formData.start}`).toISOString(),
              endTime: new Date(`${format(targetDate, 'yyyy-MM-dd')}T${formData.end}`).toISOString(),
            });
          });
        });
        await Promise.all(batchPromises);
      } else {
        await addDoc(collection(db, "availability"), {
          userId: user.uid, doctorName, isRecurring: false,
          startTime: startDateTime, endTime: endDateTime, createdAt: serverTimestamp()
        });
      }

      toast.success("Succès !", { id: loading });
      setShowModal(false); setEditingId(null); setSelectedDays([]);
    } catch (err) { toast.error(err.message, { id: loading }); }
  };

  const openEditModal = (slot) => {
    const start = parseISO(slot.startTime);
    setEditingId(slot.id); setIsRecurring(false);
    setFormData({
      date: format(start, 'yyyy-MM-dd'),
      start: format(start, 'HH:mm'),
      end: format(parseISO(slot.endTime), 'HH:mm'),
      weeks: 1
    });
    setShowModal(true);
  };

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div style={{ background: '#0a0f2e', minHeight: '100vh', color: '#e2e8f0' }}>
      <style>{BI_STYLES}</style>
      <Toaster
        position="top-right"
        toastOptions={{ style: { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(0,200,200,0.2)' } }}
      />

      {/* Lumières d'ambiance */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-5%', right: '-5%', width: '40%', height: '40%',
          background: 'radial-gradient(circle, rgba(0,200,200,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '40%', height: '40%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* ─── NAVBAR ──────────────────────────────────────────────────── */}
      <nav className="bi-glass" style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        borderBottom: '1px solid rgba(0,200,200,0.1)',
        padding: '14px 24px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#00c8c8', borderRadius: '12px', padding: '8px', boxShadow: '0 4px 16px rgba(0,200,200,0.25)' }}>
              <Activity style={{ color: '#0a0f2e' }} size={20} />
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', fontStyle: 'italic', textTransform: 'uppercase' }}>
              BI-<span style={{ color: '#00c8c8' }}>AGENDA</span>
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Bouton notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
              onClick={requestNotificationPermission}
              style={{
                padding: '10px', borderRadius: '12px',
                background: 'rgba(0,200,200,0.08)', color: '#00c8c8',
                border: '1px solid rgba(0,200,200,0.2)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
              <Bell size={18} />
            </motion.button>
            {/* Bouton déconnexion */}
            <button
              onClick={() => { auth.signOut(); navigate('/auth'); }}
              style={{
                padding: '10px', borderRadius: '12px',
                background: 'rgba(244,63,94,0.08)', color: '#f43f5e',
                border: '1px solid rgba(244,63,94,0.2)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* ─── CONTENU PRINCIPAL ──────────────────────────────────────── */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '120px 24px 48px' }}>

        {/* En-tête de page */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', fontStyle: 'italic', textTransform: 'uppercase', lineHeight: 1.05 }}>
              Mon Planning
            </h2>
            <p style={{ color: '#475569', fontSize: '15px', marginTop: '6px' }}>
              Gérez vos disponibilités d'interprétation.
            </p>
          </motion.div>
          <button
            onClick={() => { setEditingId(null); setShowModal(true); }}
            style={{
              background: '#00c8c8', color: '#0a0f2e',
              padding: '14px 24px', borderRadius: '18px', border: 'none',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 8px 28px rgba(0,200,200,0.25)',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={20} /> Nouvelle Disponibilité
          </button>
        </div>

        {/* Grille principale */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>

          {/* Colonne statistiques */}
          <div className="bi-glass" style={{
            padding: '28px', borderRadius: '24px',
            border: '1px solid rgba(0,200,200,0.12)',
            position: 'sticky', top: '96px', alignSelf: 'start'
          }}>
            <p style={{ fontSize: '10px', color: '#334155', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Total Créneaux
            </p>
            <h3 style={{ fontSize: '56px', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: '20px', letterSpacing: '-2px' }}>
              {slots.length}
            </h3>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(0,200,100,0.08)',
              border: '1px solid rgba(0,200,100,0.2)',
              borderRadius: '12px', padding: '12px',
              color: '#00c864'
            }}>
              <CheckCircle2 size={16} />
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Système synchronisé</span>
            </div>
          </div>

          {/* Liste des créneaux */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <AnimatePresence mode="popLayout">
              {slots.length === 0 ? (
                <div style={{
                  padding: '80px 24px', borderRadius: '24px',
                  border: '2px dashed rgba(0,200,200,0.1)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#334155', textAlign: 'center'
                }}>
                  <CalIcon size={36} style={{ opacity: 0.3, marginBottom: '16px' }} />
                  <p style={{ fontSize: '18px', fontWeight: 800, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                    Aucun créneau planifié
                  </p>
                </div>
              ) : (
                slots.map(slot => (
                  <motion.div
                    layout key={slot.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    onClick={() => openEditModal(slot)}
                    className="bi-card-slot"
                    style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* Icône du créneau */}
                      <div style={{
                        padding: '12px', borderRadius: '14px',
                        background: slot.isRecurring ? 'rgba(99,102,241,0.12)' : 'rgba(0,200,200,0.1)',
                      }}>
                        {slot.isRecurring
                          ? <RotateCw size={22} style={{ color: '#818cf8' }} />
                          : <Clock size={22} style={{ color: '#00c8c8' }} />}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: '16px', color: '#fff', fontStyle: 'italic', textTransform: 'capitalize' }}>
                          {format(parseISO(slot.startTime), 'EEEE d MMMM', { locale: fr })}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span style={{
                            background: 'rgba(255,255,255,0.05)',
                            color: '#64748b', padding: '3px 10px',
                            borderRadius: '6px', fontSize: '12px', fontWeight: 600
                          }}>
                            {format(parseISO(slot.startTime), 'HH:mm')} — {format(parseISO(slot.endTime), 'HH:mm')}
                          </span>
                          {slot.isRecurring && (
                            <span style={{
                              background: 'rgba(99,102,241,0.15)',
                              color: '#818cf8', padding: '2px 8px',
                              borderRadius: '20px', fontSize: '10px',
                              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px'
                            }}>
                              Récurrent
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Edit3 size={16} style={{ color: '#334155' }} />
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(slot.id); }}
                        style={{
                          padding: '10px', background: 'none', border: 'none',
                          color: '#334155', cursor: 'pointer', borderRadius: '8px',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f43f5e'}
                        onMouseLeave={e => e.currentTarget.style.color = '#334155'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ─── MODAL AJOUT / ÉDITION ──────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(5,7,20,0.92)', backdropFilter: 'blur(12px)' }}
            />

            {/* Contenu modal */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bi-glass"
              style={{
                padding: '36px', width: '100%', maxWidth: '520px',
                position: 'relative', zIndex: 10,
                border: '1px solid rgba(0,200,200,0.2)',
                borderRadius: '28px'
              }}
            >
              {/* En-tête modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-1px', fontStyle: 'italic', textTransform: 'uppercase' }}>
                  {editingId ? 'Modifier' : 'Nouveau Créneau'}
                </h2>
                <button onClick={() => setShowModal(false)}
                  style={{ padding: '8px', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', borderRadius: '8px' }}>
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Toggle récurrence */}
                {!editingId && (
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '18px 20px', background: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        padding: '10px', borderRadius: '10px',
                        background: isRecurring ? 'rgba(0,200,200,0.15)' : 'rgba(255,255,255,0.04)'
                      }}>
                        <RotateCw size={18} style={{ color: isRecurring ? '#00c8c8' : '#475569' }} />
                      </div>
                      <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '14px' }}>Mode Récurrence</span>
                    </div>
                    <button type="button" onClick={() => setIsRecurring(!isRecurring)}
                      className="bi-toggle-track"
                      style={{ background: isRecurring ? '#00c8c8' : 'rgba(255,255,255,0.08)' }}>
                      <motion.div animate={{ x: isRecurring ? 22 : 0 }}
                        style={{ width: 22, height: 22, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
                    </button>
                  </div>
                )}

                {/* Sélection des jours (récurrent) */}
                {isRecurring && !editingId ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {daysOfWeek.map(day => (
                        <button key={day.value} type="button"
                          className={`bi-day-btn ${selectedDays.includes(day.value) ? 'selected' : ''}`}
                          onClick={() => setSelectedDays(prev =>
                            prev.includes(day.value) ? prev.filter(d => d !== day.value) : [...prev, day.value]
                          )}>
                          {day.label}
                        </button>
                      ))}
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '14px', padding: '18px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '10px', color: '#334155', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                          Période : {formData.weeks} semaines
                        </span>
                      </div>
                      <input type="range" min="1" max="12" value={formData.weeks}
                        onChange={e => setFormData({ ...formData, weeks: e.target.value })}
                        style={{ width: '100%', accentColor: '#00c8c8' }} />
                    </div>
                  </div>
                ) : (
                  <input type="date" required className="bi-input-dark"
                    value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                )}

                {/* Horaires */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: '#334155', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '6px', paddingLeft: '4px' }}>
                      Début
                    </label>
                    <input type="time" required className="bi-input-dark"
                      value={formData.start} onChange={e => setFormData({ ...formData, start: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#334155', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '6px', paddingLeft: '4px' }}>
                      Fin
                    </label>
                    <input type="time" required className="bi-input-dark"
                      value={formData.end} onChange={e => setFormData({ ...formData, end: e.target.value })} />
                  </div>
                </div>

                {/* Boutons actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowModal(false)}
                    style={{
                      flex: 1, padding: '16px', background: 'none', border: 'none',
                      color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '14px'
                    }}>
                    Annuler
                  </button>
                  <button type="submit" className="bi-submit-modal">
                    Confirmer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorDashboard;