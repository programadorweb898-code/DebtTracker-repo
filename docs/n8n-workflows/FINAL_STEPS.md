# ✅ Workflows Creados en n8n - Últimos Pasos

## 🎉 ¡Éxito! Los workflows fueron creados automáticamente

### Workflows Creados:

1. **Password Reset Email - DebtTracker**
   - ID: `CxPrukFB2jbwjSlV`
   - URL: `https://render-repo-36pu.onrender.com/webhook/password-reset`
   - Estado: ⚠️ Inactivo (necesita credenciales Gmail)

2. **User Registration - DebtTracker**
   - ID: `6N9ae63qlJmKgxz7`
   - URL: `https://render-repo-36pu.onrender.com/webhook/user-registration`
   - Estado: ⚠️ Inactivo (necesita credenciales Gmail)

---

## 🔧 Pasos Finales (5 minutos)

### 1. Configurar Gmail OAuth en n8n

1. **Accede a n8n**: https://render-repo-36pu.onrender.com
2. **Ve a "Credentials"** (menú lateral)
3. **Click "Add credential"**
4. **Busca "Gmail OAuth2 API"**

#### Configurar Google Cloud Console:

1. Ve a https://console.cloud.google.com/
2. Selecciona/crea un proyecto
3. **Habilitar Gmail API**:
   - APIs & Services → Library
   - Busca "Gmail API"
   - Click "Enable"

4. **Configurar OAuth consent screen**:
   - APIs & Services → OAuth consent screen
   - User Type: **External**
   - App name: DebtTracker
   - User support email: tu email
   - Developer contact: tu email
   - Save and Continue
   - Scopes: No agregar nada, Skip
   - Test users: Agrega tu email
   - Save

5. **Crear credenciales**:
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: **Web application**
   - Name: n8n DebtTracker
   - Authorized redirect URIs: 
     ```
     https://render-repo-36pu.onrender.com/rest/oauth2-credential/callback
     ```
   - Click "Create"
   - **Copia el Client ID y Client Secret**

#### Volver a n8n:

1. En la credential de Gmail en n8n:
   - Pega el **Client ID**
   - Pega el **Client Secret**
2. Click **"Connect my account"**
3. Autoriza con tu cuenta de Gmail
4. Click **"Save"**
5. Nombra la credential: **"Gmail DebtTracker"**

---

### 2. Asignar Credenciales a los Workflows

#### Workflow 1: Password Reset

1. En n8n, abre: **"Password Reset Email - DebtTracker"**
2. Click en el nodo: **"Send Password Reset Email"**
3. En "Credential to connect with", selecciona: **"Gmail DebtTracker"**
4. Click **"Save"** (arriba a la derecha)

#### Workflow 2: User Registration

1. Abre: **"User Registration - DebtTracker"**
2. Click en: **"Send Welcome Email"**
3. Selecciona: **"Gmail DebtTracker"**
4. Click **"Save"**

---

### 3. Activar los Workflows

1. En **"Password Reset Email - DebtTracker"**:
   - Click en el toggle **"Active"** (arriba derecha)
   - Debe ponerse **verde** ✅

2. En **"User Registration - DebtTracker"**:
   - Click en el toggle **"Active"**
   - Debe ponerse **verde** ✅

---

### 4. Probar los Workflows

#### Test 1: Password Reset

Desde tu terminal:

```bash
curl -X POST https://render-repo-36pu.onrender.com/webhook/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "TU_EMAIL_REAL@gmail.com",
    "timestamp": "2024-12-14T01:00:00Z"
  }'
```

**Resultado esperado:**
- Response 200: `{"success": true, "message": "Email de recuperación enviado exitosamente"}`
- Recibes email en tu bandeja

#### Test 2: Registration

```bash
curl -X POST https://render-repo-36pu.onrender.com/webhook/user-registration \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "test-user-123",
    "email": "TU_EMAIL_REAL@gmail.com",
    "createdAt": "2024-12-14T01:00:00Z"
  }'
```

**Resultado esperado:**
- Response 200: `{"success": true, "message": "Email de bienvenida enviado"}`
- Recibes email de bienvenida

---

### 5. Probar desde la App

1. **Inicia tu app**:
   ```bash
   npm run dev
   ```

2. **Prueba Registro**:
   - Ve a `/register`
   - Regístrate con tu email real
   - Debes recibir email de bienvenida ✅

3. **Prueba Password Reset**:
   - Ve a `/login`
   - Click "¿Olvidaste tu contraseña?"
   - Ingresa tu email registrado
   - Debes recibir 2 emails:
     1. Confirmación (n8n) ✅
     2. Link de reset (Firebase) ✅

---

## ✅ Checklist Final

- [ ] Gmail OAuth configurado en Google Cloud
- [ ] Credencial Gmail creada en n8n
- [ ] Credenciales asignadas a ambos workflows
- [ ] Workflow "Password Reset" activado (verde)
- [ ] Workflow "User Registration" activado (verde)
- [ ] Test con curl funciona
- [ ] Test desde la app funciona
- [ ] Emails llegan correctamente

---

## 🎯 URLs Importantes

### n8n Dashboard
https://render-repo-36pu.onrender.com

### Webhooks URLs (ya configuradas en el código)
- Password Reset: `https://render-repo-36pu.onrender.com/webhook/password-reset`
- Registration: `https://render-repo-36pu.onrender.com/webhook/user-registration`

### Google Cloud Console
https://console.cloud.google.com/

---

## 🆘 Troubleshooting

### Email no llega

1. **Revisa spam/promociones**
2. **Verifica en n8n**:
   - Ve a "Executions"
   - Busca la última ejecución
   - Revisa si hay errores
3. **Verifica credencial Gmail**:
   - Settings → Credentials
   - Prueba reconectar si es necesario

### Error "Unauthorized"

1. Gmail credential no está conectada
2. Reconecta en n8n
3. Verifica que hayas autorizado todos los scopes

### Workflow no se ejecuta

1. Verifica que esté **Active** (verde)
2. Revisa la URL del webhook
3. Mira los logs en n8n Executions

---

## 🎉 ¡Listo!

Una vez completados estos pasos:

✅ Los usuarios recibirán emails de bienvenida al registrarse
✅ Los usuarios recibirán 2 emails al recuperar contraseña
✅ Todo funcionará automáticamente
✅ Los workflows están en producción en Render

---

## 📊 Monitoreo

Puedes ver todas las ejecuciones en:
**n8n → Executions**

Ahí verás:
- Cuántos emails se han enviado
- Si hubo errores
- Tiempos de ejecución
- Datos de cada request

---

🎯 **¡Ahora solo falta configurar Gmail y activar!** 🚀
