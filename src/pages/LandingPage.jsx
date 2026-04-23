import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Clock, Zap, 
  ChevronRight, Layers,
  Calendar
} from 'lucide-react';

/* ─── CHARTE BELLE IMAGERIE ───────────────────────────────────────────────
   Fond principal  : #0a0f2e (bleu marine profond)
   Accent principal: #00c8c8 (cyan turquoise)
   Accent secondaire: #6366f1 (indigo violet)
   Texte principal : #ffffff
   Texte secondaire: #94a3b8
   Texte tertiaire : #475569
   Bordure accent  : rgba(0, 200, 200, 0.15)
──────────────────────────────────────────────────────────────────────────── */

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{ fontFamily: "'Sora', 'Nunito', sans-serif" }}
      className="min-h-screen text-slate-200 overflow-x-hidden selection:bg-cyan-500/30"
      // Fond bleu marine de Belle Imagerie
      css={`background: #0a0f2e;`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        * { font-family: 'Sora', sans-serif; }
        body, #root { background: #0a0f2e; }

        .bi-glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .bi-glow-cyan {
          box-shadow: 0 0 40px rgba(0, 200, 200, 0.15);
        }
        .bi-btn-primary {
          background: #00c8c8;
          color: #0a0f2e;
          transition: all 0.2s ease;
        }
        .bi-btn-primary:hover {
          background: #00e0e0;
          box-shadow: 0 8px 32px rgba(0, 200, 200, 0.35);
          transform: translateY(-1px);
        }
        .bi-card:hover {
          border-color: rgba(0, 200, 200, 0.3) !important;
          background: rgba(0, 200, 200, 0.04) !important;
        }
        .bi-nav-btn:hover {
          background: #00e0e0;
        }
      `}</style>

     
      

      {/* ─── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bi-glass px-6 py-4"
        style={{ borderBottom: '1px solid rgba(0,200,200,0.1)' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div style={{ background: '#00c8c8', borderRadius: '12px', padding: '8px' }}
              className="bi-glow-cyan">
              <Calendar style={{ color: '#0a0f2e' }} size={22} />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white italic uppercase">
              BI-<span style={{ color: '#00c8c8' }}>AGENDA</span>
            </h1>
          </div>
          <button
            onClick={() => navigate('/auth')}
            className="bi-btn-primary bi-nav-btn px-6 py-2.5 rounded-full font-bold text-sm active:scale-95"
          >
            ESPACE PRATICIEN
          </button>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative pt-44 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10"
            style={{
              background: 'rgba(0,200,200,0.08)',
              border: '1px solid rgba(0,200,200,0.25)'
            }}
          >
            <Zap size={12} style={{ color: '#00c8c8' }} />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#00c8c8' }}>
              Innovation Belle Imagerie
            </span>
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-black text-white italic uppercase mb-8 tracking-tighter leading-none"
            style={{ fontSize: 'clamp(44px, 9vw, 96px)' }}
          >
            DISPONIBILITÉ{' '}
            <span style={{
              color: 'transparent',
              backgroundImage: 'linear-gradient(90deg, #00c8c8, #6366f1)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text'
            }}>
              EN TEMPS RÉEL.
            </span>
          </motion.h1>

          {/* Sous-titre */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto mb-14 space-y-4"
          >
            <p className="text-slate-300 font-semibold leading-snug" style={{ fontSize: '18px' }}>
              BI-AGENDA est la solution stratégique de Belle Imagerie pour{' '}
              <span className="text-white" style={{
                textDecoration: 'underline',
                textDecorationColor: '#00c8c8',
                textUnderlineOffset: '4px'
              }}>
                fluidifier le diagnostic médical.
              </span>
            </p>
            <p style={{ color: '#64748b', fontSize: '16px' }}>
              Synchronisez la disponibilité des médecins pour{' '}
              <span style={{ color: '#94a3b8' }}>éliminer l'attente d'interprétation</span>{' '}
              et garantir une prise en charge immédiate.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => navigate('/auth')}
              className="group bi-btn-primary font-black text-lg rounded-[2.5rem] px-12 py-5 flex items-center gap-3 mx-auto"
              style={{ fontSize: '18px' }}
            >
              Lancer BI-AGENDA
              <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" style={{ color: '#0a0f2e' }} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Carte 1 — Zéro Attente */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bi-card bi-glass p-10 rounded-[2.5rem] flex flex-col justify-between transition-all duration-300"
            style={{ border: '1px solid rgba(0,200,200,0.12)' }}
          >
            <div style={{
              width: '56px', height: '56px',
              background: 'rgba(0,200,200,0.12)',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '28px'
            }}>
              <Clock style={{ color: '#00c8c8' }} size={28} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white italic uppercase mb-3 tracking-tighter">
                Zéro Attente
              </h3>
              <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.7' }}>
                Visualisez instantanément quel spécialiste est actif pour interpréter vos examens sans délai.
              </p>
            </div>
          </motion.div>

          {/* Carte 2 — Interface Agile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bi-card bi-glass p-10 rounded-[2.5rem] flex flex-col justify-between transition-all duration-300"
            style={{ border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <div style={{
              width: '56px', height: '56px',
              background: 'rgba(99,102,241,0.12)',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '28px'
            }}>
              <Layers style={{ color: '#818cf8' }} size={28} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white italic uppercase mb-3 tracking-tighter">
                Interface Agile
              </h3>
              <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.7' }}>
                Un outil léger, conçu pour s'intégrer parfaitement au quotidien des centres d'imagerie.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="pt-16 pb-10 px-6" style={{ borderTop: '1px solid rgba(0,200,200,0.08)' }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-4" style={{ opacity: 0.5 }}>
            <div style={{ height: '1px', width: '40px', background: '#475569' }} />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#64748b' }}>DESIGNED BY</span>
            <div style={{ height: '1px', width: '40px', background: '#475569' }} />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">
              BELLE <span style={{ color: '#00c8c8' }}>IMAGERIE</span>
            </h2>
            <p className="text-xs font-black uppercase tracking-widest mt-2" style={{ color: '#334155' }}>
              Excellence & Diagnostic
            </p>
          </div>
          <div className="text-xs font-bold uppercase tracking-widest mt-8" style={{ color: '#1e293b' }}>
            &copy; 2026 BI-AGENDA — Propriété exclusive de Belle Imagerie
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;