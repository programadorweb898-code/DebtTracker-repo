# 📧 N8N Workflows para DebtTracker

Este directorio contiene los workflows de n8n para automatizar el envío de correos electrónicos en DebtTracker.

## 📦 Workflows Incluidos

### 1. Password Reset Email (`password-reset-workflow.json`)
Envía un correo de confirmación cuando un usuario solicita recuperar su contraseña.

**Webhook URL**: `https://programmingweb.app.n8n.cloud/webhook/password-reset`

**Datos esperados:**
```json
{
  "email": "usuario@ejemplo.com",
  "timestamp": "2024-12-13T19:30:00.000Z"
}
```

### 2. User Registration Confirmation (`user-registration-workflow.json`)
Envía un correo de bienvenida cuando un nuevo usuario se registra.

**Webhook URL**: `https://programmingweb.app.n8n.cloud/webhook/user-registration`

**Datos esperados:**
```json
{
  "uid": "firebase-user-id",
  "email": "usuario@ejemplo.com",
  "createdAt": "2024-12-13T19:30:00.000Z"
}
```

---

## 🚀 Configuración en n8n

### Paso 1: Importar Workflows

1. Abre tu instancia de n8n: https://programmingweb.app.n8n.cloud
2. Click en **"Workflows"** → **"Add workflow"** → **"Import from file"**
3. Importa ambos archivos JSON:
   - `password-reset-workflow.json`
   - `user-registration-workflow.json`

### Paso 2: Configurar Credenciales de Gmail

Ambos workflows usan Gmail para enviar correos. Necesitas configurar OAuth2:

1. En n8n, ve a **"Credentials"** → **"Add credential"**
2. Busca **"Gmail OAuth2 API"**
3. Sigue estos pasos:

   **a. Crear proyecto en Google Cloud Console**
   - Ve a https://console.cloud.google.com/
   - Crea un nuevo proyecto o selecciona uno existente
   - Habilita la **Gmail API**

   **b. Configurar OAuth consent screen**
   - Ve a "APIs & Services" → "OAuth consent screen"
   - Tipo: External
   - Agrega tu email como usuario de prueba

   **c. Crear credenciales OAuth**
   - Ve a "Credentials" → "Create Credentials" → "OAuth client ID"
   - Tipo: Web application
   - Authorized redirect URIs: `https://programmingweb.app.n8n.cloud/rest/oauth2-credential/callback`
   - Copia el **Client ID** y **Client Secret**

   **d. En n8n**
   - Pega el Client ID y Client Secret
   - Click "Connect my account"
   - Autoriza el acceso a Gmail
   - Guarda las credenciales con un nombre como "Gmail - DebtTracker"

### Paso 3: Actualizar Credenciales en Workflows

1. Abre cada workflow importado
2. Click en el nodo **"Send Password Reset Email"** / **"Send Welcome Email"**
3. En la sección "Credentials", selecciona tus credenciales de Gmail configuradas
4. Guarda el workflow

### Paso 4: Activar Workflows

1. En cada workflow, click en el toggle de "Active" en la esquina superior derecha
2. Verifica que ambos workflows estén activos (color verde)

### Paso 5: Obtener URLs de Webhook

1. Abre cada workflow
2. Click en el nodo **"Webhook"**
3. En "Webhook URLs", copia la URL de producción
4. **IMPORTANTE**: Actualiza estas URLs en tu código:

**En `src/context/auth-context.tsx`**:
```typescript
// Reemplaza estas URLs con las URLs reales de tus webhooks
const N8N_PASSWORD_RESET_WEBHOOK = 'TU_URL_WEBHOOK_PASSWORD_RESET';
const N8N_REGISTRATION_WEBHOOK = 'TU_URL_WEBHOOK_REGISTRATION';
```

---

## 🧪 Probar los Workflows

### Probar Password Reset

