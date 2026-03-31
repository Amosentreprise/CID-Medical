import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import { 
  Search, Clock, AlertCircle, LogOut, ShieldCheck, ChevronRight, 
  ChevronLeft, List, Calendar as FullCalIcon, Users, Phone, Mail, Activity
} from 'lucide-react';
import { 
  format, parseISO, addDays, subDays, startOfDay, 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  isSameMonth, isSameDay, eachDayOfInterval, addMonths, subMonths
} from 'date-fns';
import { fr } from 'date-fns/locale';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
  const [allSlots, setAllSlots] = useState([]);
  const [doctors, setDoctors] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [viewMode, setViewMode] = useState('agenda'); 
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "availability"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllSlots(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "doctor"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDoctors(data);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/auth');
  };

  const filteredSlots = allSlots.filter(slot => 
    slot.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDoctors = doctors.filter(doc => 
    doc.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dailySlots = filteredSlots.filter(slot => 
    format(parseISO(slot.startTime), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  ).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      <Toaster position="top-right" />
      
     <nav className="fixed top-0 w-full z-[100] glass border-b border-white/5 px-4 md:px-8 py-4 backdrop-blur-xl">
  <div className="max-w-7xl mx-auto flex justify-between items-center">
    <div 
      className="flex items-center gap-3 cursor-pointer group" 
      onClick={() => {setSelectedDate(startOfDay(new Date())); setViewMode('agenda')}}
    >
      <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
        {/* On utilise Activity pour rester cohérent avec la page Auth */}
        <Activity className="text-white" size={22} />
      </div>
      <h1 className="text-lg md:text-xl font-black tracking-tighter text-white italic uppercase">
        BI-<span className="text-blue-500">AGENDA</span> 
        <span className="ml-2 text-[10px] not-italic bg-blue-500/10 text-blue-400 px-2 py-1 rounded-lg border border-blue-500/20">
          ADMIN
        </span>
      </h1>
    </div>
    
    <button 
      onClick={handleLogout} 
      className="p-3 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-lg"
      title="Déconnexion"
    >
      <LogOut size={20} />
    </button>
  </div>
</nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 pt-28 md:pt-40">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div className="space-y-4 w-full lg:w-auto">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Supervision</h2>
            <div className="flex p-1.5 bg-slate-900/80 rounded-2xl border border-white/5 w-full md:w-fit backdrop-blur-md overflow-x-auto no-scrollbar">
              <ViewBtn active={viewMode === 'agenda'} onClick={() => setViewMode('agenda')} icon={<Clock size={14}/>} label="Agenda" />
              <ViewBtn active={viewMode === 'calendar'} onClick={() => setViewMode('calendar')} icon={<FullCalIcon size={14}/>} label="Calendrier" />
              <ViewBtn active={viewMode === 'list'} onClick={() => setViewMode('list')} icon={<List size={14}/>} label="Liste" />
              <ViewBtn active={viewMode === 'directory'} onClick={() => setViewMode('directory')} icon={<Users size={14}/>} label="Répertoire" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             <div className="glass p-2.5 rounded-2xl border border-white/5 flex items-center px-4 w-full sm:w-72 shadow-2xl">
                <Search size={18} className="text-slate-500 mr-2" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Chercher..." className="bg-transparent outline-none text-sm w-full font-medium" />
             </div>
             
             {viewMode !== 'directory' && (
                <div className="flex items-center justify-between gap-2 bg-blue-600/10 p-2 rounded-2xl border border-blue-500/20 shadow-lg w-full sm:w-auto">
                    <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2.5 hover:bg-blue-600 hover:text-white rounded-xl transition-all"><ChevronLeft size={20}/></button>
                    <div className="flex flex-col items-center px-4 min-w-[120px]">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{format(selectedDate, 'EEEE', {locale: fr})}</span>
                        <span className="font-bold text-xs md:text-sm text-white">{format(selectedDate, 'dd MMM yyyy', {locale: fr})}</span>
                    </div>
                    <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2.5 hover:bg-blue-600 hover:text-white rounded-xl transition-all"><ChevronRight size={20}/></button>
                </div>
             )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'agenda' && (
            <motion.div key="agenda" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}}>
              <AgendaView slots={dailySlots} selectedDate={selectedDate} />
            </motion.div>
          )}

          {viewMode === 'calendar' && (
            <motion.div key="calendar" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <CalendarView allSlots={filteredSlots} selectedDate={selectedDate} onDateClick={(d) => {setSelectedDate(d); setViewMode('agenda')}} />
            </motion.div>
          )}

          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredSlots.length > 0 ? (
                 filteredSlots.map((s, i) => <DoctorCard key={s.id} slot={s} index={i} showDate={true} />)
               ) : (
                 <EmptyState message="Aucune disponibilité." />
               )}
            </div>
          )}

          {viewMode === 'directory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredDoctors.length > 0 ? (
                 filteredDoctors.map((doc, i) => (
                    <motion.div 
                      key={doc.id} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass p-8 rounded-[3.5rem] border border-white/5 flex flex-col items-center text-center group relative overflow-hidden shadow-2xl"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black mb-6 shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform italic uppercase">
                            {doc.fullName?.charAt(0)}
                        </div>
                        <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Dr. {doc.fullName}</h4>
                        <div className="flex items-center gap-2 text-slate-500 font-bold mb-8">
                             <Phone size={14} className="text-blue-500" />
                             <span className="tracking-widest">{doc.phone || "---"}</span>
                        </div>

                        <div className="flex w-full gap-3 relative z-10">
                            <a href={`tel:${doc.phone}`} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 text-xs">
                                <Phone size={16} fill="currentColor"/> APPELER
                            </a>
                            <a href={`mailto:${doc.email}`} className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all active:scale-95">
                                <Mail size={20}/>
                            </a>
                        </div>
                    </motion.div>
                 ))
               ) : (
                 <EmptyState message="Répertoire vide." />
               )}
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">by Belle Imagerie</p>
      </footer>
    </div>
  );
};

