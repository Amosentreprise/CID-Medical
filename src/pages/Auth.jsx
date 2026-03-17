import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { LogIn, UserPlus, Mail, Lock, User, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Pour la redirection
import toast, { Toaster } from 'react-hot-toast'; // Pour les notifications

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(isLogin ? 'Connexion en cours...' : 'Création du compte...');
    
    try {
      if (isLogin) {
        // --- LOGIQUE DE CONNEXION ---
        const res = await signInWithEmailAndPassword(auth, email, password);
        
        // On récupère le rôle dans Firestore pour savoir où envoyer l'utilisateur
        const userSnap = await getDoc(doc(db, "users", res.user.uid));
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          toast.success(`Bienvenue, ${userData.fullName} !`, { id: loadingToast });
          
          // Redirection selon le rôle
          if (userData.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/doctor');
          }
        }
      } else {
        // --- LOGIQUE D'INSCRIPTION ---
        const res = await createUserWithEmailAndPassword(auth, email, password);
        
        const userData = {
          uid: res.user.uid,
          fullName,
          email,
          role: 'doctor', // Rôle par défaut via inscription publique
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, "users", res.user.uid), userData);
        
        toast.success('Compte créé avec succès !', { id: loadingToast });
        navigate('/doctor');
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur : Vérifiez vos identifiants ou votre connexion.", { id: loadingToast });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Composant indispensable pour afficher les toasts */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Cercles décoratifs animés */}
      <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-10 left-10 w-72 h-72 bg-blue-600/30 rounded-full blur-[80px]" />
      <motion.div animate={{ scale: [1, 1.3, 1], y: [0, -50, 0] }} transition={{ duration: 12, repeat: Infinity, delay: 2 }} className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-md p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 border border-blue-400/30">
            <Activity className="text-blue-400 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">CID Medical</h1>
          <p className="text-gray-400 text-sm">{isLogin ? 'Bon retour parmi nous' : 'Créez votre compte médecin'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode='wait'>
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                <input type="text" placeholder="Nom complet" className="glass-input w-full pl-10" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input type="email" placeholder="Email professionnel" className="glass-input w-full pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input type="password" placeholder="Mot de passe" className="glass-input w-full pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
            {isLogin ? <><LogIn size={18}/> Se connecter</> : <><UserPlus size={18}/> Créer le compte</>}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? "Nouveau ici ?" : "Déjà un compte ?"}
          <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-blue-400 hover:underline font-medium">
            {isLogin ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;