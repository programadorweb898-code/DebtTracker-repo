# 🚀 Guía de Configuración de Variables de Entorno en Render

## 📋 Variables Requeridas

Debes configurar las siguientes variables de entorno en el dashboard de Render:

### 1. Variables de Firebase (PÚBLICAS)
Estas son las credenciales de tu proyecto Firebase:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC5z1QDzTNQ2sgoD0P_h64iZFptbrMJuhc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-6887300440-a8a65.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-6887300440-a8a65
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-6887300440-a8a65.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=163910146095
NEXT_PUBLIC_FIREBASE_APP_ID=1:163910146095:web:9181898856b50e12514eda
```

### 2. Variables de Configuración (PÚBLICAS)

```
NEXT_PUBLIC_WEBHOOK_URL=https://render-repo-36pu.onrender.com/webhook/32e8ee1f-bcff-4c8d-8c64-1dca826b1d5c
NEXT_PUBLIC_ADMIN_EMAIL=gomito724@gmail.com
NEXT_PUBLIC_ADMIN_PANEL_EMAIL=admin@debttracker.local
```

### 3. Variables Privadas (API Keys)

```
GEMINI_API_KEY=AIzaSyDjCcMM8TPZ_a6Jwdt5O_FlETPCyhXz9NA
RENDER_API_KEY=rnd_SpRIj7hTF9ZKTU3NCG6vguyZUcVr
```

### 4. Firebase Admin SDK (MUY IMPORTANTE) ⚠️

```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"..."}
```

**⚠️ CRÍTICO**: Esta variable es necesaria para las API routes que verifican emails y gestionan usuarios.

---

## 🔧 Cómo Configurar en Render

### Paso 1: Ir al Dashboard
1. Ve a [https://dashboard.render.com](https://dashboard.render.com)
2. Selecciona tu servicio (DebtTracker)
3. Ve a la pestaña **"Environment"**

### Paso 2: Agregar Variables
Para cada variable:
1. Click en **"Add Environment Variable"**
2. **Key**: Nombre de la variable (ej: `NEXT_PUBLIC_FIREBASE_API_KEY`)
3. **Value**: Valor de la variable
4. Click en **"Save"**

### Paso 3: Obtener FIREBASE_SERVICE_ACCOUNT_KEY

Esta es la variable más importante y compleja:

#### Opción A: Si ya tienes el archivo JSON
1. Ve a Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Descarga el archivo JSON
4. Abre el archivo con un editor de texto
5. **Copia TODO el contenido en UNA SOLA LÍNEA** (sin saltos de línea)
6. Pega en Render como valor de `FIREBASE_SERVICE_ACCOUNT_KEY`

#### Opción B: Formato del JSON
El JSON debe verse así (TODO en una línea):
```json
{"type":"service_account","project_id":"studio-6887300440-a8a65","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@studio-6887300440-a8a65.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40studio-6887300440-a8a65.iam.gserviceaccount.com"}
```

---

## ✅ Checklist de Variables

Marca las variables que ya configuraste en Render:

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_WEBHOOK_URL`
- [ ] `NEXT_PUBLIC_ADMIN_EMAIL`
- [ ] `NEXT_PUBLIC_ADMIN_PANEL_EMAIL`
- [ ] `GEMINI_API_KEY`
- [ ] `RENDER_API_KEY`
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` ⚠️ **MUY IMPORTANTE**

---

## 🔍 Verificar Configuración

Después de agregar todas las variables:

1. **Guarda los cambios** en Render
2. **Redeploy automático**: Render debería iniciar un nuevo deploy automáticamente
3. **Ver logs**: En la pestaña "Logs" verás si hay errores
4. **Espera a que termine**: El deploy puede tardar 5-10 minutos

---

## 🚨 Errores Comunes

### Error: "invalid-api-key"
- **Causa**: `NEXT_PUBLIC_FIREBASE_API_KEY` no está configurada o es incorrecta
- **Solución**: Verifica que el valor sea exactamente el mismo que en tu `.env` local

### Error: "Missing or insufficient permissions"
- **Causa**: `FIREBASE_SERVICE_ACCOUNT_KEY` no está configurada
- **Solución**: Genera el service account key en Firebase y agrégalo

### Error: Build falla en Render pero funciona local
- **Causa**: Variables de entorno faltantes
- **Solución**: Verifica que TODAS las variables estén en Render

---

## 📝 Notas Importantes

1. **Variables NEXT_PUBLIC_***: Estas se exponen al cliente (navegador)
2. **Variables sin NEXT_PUBLIC_**: Solo disponibles en el servidor
3. **FIREBASE_SERVICE_ACCOUNT_KEY**: Nunca debe ser pública, solo en servidor
4. **After adding variables**: Render hará redeploy automático

---

## 🆘 Si Aún Falla

1. **Revisa los logs de Render**: Ve a "Logs" en el dashboard
2. **Busca el error específico**: Copia el mensaje de error
3. **Verifica el formato del JSON**: `FIREBASE_SERVICE_ACCOUNT_KEY` debe ser JSON válido en una línea

---

## 🎯 Siguiente Paso

Una vez configuradas todas las variables:
1. Espera a que Render termine el deploy
2. Ve a tu URL de Render (ej: `https://tu-app.onrender.com`)
3. Prueba el login y las funcionalidades

---

**Última actualización**: $(date)
**Variables totales**: 12
**Variables críticas**: `FIREBASE_SERVICE_ACCOUNT_KEY`, `NEXT_PUBLIC_FIREBASE_API_KEY`
