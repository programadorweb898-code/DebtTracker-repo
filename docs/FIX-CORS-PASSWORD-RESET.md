# Fix: Error "Failed to fetch" en Password Reset

## 🐛 Problema Original

Al enviar un email de recuperación de contraseña, se mostraba el error:
```
TypeError: Failed to fetch
at sendPasswordReset (src\context\auth-context.tsx:50:32)
```

**Causa**: Se intentaba hacer un fetch desde el **cliente (navegador)** al webhook de n8n en Render, lo que generaba un error de CORS (Cross-Origin Resource Sharing) porque:
1. Los navegadores bloquean peticiones cross-origin por defecto
2. El webhook de n8n no tenía configurados los headers CORS necesarios
3. El contexto estaba marcado como `"use client"`, ejecutándose en el navegador

## ✅ Solución Implementada

### Arquitectura Anterior (❌ Con problema CORS)
```
Browser → auth-context.tsx → n8n Webhook (https://render-repo-36pu.onrender.com)
          ❌ CORS Block
```

### Arquitectura Nueva (✅ Sin CORS)
```
Browser → auth-context.tsx → API Route (/api/password-reset) → n8n Webhook
                              ✅ Server-side (Next.js)
```

## 📁 Archivos Creados

### 1. `/src/app/api/password-reset/route.ts`
API Route para manejar el webhook de reset de contraseña desde el servidor.

**Características:**
- ✅ Se ejecuta en el servidor (sin problemas de CORS)
- ✅ Valida que el email esté presente
- ✅ Retorna 200 incluso si n8n falla (no es crítico)
- ✅ Logs claros para debugging

### 2. `/src/app/api/user-registration/route.ts`
API Route para manejar el webhook de registro de usuario desde el servidor.

**Características:**
- ✅ Misma arquitectura que password-reset
- ✅ Valida uid y email
- ✅ No bloquea el registro si falla

## 🔄 Archivos Modificados

### `/src/context/auth-context.tsx`

**Cambios:**
1. ❌ Eliminado: `const N8N_PASSWORD_RESET_WEBHOOK`
2. ❌ Eliminado: `const N8N_REGISTRATION_WEBHOOK`
3. ✅ Agregado: Fetch a `/api/password-reset` (local)
4. ✅ Agregado: Fetch a `/api/user-registration` (local)

**Antes:**
```typescript
const response = await fetch(N8N_PASSWORD_RESET_WEBHOOK, {
  method: 'POST',
  // ...
});
```

**Después:**
```typescript
const response = await fetch('/api/password-reset', {
  method: 'POST',
  // ...
});
```

## 🎯 Beneficios

1. **Sin CORS**: Las peticiones van al mismo dominio (`/api/*`)
2. **Seguridad**: Las URLs de n8n no se exponen al cliente
3. **Server-side**: Mejor control y logging
4. **Mantenibilidad**: URLs centralizadas en API routes
5. **Escalabilidad**: Fácil agregar más webhooks siguiendo el mismo patrón

## 🧪 Testing

Para probar el fix:

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Ve a `/login` o `/reset-password`

3. Ingresa un email y solicita reset de contraseña

4. **Resultado esperado:**
   - ✅ Email de Firebase se envía correctamente
   - ✅ No aparece error "Failed to fetch"
   - ✅ Notificación a n8n se envía desde el servidor
   - ✅ Logs en consola del servidor (no del navegador)

## 📊 Logs Esperados

**En la consola del servidor (terminal):**
```bash
🔍 Validando email: usuario@example.com
✅ Email de Firebase enviado (enlace por defecto).
✅ Email de confirmación (n8n) enviado desde el servidor
```

**Si n8n falla (no crítico):**
```bash
⚠️ n8n webhook falló, pero el reset de Firebase se envió
⚠️ Error en n8n (no crítico): [error details]
```

## 🚀 Deploy

**Importante**: No se requiere configuración adicional en Render. Las API routes funcionan automáticamente con:
```javascript
output: 'standalone'  // Ya configurado en next.config.mjs
```

## 📝 Notas Adicionales

- Los webhooks de n8n siguen funcionando igual
- Si n8n falla, el flujo principal (Firebase email) NO se ve afectado
- Las API routes están disponibles en: `http://localhost:9002/api/password-reset`
- En producción: `https://tu-dominio.com/api/password-reset`

---

**Fecha de implementación**: 2024-12-21
**Desarrollador**: Claude + Usuario
**Estado**: ✅ Implementado y listo para testing
