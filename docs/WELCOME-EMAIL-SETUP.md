# 📧 Email de Bienvenida - Estado Actual

## ✅ Cambios Aplicados

### 1. URL del Webhook Actualizada

**Archivo:** `/src/app/api/user-registration/route.ts`

**Cambio:**
```typescript
// ANTES
const N8N_REGISTRATION_WEBHOOK = 'https://render-repo-36pu.onrender.com/webhook/user-registration';

// AHORA
const N8N_REGISTRATION_WEBHOOK = 'https://render-repo-36pu.onrender.com/webhook/32e8ee1f-bcff-4c8d-8c64-1dca826b1d5c';
```

**Workflow URL:** https://render-repo-36pu.onrender.com/workflow/Rxxrh7r1L6aSD9Jb/dd8e6a

---

## 📊 Datos que se Envían al Webhook

Cuando un usuario se registra exitosamente, tu app envía:

```json
{
  "uid": "abc123xyz456",
  "email": "usuario@ejemplo.com",
  "createdAt": "2024-12-21T15:30:00.000Z"
}
```

**Estos datos están disponibles en n8n como:**
- `{{ $json.body.uid }}`
- `{{ $json.body.email }}`
- `{{ $json.body.createdAt }}`

---

## 🔄 Flujo Actual de Registro

```
Usuario completa formulario (/register)
        ↓
Firebase crea cuenta ✅
        ↓
Firestore guarda perfil ✅
        ↓
[auth-context.tsx] Llama a /api/user-registration
        ↓
[API Route] Envía POST al webhook de n8n
        ↓
n8n recibe datos en el webhook
        ↓
[TU WORKFLOW EN n8n] → Envía email de bienvenida 📧
        ↓
Usuario ve toast "¡Registro exitoso!"
        ↓
Usuario es redirigido a /login
```

---

## 🧪 Cómo Probar (Paso a Paso)

### Opción 1: Prueba Rápida con Postman/cURL

**1. Asegúrate de que n8n esté despierto:**
Abre: https://render-repo-36pu.onrender.com/workflow/Rxxrh7r1L6aSD9Jb/dd8e6a

**2. Envía una petición POST:**
```bash
curl -X POST https://render-repo-36pu.onrender.com/webhook/32e8ee1f-bcff-4c8d-8c64-1dca826b1d5c \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "test123",
    "email": "TU-EMAIL-REAL@gmail.com",
    "createdAt": "2024-12-21T15:30:00.000Z"
  }'
```

**3. Espera 5-10 segundos**

**4. Revisa tu email** (incluye spam)

---

### Opción 2: Prueba Real Registrando un Usuario

**1. Reinicia tu servidor Next.js:**
```bash
# Ctrl+C para detener
npm run dev
```

**2. Ve a la página de registro:**
```
http://localhost:9002/register
```

**3. Completa el formulario:**
- **Email:** tu-email-real@gmail.com
- **Contraseña:** Test123!@#
- **Confirmar:** Test123!@#

**4. Haz clic en "Crear Cuenta"**

**5. Observa la consola del navegador (F12):**
```javascript
✅ Notificación de registro enviada desde el servidor
```

**6. Observa la terminal del servidor:**

**Si n8n está despierto:**
```bash
✅ n8n registration webhook ejecutado correctamente
POST /api/user-registration 200 in 234ms
```

**Si n8n está dormido (primera vez):**
```bash
⏱️ n8n registration webhook timeout (probablemente Render estaba dormido) - no crítico
POST /api/user-registration 200 in 10012ms
```

**7. Espera 1 minuto y registra otro usuario:**
Ahora debería funcionar porque n8n ya despertó.

**8. Revisa tu email en Gmail**

---

## 🎨 Template de Email Sugerido para n8n

Usa este HTML en el nodo "Send Email" de tu workflow:

**Subject:** `¡Bienvenido a DebtTracker! 🎉`

**To:** `{{ $json.body.email }}`

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            color: #667eea;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            color: #333;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        .emoji {
            font-size: 48px;
            text-align: center;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji">🎉</div>
        <div class="header">
            <h1>¡Felicidades!</h1>
        </div>
        <div class="content">
            <p>Hola,</p>
            <p><strong>¡Tu usuario en DebtTracker se ha creado correctamente!</strong></p>
            <p>Gracias por registrarte. Ahora puedes comenzar a gestionar tus deudas de manera eficiente y organizada.</p>
            
            <h3>¿Qué puedes hacer en DebtTracker?</h3>
            <ul>
                <li>📝 Registrar deudores y montos</li>
                <li>💸 Rastrear pagos y transacciones</li>
                <li>📊 Ver métricas en tiempo real</li>
                <li>🤖 Chatear con tu asistente financiero AI</li>
            </ul>
            
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            <p>¡Bienvenido a bordo! 🚀</p>
        </div>
        <div class="footer">
            <p><small>Este email fue enviado a: {{ $json.body.email }}</small></p>
            <p><small>© 2024 DebtTracker. Todos los derechos reservados.</small></p>
        </div>
    </div>
</body>
</html>
```

---

## 🔧 Configuración en n8n

### Estructura del Workflow (Mínimo)

```
[Webhook Trigger] → [Gmail / Send Email] → [Respond to Webhook]
```

### Nodo 1: Webhook

- **HTTP Method:** POST
- **Path:** Automático (ya lo tienes)
- **Response Mode:** "When Last Node Finishes"

### Nodo 2: Gmail (o tu servicio de email)

- **Operation:** Send Email
- **To:** `{{ $json.body.email }}`
- **Subject:** `¡Bienvenido a DebtTracker! 🎉`
- **Message (HTML):** [Usar template de arriba]

**Credenciales Gmail:**
1. Ve a: https://myaccount.google.com/apppasswords
2. Genera una contraseña de aplicación
3. Usa esa contraseña en n8n (NO tu contraseña normal)

### Nodo 3: Respond to Webhook

- **Status Code:** 200
- **Body:**
```json
{
  "success": true,
  "message": "Welcome email sent"
}
```

---

## ✅ Checklist de Verificación

Antes de probar:

- [ ] Workflow está **ACTIVE** en n8n (interruptor verde)
- [ ] Credenciales de Gmail configuradas en n8n
- [ ] URL del webhook correcta en tu código
- [ ] Servidor de Next.js reiniciado después de cambios
- [ ] n8n está despierto (abre el workflow primero)

---

## 🚨 Troubleshooting

### Si no llega el email:

1. **Verifica que el workflow se ejecutó:**
   - En n8n, ve a "Executions" (sidebar)
   - Busca ejecuciones recientes
   - Si hay error, click para ver detalles

2. **Revisa spam en Gmail**

3. **Verifica credenciales de Gmail:**
   - Usa App Password, no contraseña normal
   - Habilita "Less secure app access" si es necesario

4. **Verifica logs:**
   ```bash
   # En tu terminal del servidor
   ✅ n8n registration webhook ejecutado correctamente
   ```

### Si aparece timeout:

Es normal la primera vez (Render estaba dormido).
**Solución:** Espera 1 minuto y registra otro usuario.

---

## 📞 Próximos Pasos

1. ✅ Configurar el workflow en n8n siguiendo esta guía
2. ✅ Probar con Postman/cURL primero
3. ✅ Probar registrando un usuario real
4. ✅ Verificar que el email llegue correctamente
5. 🎨 Personalizar el diseño del email
6. 📊 (Opcional) Agregar más nodos para analytics/logging

---

**Fecha:** 2024-12-21
**Estado:** ✅ Código actualizado, listo para configurar n8n
**Siguiente:** Configurar workflow en n8n con el template de email
