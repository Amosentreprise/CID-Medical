import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { LogIn, UserPlus, Mail, Lock, User, Activity, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

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
          uid: res.user.uid,
          fullName,
          email,
          phone,
          role: 'doctor',
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, "users", res.user.uid), userData);
        toast.success('Compte BI-AGENDA créé !', { id: loadingToast });
        
        setTimeout(() => {
          navigate('/doctor');
        }, 600);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erreur d'authentification", { id: loadingToast });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 bg-[#020617]">
      <Toaster position="top-right" />

      {/* Background animés */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-[80px]" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />

      <motion.div 
        key={isLogin ? "login" : "signup"} 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass w-full max-w-md p-10 relative z-10 border border-white/10 rounded-[2.5rem]"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 p-4 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-600/20">
            <Activity className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white italic uppercase">
            BI-<span className="text-blue-500">AGENDA</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            {isLogin ? 'Authentification sécurisée' : 'Inscription Praticien'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="space-y-4 overflow-hidden"
            >
              <div className="relative">
                <User className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                <input type="text" placeholder="Nom complet" className="glass-input w-full pl-12 py-4 bg-slate-900/50 border-white/5 rounded-2xl text-white outline-none focus:border-blue-500 transition-all" value={fullName} onChange={(e) => setFullName(e.target.value)} required={!isLogin} />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                <input type="tel" placeholder="Numéro de téléphone" className="glass-input w-full pl-12 py-4 bg-slate-900/50 border-white/5 rounded-2xl text-white outline-none focus:border-blue-500 transition-all" value={phone} onChange={(e) => setPhone(e.target.value)} required={!isLogin} />
              </div>
            </motion.div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
            <input type="email" placeholder="Email professionnel" className="glass-input w-full pl-12 py-4 bg-slate-900/50 border-white/5 rounded-2xl text-white outline-none focus:border-blue-500 transition-all" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
            <input type="password" placeholder="Mot de passe" className="glass-input w-full pl-12 py-4 bg-slate-900/50 border-white/5 rounded-2xl text-white outline-none focus:border-blue-500 transition-all" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.98 }} 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black text-white shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 uppercase italic tracking-tighter"
          >
            {isLogin ? <><LogIn size={20}/> Connexion</> : <><UserPlus size={20}/> Créer mon compte</>}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm font-bold text-slate-500">
          {isLogin ? "Nouveau praticien ?" : "Déjà inscrit ?"}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="ml-2 text-blue-500 hover:text-blue-400 transition-colors underline underline-offset-4">
            {isLogin ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </motion.div>
      
      <div className="absolute bottom-8 w-full text-center opacity-20 group">
         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">by Belle Imagerie</p>
      </div>
    </div>
  );
};

export default Auth;