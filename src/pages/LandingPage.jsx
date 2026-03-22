import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Activity, Clock, Zap, 
  ChevronRight, Microscope, Layers
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden selection:bg-blue-500/30 font-sans">
      
      {/* Effets de lumière en arrière-plan */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-6 py-5 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
              <Activity className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white italic uppercase">
              CID <span className="text-blue-500">Medical</span>
            </h1>
          </div>
          <button 
            onClick={() => navigate('/auth')}
            className="px-8 py-3 rounded-full bg-blue-600 text-white text-sm font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            ESPACE PRATICIEN
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-48 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-10"
          >
            <Zap size={14} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Innovation Belle Imagerie</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter leading-[0.85] italic uppercase"
          >
            FLUX DE TRAVAIL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">
              OPTIMISÉ.
            </span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto mb-16 space-y-6"
          >
            <p className="text-slate-300 text-xl md:text-2xl font-bold leading-snug">
              L'application CID est une solution légère et indépendante visant à <span className="text-white underline decoration-blue-500 underline-offset-4">optimiser le flux de travail médical.</span>
            </p>
            <p className="text-slate-500 text-lg md:text-xl font-medium">
              Elle permet de <span className="text-slate-200">supprimer les retards d’interprétation</span> des examens en offrant une visibilité en temps réel sur la disponibilité des médecins.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button 
              onClick={() => navigate('/auth')}
              className="group bg-white text-[#020617] px-12 py-6 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-white/5 flex items-center gap-3 mx-auto transition-all hover:scale-105"
            >
              Lancer CID Medical
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* --- GRID DE MISSION --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass p-12 rounded-[3.5rem] border border-white/5 flex flex-col justify-between h-full">
                <Clock className="text-blue-500 mb-8" size={48} />
                <div>
                    <h3 className="text-3xl font-black text-white italic uppercase mb-4">Temps Réel</h3>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed">
                        Plus d'incertitude. Visualisez instantanément quel radiologue est prêt à interpréter vos examens.
                    </p>
                </div>
            </div>
            <div className="glass p-12 rounded-[3.5rem] border border-white/5 flex flex-col justify-between h-full">
                <Layers className="text-indigo-500 mb-8" size={48} />
                <div>
                    <h3 className="text-3xl font-black text-white italic uppercase mb-4">Indépendance</h3>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed">
                        Une interface légère qui s'intègre à votre routine sans alourdir vos systèmes existants.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* --- FOOTER & SIGNATURE --- */}
      <footer className="pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
            <div className="flex items-center gap-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                <div className="h-[1px] w-12 bg-slate-500"></div>
                <span className="text-xs font-black uppercase tracking-[0.5em] text-slate-400">DEVELOPED BY</span>
                <div className="h-[1px] w-12 bg-slate-500"></div>
            </div>
            
            <div className="flex flex-col items-center">
                <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">
                    BELLE <span className="text-blue-500">IMAGERIE</span>
                </h2>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
                    Excellence & Diagnostic
                </p>
            </div>

            <div className="mt-12 text-slate-700 text-[9px] font-bold uppercase tracking-widest">
                &copy; 2026 CID Medical — All Rights Reserved
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;