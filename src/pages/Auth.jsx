import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { LogIn, UserPlus, Mail, Lock, User, Activity, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

/* ─── CHARTE BELLE IMAGERIE ───────────────────────────────────────────────
   Fond principal  : #0a0f2e (bleu marine profond)
   Accent principal: #00c8c8 (cyan turquoise)
   Accent secondaire: #6366f1 (indigo violet)
   Texte principal : #ffffff
   Texte secondaire: #94a3b8
   Texte tertiaire : #475569
──────────────────────────────────────────────────────────────────────────── */

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(isLogin ? 'Connexion BI-AGENDA...' : 'Création du compte...');
    try {
      if (isLogin) {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const userSnap = await getDoc(doc(db, "users", res.user.uid));
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const firstName = userData.fullName ? userData.fullName.split(' ')[0] : 'Docteur';
          toast.success(`Bienvenue, Dr. ${firstName} !`, { id: loadingToast });
          userData.role === 'admin' ? navigate('/admin') : navigate('/doctor');
        }
      } else {
        if (phone.length < 8) throw new Error("Le numéro de téléphone semble invalide.");
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const userData = {
          uid: res.user.uid, fullName, email, phone, role: 'doctor',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", res.user.uid), userData);
        toast.success('Compte BI-AGENDA créé !', { id: loadingToast });
        setTimeout(() => navigate('/doctor'), 600);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erreur d'authentification", { id: loadingToast });
    }
  };

  return (
    <div style={{ background: '#0a0f2e', fontFamily: "'Sora', sans-serif" }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        * { font-family: 'Sora', sans-serif; }

        .bi-input {
          width: 100%;
          padding: 14px 14px 14px 46px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(0,200,200,0.15);
          border-radius: 14px;
          color: #e2e8f0;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .bi-input:focus {
          border-color: rgba(0,200,200,0.5);
          background: rgba(0,200,200,0.04);
        }
        .bi-input::placeholder { color: #334155; }
        .bi-submit {
          width: 100%;
          background: #00c8c8;
          color: #0a0f2e;
          padding: 15px;
          border-radius: 14px;
          border: none;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          transition: all 0.2s;
        }
        .bi-submit:hover {
          background: #00e0e0;
          box-shadow: 0 8px 28px rgba(0,200,200,0.3);
          transform: translateY(-1px);
        }
        .bi-submit:active { transform: scale(0.98); }
        .bi-tab-active {
          background: #00c8c8 !important;
          color: #0a0f2e !important;
        }
        .bi-tab-inactive {
          background: transparent !important;
          color: #475569 !important;
        }
      `}</style>

      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(0,200,200,0.2)' }
        }}
      />

      {/* Ambiance lumineuse */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        overflow: 'hidden', pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%',
          width: '50%', height: '50%',
          background: 'radial-gradient(circle, rgba(0,200,200,0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-10%',
          width: '55%', height: '55%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
      </div>

      {/* Carte principale */}
      <motion.div
        key={isLogin ? "login" : "signup"}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(0,200,200,0.15)',
          borderRadius: '28px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          zIndex: 10,
          backdropFilter: 'blur(24px)'
        }}
      >
        {/* Logo & en-tête */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px',
            background: '#00c8c8',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 8px 32px rgba(0,200,200,0.25)'
          }}>
            <Activity style={{ color: '#0a0f2e' }} size={28} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-1px', fontStyle: 'italic', textTransform: 'uppercase' }}>
            BI-<span style={{ color: '#00c8c8' }}>AGENDA</span>
          </h1>
          <p style={{ fontSize: '10px', color: '#475569', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '6px' }}>
            {isLogin ? 'Authentification sécurisée' : 'Inscription Praticien'}
          </p>
        </div>

        {/* Sélecteur Connexion / Inscription */}
        <div style={{
          display: 'flex', gap: '4px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '12px', padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={isLogin ? 'bi-tab-active' : 'bi-tab-inactive'}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px',
              border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={!isLogin ? 'bi-tab-active' : 'bi-tab-inactive'}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px',
              border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Champs inscription uniquement */}
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}
            >
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '14px', top: '15px', color: '#334155' }} size={16} />
                <input type="text" placeholder="Nom complet" className="bi-input"
                  value={fullName} onChange={e => setFullName(e.target.value)} required={!isLogin} />
              </div>
              <div style={{ position: 'relative' }}>
                <Phone style={{ position: 'absolute', left: '14px', top: '15px', color: '#334155' }} size={16} />
                <input type="tel" placeholder="Numéro de téléphone" className="bi-input"
                  value={phone} onChange={e => setPhone(e.target.value)} required={!isLogin} />
              </div>
            </motion.div>
          )}

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: '14px', top: '15px', color: '#334155' }} size={16} />
            <input type="email" placeholder="Email professionnel" className="bi-input"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          {/* Mot de passe */}
          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: '14px', top: '15px', color: '#334155' }} size={16} />
            <input type="password" placeholder="Mot de passe" className="bi-input"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="bi-submit" style={{ marginTop: '4px' }}>
            {isLogin ? <><LogIn size={18}/> Connexion</> : <><UserPlus size={18}/> Créer mon compte</>}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#475569' }}>
          {isLogin ? "Nouveau praticien ?" : "Déjà inscrit ?"}
          <button type="button" onClick={() => setIsLogin(!isLogin)}
            style={{
              marginLeft: '8px', color: '#00c8c8', background: 'none', border: 'none',
              cursor: 'pointer', fontWeight: 700, textDecoration: 'underline',
              textUnderlineOffset: '3px', fontSize: '13px'
            }}>
            {isLogin ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </motion.div>

      {/* Signature */}
      <div style={{
        position: 'absolute', bottom: '24px', width: '100%',
        textAlign: 'center', opacity: 0.2
      }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '4px', textTransform: 'uppercase' }}>
          by Belle Imagerie
        </p>
      </div>
    </div>
  );
};

export default Auth;