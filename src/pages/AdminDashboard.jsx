import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Clock, Calendar as CalIcon, 
  AlertCircle, LogOut, ShieldCheck, ChevronRight, 
  ChevronLeft, LayoutGrid, List, CalendarDays
} from 'lucide-react';
import { format, parseISO, addDays, subDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
  const [allSlots, setAllSlots] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [viewMode, setViewMode] = useState('daily'); // 'daily' ou 'all'
  const navigate = useNavigate();

  // 1. Récupération des données en temps réel
  useEffect(() => {
    const q = query(collection(db, "availability"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllSlots(data);
    }, (error) => {
      toast.error("Erreur de connexion Firebase");
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/auth');
  };

  // 2. LOGIQUE DE FILTRAGE MULTI-MODE
  const filteredDoctors = allSlots.filter(slot => {
    try {
      if (!slot.startTime || !slot.doctorName) return false;
      
      const matchesName = slot.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (viewMode === 'daily') {
        const slotDateString = format(parseISO(slot.startTime), 'yyyy-MM-dd');
        const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
        return matchesName && slotDateString === selectedDateString;
      } else {
        // Mode 'all' : on affiche tout ce qui est à venir à partir d'aujourd'hui
        return matchesName && parseISO(slot.startTime) >= startOfDay(new Date());
      }
    } catch (e) {
      return false;
    }
  }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      <Toaster position="top-right" />
      
      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => {setViewMode('daily'); setSelectedDate(startOfDay(new Date()))}}>
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-600/20">
              <ShieldCheck className="text-white" size={22} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white">CID <span className="text-blue-500">Admin</span></h1>
          </div>
          
          <button onClick={handleLogout} className="p-3 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 pt-28 md:pt-32">
        
        {/* --- Header & View Switcher --- */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-4xl font-black text-white mb-2 italic">Supervision</h2>
            <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl border border-white/5 w-fit mt-4">
              <button 
                onClick={() => setViewMode('daily')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'daily' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <CalendarDays size={14} /> Vue Quotidienne
              </button>
              <button 
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <List size={14} /> Voir Tout le Planning
              </button>
            </div>
          </motion.div>

          <div className="flex gap-4">
            <StatSmall label="Base Totale" value={allSlots.length} icon={<LayoutGrid size={14}/>} />
            <StatSmall 
              label={viewMode === 'daily' ? "Aujourd'hui" : "À venir"} 
              value={filteredDoctors.length} 
              icon={<CalIcon size={14}/>} 
            />
          </div>
        </div>

        {/* --- Pilotage : Filtres dynamiques --- */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10">
          
          {/* Calendrier : affiché uniquement en mode daily */}
          <div className={`lg:col-span-8 glass p-2 rounded-3xl flex items-center border border-white/5 shadow-2xl transition-all ${viewMode === 'all' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <button 
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="p-4 hover:bg-white/5 rounded-2xl transition-all text-blue-500 active:scale-90"
            >
              <ChevronLeft size={28} />
            </button>
            
            <div className="flex-1 text-center py-2">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedDate.toISOString()}
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-1">Ciblage Date</span>
                  <span className="text-xl md:text-2xl font-black text-white capitalize">
                    {format(selectedDate, 'EEEE dd MMMM', { locale: fr })}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-4 hover:bg-white/5 rounded-2xl transition-all text-blue-500 active:scale-90"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Recherche */}
          <div className="lg:col-span-4 glass p-2 rounded-3xl border border-white/5 flex items-center px-4 shadow-2xl">
            <Search className="text-slate-500 mr-3" size={20} />
            <input 
              type="text" 
              placeholder="Nom du médecin..." 
              className="bg-transparent w-full py-3 outline-none text-white font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </section>

        {/* --- Grille des Docteurs --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((slot, index) => (
                <DoctorCard key={slot.id} slot={slot} index={index} showDate={viewMode === 'all'} />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-full py-24 glass rounded-[3rem] border-dashed border-2 border-white/5 flex flex-col items-center justify-center text-center px-6"
              >
                <AlertCircle size={48} className="text-slate-700 mb-4" />
                <h3 className="text-2xl font-bold text-slate-300">Aucun résultat</h3>
                <p className="text-slate-500 mt-2">Aucune disponibilité ne correspond à vos filtres actuels.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// --- Composants Internes ---

const StatSmall = ({ label, value, icon }) => (
  <div className="glass px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-4 shadow-lg min-w-[150px]">
    <div className="p-2.5 bg-blue-600/10 rounded-xl text-blue-400 border border-blue-500/10">{icon}</div>
    <div>
      <p className="text-[10px] font-black uppercase text-slate-500 leading-none mb-1.5 tracking-wider">{label}</p>
      <p className="text-2xl font-black text-white leading-none">{value}</p>
    </div>
  </div>
);

const DoctorCard = ({ slot, index, showDate }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ delay: index * 0.04 }}
    className="glass p-6 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 group transition-all duration-500 shadow-xl relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-all shadow-inner font-black text-xl text-blue-400">
        {slot.doctorName?.charAt(0)}
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${slot.isRecurring ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          {slot.isRecurring ? 'Récurrence' : 'Unique'}
        </div>
        {showDate && (
          <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-slate-400 border border-white/5">
             {format(parseISO(slot.startTime), 'dd MMM yyyy', { locale: fr })}
          </div>
        )}
      </div>
    </div>
    
    <div className="relative z-10">
      <h4 className="text-2xl font-bold text-white mb-6 group-hover:text-blue-400 transition-colors capitalize tracking-tight">
        Dr. {slot.doctorName}
      </h4>
      
      <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-3xl border border-white/5 shadow-inner group-hover:bg-slate-950/60 transition-colors">
        <div className="p-2.5 bg-blue-500/10 rounded-xl">
          <Clock size={20} className="text-blue-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Disponibilité</span>
          <span className="text-lg font-black text-slate-200 tracking-tight">
            {format(parseISO(slot.startTime), 'HH:mm')} — {format(parseISO(slot.endTime), 'HH:mm')}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

export default AdminDashboard;