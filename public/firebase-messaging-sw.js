importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configura Firebase en el service worker
// IMPORTANTE: Reemplaza estos valores con tu configuración real de Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAYwzEdueK4HeCOWHjgk9VM27Z5jI0kRgU",
  authDomain: "test-2f307.firebaseapp.com",
  projectId: "test-2f307",
  storageBucket: "test-2f307.firebasestorage.app",
  messagingSenderId: "995641944094",
  appId: "1:995641944094:web:956a8c65dcab0974b7e60f"
});

const messaging = firebase.messaging();

// Maneja mensajes en background
messaging.onBackgroundMessage((payload) => {
  console.log('Mensaje recibido en background:', payload);
  
  const notificationTitle = payload.notification?.title || 'Nueva notificación';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva notificación',
    icon: payload.notification?.icon || '/notification-icon.png',
    badge: '/badge-icon.png',
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions)
    .catch(err => console.error('showNotification falló en onBackgroundMessage:', err));
});

// Listener directo para push events
self.addEventListener('push', (event) => {
  console.log('Push event directo:', event);

  let payload = {};
  try {
    payload = event.data?.json() || {};
  } catch (err) {
    console.error('Error leyendo payload de push:', err);
  }

  const title = payload.notification?.title || 'Nueva notificación';
  const options = {
    body: payload.notification?.body || 'Tienes una nueva notificación',
    icon: payload.notification?.icon || '/notification-icon.png',
    badge: '/badge-icon.png',
    data: payload.data
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
      .catch(err => console.error('showNotification falló en push event:', err))
  );
});

// Maneja clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Notificación clickeada:', event);
  event.notification.close();

  if (event.notification.data?.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
