# 🚀 Guía Rápida: Crear Workflows en n8n Manualmente

## ⚠️ Nota Importante
Los workflows NO se pudieron crear automáticamente debido a un error de conexión con n8n. Sigue esta guía para crearlos manualmente.

---

## 📋 Pre-requisitos

1. Acceso a tu instancia de n8n: https://programmingweb.app.n8n.cloud
2. Cuenta de Gmail configurada
3. 15 minutos de tiempo

---

## 🔐 Workflow 1: Password Reset Email

### Paso 1: Crear Nuevo Workflow

1. En n8n, click **"New Workflow"**
2. Nombra el workflow: **"Password Reset Email - DebtTracker"**

### Paso 2: Agregar Webhook Trigger

1. Click en **"+"** para agregar nodo
2. Busca **"Webhook"**
3. Configura:
   - **HTTP Method**: POST
   - **Path**: `password-reset`
   - **Response Mode**: "Respond to Webhook"
   - Click **"Execute Node"** para obtener la URL

**Copia la URL del webhook, la necesitarás después!**

### Paso 3: Agregar Validación de Email

1. Conecta el Webhook a un nuevo nodo
2. Busca **"IF"** (Conditional)
3. Configura:
   - **Condition 1**:
     - Value 1: `{{ $json.email }}`
     - Operation: `is not empty`

### Paso 4: Agregar Nodo de Gmail

