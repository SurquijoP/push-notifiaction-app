# 🔔 Push Notifications App

Proyecto React mínimo con suscripción a notificaciones push usando Firebase Cloud Messaging (FCM) y autenticación con Clerk.

## 📋 Características

- ✅ Botón de suscripción a notificaciones push
- ✅ Generación de token FCM
- ✅ Recopilación de información del dispositivo
- ✅ Autenticación con Clerk
- ✅ Envío de datos al backend

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Luego edita `.env` con tus credenciales:

#### **Clerk** (https://clerk.com)

1. Crea una cuenta en Clerk
2. Crea una nueva aplicación
3. Copia tu `Publishable Key`:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
   ```

#### **Firebase** (https://console.firebase.google.com)

1. Crea un proyecto en Firebase Console
2. Ve a Project Settings → General
3. En "Your apps", crea una app web
4. Copia la configuración:
   ```
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:...
   ```

5. Para obtener el VAPID Key:
   - Ve a Project Settings → Cloud Messaging
   - En "Web Push certificates", genera un nuevo par de claves
   - Copia la clave pública (Key pair):
   ```
   VITE_FIREBASE_VAPID_KEY=Bxxxxx...
   ```

### 3. Configurar el Service Worker

Edita `public/firebase-messaging-sw.js` y reemplaza la configuración de Firebase con tus valores reales:

```javascript
firebase.initializeApp({
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
});
```

### 4. Habilitar Cloud Messaging en Firebase

1. En Firebase Console, ve a **Build → Cloud Messaging**
2. Si te pide activar la API, habilita **Cloud Messaging API**

## 🏃‍♂️ Ejecutar el proyecto

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📝 Cómo funciona

1. **Usuario inicia sesión** con Clerk
2. **Click en "Suscribirse"**:
   - Se solicitan permisos de notificación del navegador
   - Se genera un token FCM único
   - Se recopila información del dispositivo (user agent, platform, etc.)
   - Se obtiene el token de autenticación de Clerk
3. **Se envía POST** a `http://localhost:3000/api-dory-managment/notification/push/fcm-subscriptions`:
   ```json
   {
     "fcmToken": "eLJ8vZ...",
     "deviceInfo": {
       "userAgent": "Mozilla/5.0...",
       "platform": "MacIntel",
       "language": "es-ES",
       "screenResolution": "1920x1080",
       "timezone": "America/Bogota",
       "isMobile": false
     },
     "subscribedAt": "2026-04-24T12:00:00.000Z"
   }
   ```
4. **Headers incluyen autenticación**:
   ```
   Authorization: Bearer <clerk-token>
   ```

## 🔧 Estructura del proyecto

```
push-notifications-app/
├── public/
│   └── firebase-messaging-sw.js    # Service Worker para notificaciones
├── src/
│   ├── App.jsx                     # Componente principal con botón
│   ├── App.css                     # Estilos del componente
│   ├── firebase.js                 # Configuración de Firebase
│   ├── main.jsx                    # Punto de entrada con Clerk
│   └── index.css                   # Estilos globales
├── .env.example                    # Ejemplo de variables de entorno
├── package.json
└── vite.config.js
```

## 🔐 Backend esperado

El backend debe aceptar:

**Endpoint:** `POST http://localhost:3000/api-dory-managment/notification/push/fcm-subscriptions`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <clerk-jwt-token>
```

**Body:**
```json
{
  "fcmToken": "string",
  "deviceInfo": {
    "userAgent": "string",
    "platform": "string",
    "language": "string",
    "screenResolution": "string",
    "timezone": "string",
    "isMobile": boolean
  },
  "subscribedAt": "ISO 8601 date string"
}
```

## 📱 Probar notificaciones

Una vez suscrito, puedes enviar notificaciones de prueba desde Firebase Console:

1. Ve a **Messaging** en Firebase Console
2. Click en "Send your first message"
3. Escribe un título y mensaje
4. En "Target", selecciona el token del dispositivo

## 🐛 Troubleshooting

### Permisos de notificación bloqueados
- Ve a la configuración del navegador → Privacidad → Notificaciones
- Permite notificaciones para `localhost:5173`

### Error de VAPID Key
- Verifica que copiaste la clave completa desde Firebase Console
- La clave debe empezar con `B` y tener ~88 caracteres

### Service Worker no se registra
- Abre DevTools → Application → Service Workers
- Verifica que `firebase-messaging-sw.js` esté registrado
- Si hay errores, revisa la configuración de Firebase en el SW

### Error 401 en el endpoint
- Verifica que Clerk esté configurado correctamente
- Revisa que el token se esté enviando en el header `Authorization`
- En el backend, valida el token con Clerk SDK

## 📚 Referencias

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Clerk Documentation](https://clerk.com/docs)
- [Vite](https://vitejs.dev)
- [React](https://react.dev)