const AgendaView = ({ slots, selectedDate }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (slots.length === 0) return <EmptyState message="Aucun médecin radiologue disponible." />;

  const processedSlots = slots.map((slot) => {
    const start = parseISO(slot.startTime);
    const end = parseISO(slot.endTime);
    const overlapping = slots.filter(other => {
      if (slot.id === other.id) return false;
      return (start < parseISO(other.endTime) && end > parseISO(other.startTime));
    });
    const totalInGroup = overlapping.length + 1;
    const colWidth = (100 / totalInGroup);
    const colIndex = overlapping.filter(other => other.id < slot.id).length;
    return { ...slot, start, end, colWidth, colIndex };
  });

  return (
    <div className="glass rounded-[2rem] md:rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col h-[600px] md:h-[750px]">
      <div className="p-5 md:p-8 border-b border-white/5 bg-white/5 flex justify-between items-center backdrop-blur-xl">
        <h3 className="font-black text-lg md:text-2xl text-white capitalize tracking-tighter italic">
          {format(selectedDate, 'EEEE dd MMMM', { locale: fr })}
        </h3>
        <div className="px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
            <span className="text-[9px] md:text-xs font-black text-blue-400 uppercase tracking-widest">{slots.length} Doc(s)</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto relative p-4 md:p-6 scrollbar-hide bg-[#020617]/50">
        {hours.map(hour => (
          <div key={hour} className="flex border-b border-white/5 h-24 relative">
            <span className="w-12 md:w-20 text-[10px] md:text-[11px] font-black text-slate-500 mt-[-10px] tracking-tighter">
                {hour.toString().padStart(2, '0')}:00
            </span>
            <div className="flex-1 border-l border-white/10" />
          </div>
        ))}

        {processedSlots.map((slot) => {
          const top = (slot.start.getHours() * 96) + (slot.start.getMinutes() * 96 / 60) + 24;
          const height = Math.max(((slot.end - slot.start) / (1000 * 60) * 96 / 60), 60);
          
          const widthVal = isMobile ? "calc(100% - 70px)" : `calc(${slot.colWidth}% - ${110 / (100/slot.colWidth)}px)`;
          const leftVal = isMobile ? "60px" : `calc(100px + ${slot.colIndex * (slot.colWidth)}% - ${slot.colIndex * 10}px)`;

          return (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              key={slot.id}
              style={{ top: `${top}px`, height: `${height}px`, left: leftVal, width: widthVal, zIndex: 10 + slot.colIndex }}
              className="absolute bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 border-l-4 border-white/40 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-xl cursor-pointer flex flex-col justify-center min-w-[120px]"
            >
              <div className="flex items-center gap-1.5 text-white/80 mb-1">
                 <Clock size={10} className="shrink-0" />
                 <span className="text-[8px] md:text-[9px] font-black tracking-widest uppercase">
                   {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                 </span>
              </div>
              <h4 className="font-black text-white text-xs md:text-base tracking-tight uppercase italic truncate">Dr. {slot.doctorName}</h4>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const CalendarView = ({ allSlots, selectedDate, onDateClick }) => {
  const [currMonth, setCurrMonth] = useState(startOfMonth(selectedDate));
  useEffect(() => { setCurrMonth(startOfMonth(selectedDate)); }, [selectedDate]);

  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currMonth), {locale: fr, weekStartsOn: 1}),
    end: endOfWeek(endOfMonth(currMonth), {locale: fr, weekStartsOn: 1})
  });

  return (
    <div className="glass rounded-[2rem] md:rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl p-4 md:p-8 backdrop-blur-md">
      <div className="flex justify-between items-center mb-6 md:mb-10">
        <h3 className="text-xl md:text-3xl font-black text-white capitalize italic tracking-tighter">{format(currMonth, 'MMMM yyyy', {locale: fr})}</h3>
        <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/5">
            <button onClick={() => setCurrMonth(subMonths(currMonth, 1))} className="p-2 hover:bg-white/10 rounded-lg text-blue-500"><ChevronLeft size={18}/></button>
            <button onClick={() => setCurrMonth(addMonths(currMonth, 1))} className="p-2 hover:bg-white/10 rounded-lg text-blue-500"><ChevronRight size={18}/></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-3 text-center mb-4">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => (
          <div key={d} className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-3">
        {calendarDays.map((day, i) => {
          const daySlots = allSlots.filter(s => isSameDay(parseISO(s.startTime), day));
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currMonth);
          return (
            <button 
              key={i} 
              onClick={() => isCurrentMonth && onDateClick(day)} 
              className={`min-h-[60px] md:min-h-[110px] rounded-xl md:rounded-3xl border transition-all p-1.5 md:p-3 flex flex-col items-center md:items-start gap-1 relative ${!isCurrentMonth ? 'opacity-5 grayscale pointer-events-none' : 'hover:scale-[1.02]'} ${isSelected ? 'border-blue-500 bg-blue-500/10 shadow-lg' : 'border-white/5 bg-white/5'}`}
            >
              <span className={`text-[10px] md:text-sm font-black ${isSelected ? 'text-blue-400' : 'text-slate-500'}`}>{format(day, 'd')}</span>
              <div className="hidden md:block w-full space-y-1">
                {daySlots.slice(0, 2).map(s => (
                  <div key={s.id} className="text-[8px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded-md truncate font-bold uppercase">
                    {s.doctorName.split(' ')[0]}
                  </div>
                ))}
              </div>
              {daySlots.length > 0 && <div className="md:hidden w-1.5 h-1.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const DoctorCard = ({ slot, index, showDate }) => (
    <motion.div layout initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay: index*0.05}} className="glass p-6 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all group shadow-2xl">
       <div className="flex justify-between items-center mb-6">
          <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 font-black text-xl italic">{slot.doctorName?.charAt(0)}</div>
          {showDate && <div className="px-4 py-1 bg-slate-900 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(parseISO(slot.startTime), 'dd MMM')}</div>}
       </div>
       <h4 className="text-xl md:text-2xl font-black text-white italic truncate uppercase tracking-tighter">Dr. {slot.doctorName}</h4>
       <div className="mt-6 flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-white/5 shadow-inner">
          <Clock size={18} className="text-blue-500"/> <span className="text-base md:text-lg font-black text-slate-300 tracking-tight">{format(parseISO(slot.startTime), 'HH:mm')} — {format(parseISO(slot.endTime), 'HH:mm')}</span>
       </div>
    </motion.div>
);

const ViewBtn = ({active, onClick, icon, label}) => (
  <button onClick={onClick} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}>{icon} <span className="hidden sm:inline">{label}</span></button>
);

const EmptyState = ({ message }) => (
    <div className="col-span-full py-20 md:py-32 glass rounded-[2rem] md:rounded-[3rem] border-dashed border-2 border-white/5 flex flex-col items-center justify-center text-center px-6">
        <AlertCircle size={32} className="text-slate-700 mb-4" />
        <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">{message}</h3>
    </div>
);

export default AdminDashboard;