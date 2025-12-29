# Configurar Firebase Admin SDK para Eliminación Automática de Usuarios

## 🎯 Objetivo

Permitir que el panel de administración elimine usuarios **completamente** (Firestore + Authentication) de forma automática, sin necesidad de ir manualmente a Firebase Console.

---

## 📋 Pasos para Configurar

### **1. Obtener la Service Account Key**

1. Ve a **Firebase Console**: https://console.firebase.google.com
2. Selecciona tu proyecto: **studio-6887300440-a8a65**
3. Click en el ⚙️ (Settings) → **Project settings**
4. Pestaña **Service accounts**
5. Click en **"Generate new private key"**
6. Confirma → Se descargará un archivo JSON

### **2. Copiar las Credenciales al .env**

Abre el archivo JSON descargado y copia **todo el contenido** en una sola línea.

En tu archivo `.env`, agrega:

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"studio-6887300440-a8a65","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@studio-6887300440-a8a65.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

**Importante:**
- Todo el JSON debe estar en **una sola línea**
- No agregues espacios ni saltos de línea
- Las comillas dobles dentro deben mantenerse

### **3. Reiniciar el Servidor**

```bash
npm run dev
```

### **4. Probar**

1. Ve al panel de admin: `http://localhost:9002/admin`
2. Intenta eliminar un usuario
3. Debería eliminarse **completamente** (Firestore + Authentication)
4. Verás en consola: `✅ Usuario eliminado de Authentication`

---

## 🔐 Seguridad

### **⚠️ IMPORTANTE: Proteger las Credenciales**

**En tu `.gitignore` debe estar:**
```
.env
.env.local
```

**NUNCA subas el `.env` a GitHub** - contiene credenciales sensibles.

### **Para Producción (Render/Vercel):**

1. En el dashboard de tu hosting, ve a **Environment Variables**
2. Agrega `FIREBASE_SERVICE_ACCOUNT_KEY` con el JSON completo
3. NO la agregues al repositorio

---

## 🎭 Alternativa Sin Firebase Admin SDK

Si prefieres **NO** configurar Firebase Admin SDK:

### **Opción Manual (Actual):**

El sistema ya está preparado para funcionar sin Firebase Admin SDK:

1. Eliminas el usuario en el dashboard
2. Se eliminan los datos de Firestore ✅
3. Aparece un **modal con instrucciones** claras
4. Sigues los pasos para eliminar de Authentication manualmente

**Ventajas:**
- ✅ No requiere credenciales adicionales
- ✅ Más seguro (no hay service account)
- ✅ Funciona inmediatamente

**Desventajas:**
- ⚠️ Requiere un paso manual en Firebase Console

---

## 🚀 Recomendación

### **Para Desarrollo Local:**
✅ **Configura Firebase Admin SDK** - Más rápido y cómodo

### **Para Producción:**
⚠️ **Evalúa la seguridad** - Las service accounts tienen permisos amplios

### **Si tienes dudas:**
✅ **Usa el método manual** - Es más seguro y solo toma 30 segundos

---

## 🧪 Cómo Verificar que Funciona

### **Sin Firebase Admin SDK configurado:**
```
Logs del servidor:
⚠️ Firebase Admin SDK no disponible
❌ Could not delete from Authentication
```

Se mostrará el modal con instrucciones manuales.

### **Con Firebase Admin SDK configurado:**
```
Logs del servidor:
✅ Firebase Admin SDK initialized
✅ Usuario eliminado de Authentication: [uid]
```

No se mostrará el modal, todo será automático.

---

## ❓ FAQ

**P: ¿Es obligatorio configurar Firebase Admin SDK?**  
R: No, el sistema funciona perfectamente sin él. Solo necesitas un paso manual.

**P: ¿Es seguro usar Firebase Admin SDK?**  
R: Sí, si proteges correctamente las credenciales y no las subes a GitHub.

**P: ¿Puedo usar esto en producción?**  
R: Sí, pero asegúrate de usar variables de entorno del hosting, no del repositorio.

**P: ¿Qué pasa si pierdo la service account key?**  
R: Puedes generar una nueva en Firebase Console (paso 1).

---

## 📝 Resumen

| Método | Pros | Contras | Recomendado |
|--------|------|---------|-------------|
| **Firebase Admin SDK** | Automático, rápido | Requiere credenciales sensibles | ✅ Desarrollo local |
| **Manual con Modal** | Seguro, sin credenciales | Un paso extra (30s) | ✅ Producción |

Elige el que mejor se adapte a tus necesidades.
