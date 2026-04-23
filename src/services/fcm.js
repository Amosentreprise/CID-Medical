import { messaging, db } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';

// TA CLÉ VAPID (Générée dans la console Firebase > Paramètres du projet > Cloud Messaging)
const VAPID_KEY = "BElG3Xaboxvxf6U0K3cHWG_yMEB5kgN8vomKGXQ7GoOHegUpr90mI9LYMMVskSuUfcAElql2kgiFPYR5zgB_VNM";

export const requestNotificationPermission = async (userId) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        // On enregistre le token dans le profil de l'utilisateur sur Firestore
        await updateDoc(doc(db, "users", userId), {
          fcmToken: token
        });
        console.log("Token FCM enregistré avec succès !");
      }
    } else {
      console.log("Permission de notification refusée.");
    }
  } catch (error) {
    console.error("Erreur FCM :", error);
  }
};

// Écouteur pour les messages quand l'app est OUVERTE
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });