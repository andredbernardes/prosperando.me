// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBlzFowpGSpZSH22Jp_cD514qiPaDIBy8c",
  authDomain: "prosperando-me.firebaseapp.com",
  projectId: "prosperando-me",
  storageBucket: "prosperando-me.firebasestorage.app",
  messagingSenderId: "144968054411",
  appId: "1:144968054411:web:4bc39f7c038517d6b2068e",
  measurementId: "G-612QDW2C7S"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}); 