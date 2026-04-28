# Comandos Útiles

## Instalación rápida
npm install

## Desarrollo
npm run dev

## Build para producción
npm run build

## Preview del build
npm run preview

## Estructura del payload que se envía al backend

```javascript
{
  fcmToken: "eLJ8vZxxx...",  // Token único de FCM
  deviceInfo: {
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
    platform: "MacIntel",
    language: "es-ES",
    screenResolution: "1920x1080",
    timezone: "America/Bogota",
    isMobile: false
  },
  subscribedAt: "2026-04-24T15:30:00.000Z"
}
```

## Headers enviados
```
Content-Type: application/json
Authorization: Bearer <clerk-jwt-token>
```

## Ejemplo de validación en backend (Node.js)

```javascript
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

app.post('/api-dory-managment/notification/push/fcm-subscriptions', 
  ClerkExpressRequireAuth(),
  async (req, res) => {
    const { fcmToken, deviceInfo, subscribedAt } = req.body;
    const userId = req.auth.userId; // Usuario autenticado con Clerk
    
    // Guardar en base de datos
    await db.fcmSubscriptions.create({
      userId,
      fcmToken,
      deviceInfo,
      subscribedAt
    });
    
    res.json({ success: true, message: 'Suscripción guardada' });
  }
);
```

## Enviar notificación desde el backend

```javascript
import admin from 'firebase-admin';

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Enviar notificación
const message = {
  notification: {
    title: 'Nueva tarea asignada',
    body: 'Tienes una nueva tarea para hoy'
  },
  data: {
    taskId: '123',
    url: '/tasks/123'
  },
  token: fcmToken // Token del usuario
};

await admin.messaging().send(message);
```
