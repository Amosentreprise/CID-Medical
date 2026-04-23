importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Remplace par TES clés de configuration Firebase
const firebaseConfig = {
   apiKey: "AIzaSyCgZaa7mdbqCLVVeYO-AgGBR7EWJgRC0B8",
    authDomain: "calendrier-medical-81320.firebaseapp.com",
    projectId: "calendrier-medical-81320",
    storageBucket: "calendrier-medical-81320.firebasestorage.app",
    messagingSenderId: "778650366802",
    appId: "1:778650366802:web:ea56b1972dbc5c60e7c08b"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Gestion des notifications quand l'application est en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notification reçue en arrière-plan :', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa.png', // Ton icône BI-AGENDA
    badge: '/pwa.png', // Petite icône pour la barre de statut
    tag: 'bi-agenda-alert', // Empêche d'empiler 50 notifications
    data: { url: payload.data.url || '/' }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Action au clic sur la notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});