import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
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

const daysOfWeek = [
  { label: 'Lun', value: 1 }, { label: 'Mar', value: 2 }, { label: 'Mer', value: 3 },
  { label: 'Jeu', value: 4 }, { label: 'Ven', value: 5 }, { label: 'Sam', value: 6 }, { label: 'Dim', value: 0 }
];

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [formData, setFormData] = useState({ 
    date: format(new Date(), 'yyyy-MM-dd'), 
    start: '08:00', 
    end: '12:00', 
    weeks: 4 
  });

  const doctorName = user?.fullName || user?.displayName || "Médecin";

  // --- LOGIQUE NOTIFICATION ---
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      toast.success("Rappels activés !");
    }
  };

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "availability"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSlots(data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
    });
    return () => unsubscribe();
  }, [user.uid]);

  const openEditModal = (slot) => {
    const start = parseISO(slot.startTime);
    setEditingId(slot.id);
    setIsRecurring(false);
    setFormData({
      date: format(start, 'yyyy-MM-dd'),
      start: format(start, 'HH:mm'),
      end: format(parseISO(slot.endTime), 'HH:mm'),
      weeks: 1
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const loading = toast.loading(editingId ? "Mise à jour..." : "Planification...");
    try {
      const startDateTime = new Date(`${formData.date}T${formData.start}`).toISOString();
      const endDateTime = new Date(`${formData.date}T${formData.end}`).toISOString();

      if (editingId) {
        await updateDoc(doc(db, "availability", editingId), {
          startTime: startDateTime,
          endTime: endDateTime,
        });
        toast.success("Mis à jour !", { id: loading });
      } else {
        if (isRecurring) {
          if (selectedDays.length === 0) throw new Error("Choisissez au moins un jour");
          const batchPromises = [];
          selectedDays.forEach(dayValue => {
            let currentPtr = startOfToday();
            while (currentPtr.getDay() !== dayValue) { currentPtr = addDays(currentPtr, 1); }
            for (let i = 0; i < formData.weeks; i++) {
              const targetDate = addWeeks(currentPtr, i);
              batchPromises.push(addDoc(collection(db, "availability"), {
                userId: user.uid,
                doctorName,
                startTime: new Date(`${format(targetDate, 'yyyy-MM-dd')}T${formData.start}`).toISOString(),
                endTime: new Date(`${format(targetDate, 'yyyy-MM-dd')}T${formData.end}`).toISOString(),
                isRecurring: true,
                createdAt: serverTimestamp()
              }));
            }
          });
          await Promise.all(batchPromises);
        } else {
          await addDoc(collection(db, "availability"), {
            userId: user.uid, doctorName, startTime: startDateTime, endTime: endDateTime, isRecurring: false, createdAt: serverTimestamp()
          });
        }
        toast.success("Enregistré !", { id: loading });
      }
      setShowModal(false);
      setEditingId(null);
      setSelectedDays([]);
    } catch (error) {
      toast.error(error.message, { id: loading });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      <Toaster position="top-right" />
      
      {/* Navbar Fixed */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-600/20"><Activity className="text-white" size={22} /></div>
            <h1 className="text-xl font-black tracking-tight">CID <span className="text-blue-500">Medical</span></h1>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={requestNotificationPermission} className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"><Bell size={20} /></button>
             <button onClick={() => { auth.signOut(); navigate('/auth'); }} className="p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20"><LogOut size={20} /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 pt-28 md:pt-32">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight italic">MON PLANNING</h2>
            <p className="text-slate-400 text-lg">Gérez vos disponibilités d'interprétation médicale.</p>
          </motion.div>
          <button onClick={() => { setEditingId(null); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[2rem] font-bold shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all">
            <Plus size={24} /> Nouvelle Disponibilité
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Stats (Rétabli) */}
          <div className="lg:col-span-1">
            <div className="glass p-8 rounded-[2.5rem] border border-white/5 sticky top-32 shadow-2xl overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl"></div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Total Créneaux</p>
              <h3 className="text-6xl font-black text-white mb-6 tracking-tighter">{slots.length}</h3>
              <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                <CheckCircle2 size={20} />
                <span className="text-sm font-bold">Système à jour</span>
              </div>
            </div>
          </div>

          {/* List Content */}
          <div className="lg:col-span-3 space-y-4">
            <AnimatePresence mode="popLayout">
              {slots.length === 0 ? (
                <div className="py-24 glass rounded-[3rem] border-dashed border-2 border-white/5 flex flex-col items-center justify-center text-slate-500 text-center px-6">
                  <CalIcon size={40} className="opacity-20 mb-6" />
                  <p className="text-xl font-bold">Aucun créneau planifié</p>
                </div>
              ) : (
                slots.map((slot) => (
                  <motion.div 
                    layout key={slot.id} onClick={() => openEditModal(slot)}
                    className="glass p-6 rounded-[2rem] flex items-center justify-between group border border-white/5 hover:border-blue-500/30 transition-all shadow-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl ${slot.isRecurring ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400 shadow-inner'}`}>
                        {slot.isRecurring ? <RotateCw size={26} className="animate-spin-slow"/> : <Clock size={26}/>}
                      </div>
                      <div>
                        <h4 className="font-black text-xl text-white capitalize">{format(parseISO(slot.startTime), 'EEEE d MMMM', { locale: fr })}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-400 font-bold bg-white/5 px-3 py-1 rounded-lg text-sm">{format(parseISO(slot.startTime), 'HH:mm')} — {format(parseISO(slot.endTime), 'HH:mm')}</span>
                          {slot.isRecurring && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-black uppercase">Récurrent</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Edit3 size={20} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(slot.id); }} className="p-4 text-slate-600 hover:text-red-400 transition-all"><Trash2 size={22} /></button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* --- Modal Premium (Rétabli avec la barre de semaines) --- */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass p-8 w-full max-w-xl relative z-10 border border-white/10 shadow-2xl rounded-[3rem]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{editingId ? 'Modifier' : 'Nouveau Créneau'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500"><X size={24} /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {!editingId && (
                  <div className="flex items-center justify-between p-6 bg-slate-900/50 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${isRecurring ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}><RotateCw size={20} /></div>
                        <div><p className="font-bold text-white">Mode Récurrence</p></div>
                    </div>
                    <button type="button" onClick={() => setIsRecurring(!isRecurring)} className={`w-14 h-8 rounded-full flex items-center px-1 ${isRecurring ? 'bg-blue-600' : 'bg-slate-700'}`}>
                      <motion.div animate={{ x: isRecurring ? 24 : 0 }} className="w-6 h-6 bg-white rounded-full shadow-lg" />
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  {isRecurring && !editingId ? (
                    <div className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map(day => (
                            <button key={day.value} type="button" onClick={() => setSelectedDays(prev => prev.includes(day.value) ? prev.filter(d => d !== day.value) : [...prev, day.value])}
                            className={`flex-1 min-w-[60px] py-4 rounded-2xl border font-black text-sm transition-all ${selectedDays.includes(day.value) ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'border-white/5 text-slate-500'}`}>{day.label}</button>
                        ))}
                        </div>
                        {/* BARRE DE RECURRENCE RETABLIE ICI */}
                        <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                            <div className="flex justify-between mb-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Durée : {formData.weeks} semaines</label>
                            </div>
                            <input type="range" min="1" max="12" value={formData.weeks} onChange={e => setFormData({...formData, weeks: e.target.value})} className="w-full accent-blue-600 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>
                  ) : (
                    <input type="date" required className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input type="time" required className="bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold" value={formData.start} onChange={e => setFormData({...formData, start: e.target.value})} />
                    <input type="time" required className="bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold" value={formData.end} onChange={e => setFormData({...formData, end: e.target.value})} />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 font-bold text-slate-500">Annuler</button>
                  <button type="submit" className="flex-1 bg-blue-600 py-5 rounded-[1.5rem] font-black text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all">Confirmer</button>
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