**Usando curl:**
```bash
curl -X POST https://programmingweb.app.n8n.cloud/webhook/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "timestamp": "2024-12-13T19:30:00.000Z"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Email de recuperación enviado exitosamente",
  "email": "test@ejemplo.com"
}
```

### Probar User Registration

**Usando curl:**
```bash
curl -X POST https://programmingweb.app.n8n.cloud/webhook/user-registration \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "test-user-123",
    "email": "test@ejemplo.com",
    "createdAt": "2024-12-13T19:30:00.000Z"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Email de bienvenida enviado exitosamente",
  "email": "test@ejemplo.com"
}
```

---

## 🎨 Personalizar los Correos

### Modificar el Diseño

Los correos usan HTML inline con estilos CSS. Para personalizarlos:

1. Abre el workflow en n8n
2. Click en el nodo "Send ... Email"
3. Edita el campo "Message" con tu HTML personalizado
4. Usa las variables de n8n: `={{ $json.nombreCampo }}`

### Colores del Tema DebtTracker

```css
Primary: #A0C4FF (Azul suave)
Background: #F0F8FF (Azul muy claro)
Accent: #BDB2FF (Púrpura suave)
Text: #333 (Gris oscuro)
Secondary Text: #666 (Gris medio)
```

---

## 🔍 Debugging

### Ver Ejecuciones

1. En n8n, ve a **"Executions"**
2. Busca las ejecuciones de tus workflows
3. Click en una ejecución para ver detalles
4. Revisa los datos de entrada/salida de cada nodo

### Errores Comunes

**1. "Gmail OAuth error"**
- Solución: Revisa que hayas autorizado Gmail correctamente
- Verifica que el email usado en OAuth sea el mismo que envía correos

**2. "Webhook not found"**
- Solución: Verifica que el workflow esté ACTIVO
- Copia la URL del webhook directamente desde n8n

**3. "Email not sent"**
- Solución: Revisa los logs de ejecución en n8n
- Verifica que tu cuenta de Gmail no tenga límites de envío
- Confirma que las credenciales no hayan expirado

**4. "Connection timeout"**
- Solución: Verifica que tu instancia de n8n esté corriendo
- Revisa la configuración de red/firewall

---

## 📊 Flujo de Funcionamiento

### Password Reset
```
Usuario → App (solicita reset) 
  ↓
Auth Context → Valida email en Firebase
  ↓
Auth Context → POST a n8n webhook
  ↓
n8n → Valida datos
  ↓
n8n → Envía email de confirmación vía Gmail
  ↓
Auth Context → Envía email de Firebase (con link)
  ↓
Usuario → Recibe 2 emails (confirmación + link)
```

### User Registration
```
Usuario → App (se registra)
  ↓
Auth Context → Crea usuario en Firebase
  ↓
Auth Context → POST a n8n webhook
  ↓
n8n → Valida datos
  ↓
n8n → Envía email de bienvenida vía Gmail
  ↓
Usuario → Recibe email de bienvenida
```

---

## 🔐 Seguridad

- ✅ Los webhooks son públicos pero solo aceptan POST
- ✅ n8n valida los datos antes de procesar
- ✅ Las credenciales de Gmail están encriptadas en n8n
- ⚠️ No expongas las URLs de webhook públicamente
- ⚠️ Considera agregar autenticación básica a los webhooks

---

## 📝 Notas Importantes

- Los correos se envían en segundo plano, no bloquean el registro/login
- Si n8n falla, el registro/login sigue funcionando (fail-safe)
- Los webhooks devuelven respuestas JSON para logging
- Puedes agregar más nodos (Slack, Discord, etc.) a los workflows

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs de ejecución en n8n
2. Verifica las credenciales de Gmail
3. Comprueba que los webhooks estén activos
4. Revisa la consola del navegador para errores

---

## 📚 Recursos

- [Documentación de n8n](https://docs.n8n.io/)
- [Gmail API Limits](https://developers.google.com/gmail/api/reference/quota)
- [n8n Webhook Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [n8n Gmail Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/)