1. Desde la salida **TRUE** del IF, agrega un nodo
2. Busca **"Gmail"**
3. Configura:
   - **Resource**: "Message"
   - **Operation**: "Send"
   - **To**: `={{ $json.email }}`
   - **Subject**: `Recuperación de Contraseña - DebtTracker`
   - **Email Type**: "HTML"
   - **Message**: Pega este HTML 👇

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background-color: #F0F8FF; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { color: #A0C4FF; font-size: 32px; font-weight: bold; }
    h1 { color: #333; font-size: 24px; margin-bottom: 20px; }
    p { color: #666; line-height: 1.6; margin-bottom: 20px; }
    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">💰 DebtTracker</div>
    </div>
    <h1>Recuperación de Contraseña</h1>
    <p>Hola,</p>
    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en DebtTracker.</p>
    <p>Este correo confirma que tu solicitud fue procesada correctamente.</p>
    <p><strong>Próximos pasos:</strong> Recibirás un segundo correo de Firebase con el enlace para restablecer tu contraseña.</p>
    <p><strong>Nota:</strong> El enlace expirará en 1 hora por razones de seguridad.</p>
    <p>Si no solicitaste este cambio, puedes ignorar este correo de manera segura.</p>
    <div class="footer">
      <p>© 2024 DebtTracker - Gestión de Deudas</p>
      <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
```

4. **Configurar Credenciales Gmail**:
   - Click "Create New Credential"
   - Sigue el wizard de OAuth2
   - Autoriza tu cuenta de Gmail

### Paso 5: Agregar Response de Éxito

1. Conecta Gmail a un nuevo nodo
2. Busca **"Respond to Webhook"**
3. Configura:
   - **Respond With**: "JSON"
   - **Response Body**: 
   ```json
   {
     "success": true,
     "message": "Email de recuperación enviado exitosamente",
     "email": "={{ $json.email }}"
   }
   ```

### Paso 6: Agregar Response de Error

1. Desde la salida **FALSE** del IF, agrega un nodo
2. Busca **"Respond to Webhook"**
3. Configura:
   - **Respond With**: "JSON"
   - **Response Code**: 400
   - **Response Body**:
   ```json
   {
     "success": false,
     "error": "Email no proporcionado o inválido"
   }
   ```

### Paso 7: Activar Workflow

1. Click en el toggle **"Active"** arriba a la derecha
2. El workflow debe estar en verde ✅
3. **COPIA LA URL DEL WEBHOOK**

---

## 🎉 Workflow 2: User Registration Confirmation

### Paso 1: Crear Nuevo Workflow

1. Click **"New Workflow"**
2. Nombre: **"User Registration - DebtTracker"**

### Paso 2: Webhook Trigger

1. Agrega nodo **"Webhook"**
2. Configura:
   - **HTTP Method**: POST
   - **Path**: `user-registration`
   - **Response Mode**: "Respond to Webhook"

**Copia esta URL también!**

### Paso 3: Validación de Datos

1. Agrega nodo **"IF"**
2. Configura **DOS condiciones** con AND:
   - Condition 1: `{{ $json.email }}` is not empty
   - Condition 2: `{{ $json.uid }}` is not empty

### Paso 4: Gmail Welcome Email

1. Desde salida TRUE, agrega **"Gmail"**
2. Configura:
   - **To**: `={{ $json.email }}`
   - **Subject**: `¡Bienvenido a DebtTracker! 🎉`
   - **Email Type**: "HTML"
   - **Message**: Pega este HTML 👇

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background-color: #F0F8FF; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { color: #A0C4FF; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
    h1 { color: #333; font-size: 28px; margin-bottom: 20px; text-align: center; }
    p { color: #666; line-height: 1.6; margin-bottom: 20px; }
    .features { background-color: #F0F8FF; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .feature { margin-bottom: 12px; padding-left: 24px; position: relative; }
    .feature:before { content: '✓'; position: absolute; left: 0; color: #A0C4FF; font-weight: bold; }
    .button { display: inline-block; background-color: #A0C4FF; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
    .highlight { background-color: #FFF4CC; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">💰 DebtTracker</div>
    </div>
    <h1>¡Bienvenido a DebtTracker!</h1>
    <p>Hola,</p>
    <p>Tu cuenta ha sido creada exitosamente. Estamos emocionados de tenerte con nosotros.</p>
    <p><strong>Detalles de tu cuenta:</strong></p>
    <p>Email: <span class="highlight">={{ $json.email }}</span></p>
    <p>Fecha de registro: {{ $json.createdAt }}</p>
    
    <div class="features">
      <p style="margin-top: 0; font-weight: 600; color: #333;">Con DebtTracker puedes:</p>
      <div class="feature">Registrar y gestionar deudores fácilmente</div>
      <div class="feature">Rastrear pagos y deudas con historial completo</div>
      <div class="feature">Ver métricas en tiempo real de tus finanzas</div>
      <div class="feature">Usar nuestro asistente AI para análisis inteligente</div>
      <div class="feature">Filtrar y buscar deudores rápidamente</div>
    </div>

    <p style="margin-top: 30px;"><strong>¿Necesitas ayuda?</strong></p>
    <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.</p>

    <div class="footer">
      <p>© 2024 DebtTracker - Gestión de Deudas</p>
      <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
```

3. Usa las mismas credenciales de Gmail

### Paso 5: Success Response

1. Conecta Gmail a **"Respond to Webhook"**
2. Configura:
   ```json
   {
     "success": true,
     "message": "Email de bienvenida enviado",
     "email": "={{ $json.email }}"
   }
   ```

### Paso 6: Error Response

1. Desde FALSE del IF, agrega **"Respond to Webhook"**
2. Configura:
   - Response Code: 400
   ```json
   {
     "success": false,
     "error": "Datos de usuario incompletos"
   }
   ```

### Paso 7: Activar

1. Toggle **"Active"** ✅
2. **COPIA LA URL DEL WEBHOOK**

---

## 🔗 Actualizar URLs en el Código

Una vez tengas ambas URLs, actualiza el archivo:

**`src/context/auth-context.tsx`**

```typescript
// Reemplaza estas URLs con las URLs reales de tus webhooks
const N8N_PASSWORD_RESET_WEBHOOK = 'TU_URL_AQUI_PASSWORD_RESET';
const N8N_REGISTRATION_WEBHOOK = 'TU_URL_AQUI_REGISTRATION';
```

---

## 🧪 Probar los Workflows

### En n8n (Test Mode)

1. Abre el workflow
2. Click en "Webhook" node
3. Click "Listen for Test Event"
4. Usa el botón "Execute" para simular

### Desde Terminal

```bash
# Test Password Reset
curl -X POST TU_URL_PASSWORD_RESET \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","timestamp":"2024-12-13T20:00:00Z"}'

# Test Registration
curl -X POST TU_URL_REGISTRATION \
  -H "Content-Type: application/json" \
  -d '{"uid":"test123","email":"test@test.com","createdAt":"2024-12-13T20:00:00Z"}'
```

---

## ✅ Checklist Final

- [ ] Workflow 1 creado y activo
- [ ] Workflow 2 creado y activo
- [ ] Gmail OAuth configurado
- [ ] URLs de webhooks copiadas
- [ ] URLs actualizadas en el código
- [ ] Probado con curl
- [ ] Probado desde la app

---

## 🆘 ¿Problemas?

**Error de Gmail OAuth**:
- Ve a Google Cloud Console
- Habilita Gmail API
- Crea credenciales OAuth2
- Agrega URL redirect de n8n

**Webhook no responde**:
- Verifica que el workflow esté ACTIVO (verde)
- Copia la URL exacta del nodo Webhook
- Prueba con curl primero

**Email no llega**:
- Revisa spam
- Verifica credenciales Gmail en n8n
- Mira los logs de ejecución en n8n

---

## 📸 Screenshots de Referencia

Los workflows deberían verse así:

### Password Reset:
```
[Webhook] → [IF] → [Gmail] → [Success Response]
                 ↘ [Error Response]
```

### Registration:
```
[Webhook] → [IF] → [Gmail] → [Success Response]
                 ↘ [Error Response]
```

---

🎉 **¡Listo! Una vez creados, los workflows estarán completamente funcionales.**
