# 🔐 Configuración de Administrador - DebtTracker

## 📧 Emails Configurados

### 1. **Email de Contacto/Notificaciones** (`NEXT_PUBLIC_ADMIN_EMAIL`)
- **Email**: `gomito724@gmail.com`
- **Propósito**: 
  - Recibir notificaciones del sistema
  - Email de contacto para usuarios
  - Notificaciones de n8n (registro de usuarios, recuperación de contraseña, etc.)
- **Acceso al Panel Admin**: ❌ NO (es usuario común)

### 2. **Email del Panel de Administración** (`NEXT_PUBLIC_ADMIN_PANEL_EMAIL`)
- **Email**: `admin@debttracker.local`
- **Propósito**: 
  - Acceso exclusivo al panel de administración (`/admin`)
  - Gestión de usuarios
  - Visualización de estadísticas del sistema
- **Acceso al Panel Admin**: ✅ SÍ

---

## 🚀 Configuración Inicial del Administrador

### Paso 1: Crear la cuenta de administrador del panel
1. Ve a `/register`
2. Crea una cuenta con:
   - **Email**: `admin@debttracker.local`
   - **Contraseña**: `admin` (o la que prefieras)

### Paso 2: Configurar el rol de administrador
1. Inicia sesión con `admin@debttracker.local`
2. Ve a `/setup-admin`
3. Haz clic en "Configurar Rol de Admin"
4. Una vez completado, ya tendrás acceso a `/admin`

### Paso 3: Verificar acceso
- Cierra sesión y vuelve a iniciar sesión con:
  - **Email**: `admin@debttracker.local`
  - **Contraseña**: `admin`
- Deberías ser redirigido automáticamente a `/admin`

---

## 👤 Uso de Cuentas

### Como Usuario Común (`gomito724@gmail.com`)
```
✅ Iniciar sesión normalmente
✅ Acceder a la aplicación principal (/)
✅ Gestionar tus propios deudores
❌ NO ver opción "Panel Admin" en el header
❌ NO acceder a /admin
❌ NO aparece el toast de sincronización al login
```

### Como Administrador del Panel (`admin@debttracker.local`)
```
✅ Al login con contraseña "admin" → redirige a /admin automáticamente
✅ Acceso completo al panel de administración
✅ Gestionar usuarios del sistema
✅ Ver estadísticas globales
✅ Eliminar usuarios
❌ NO puede acceder a la aplicación principal (/)
❌ NO tiene funcionalidad de usuario común
❌ NO puede crear deudores
❌ Si intenta acceder a /, será redirigido automáticamente a /admin
```

---

## 🔄 Flujo de Login según Contraseña

### Login Normal (cualquier contraseña excepto "admin")
```
Usuario introduce email + password
          ↓
    Autenticación Firebase
          ↓
    Redirige a "/"
```

### Login de Administrador (contraseña = "admin")
```
Usuario introduce email + password = "admin"
          ↓
    Autenticación Firebase
          ↓
    Detecta password === "admin"
          ↓
    Redirige a "/admin"
```

---

## ⚙️ Variables de Entorno

```env
# Email para notificaciones y contacto (usuario común en la app)
NEXT_PUBLIC_ADMIN_EMAIL=gomito724@gmail.com

# Email para acceso al panel de administración
NEXT_PUBLIC_ADMIN_PANEL_EMAIL=admin@debttracker.local
```

---

## 🛡️ Seguridad

### Recomendaciones:
1. **Contraseña fuerte**: Cambia "admin" por una contraseña más segura en producción
2. **Email real opcional**: Si necesitas recibir emails de recuperación en `admin@debttracker.local`, considera usar un email real
3. **Firestore Rules**: Asegúrate de que las reglas de Firestore protejan adecuadamente el acceso a datos sensibles

### Archivos Sensibles:
- `/setup-admin`: Solo necesario una vez. Puedes eliminarlo después de configurar el admin.
- `/admin`: Protegido por el hook `useIsAdmin()` que verifica el email

---

## 🔧 Modificaciones Realizadas

| Archivo | Descripción |
|---------|-------------|
| `.env` | Agregado `NEXT_PUBLIC_ADMIN_PANEL_EMAIL` |
| `src/hooks/use-admin.ts` | Modificado para usar `ADMIN_PANEL_EMAIL` |
| `src/app/login/page.tsx` | Redirige a `/admin` si password === "admin" |
| `src/app/page.tsx` | Deshabilitado toast de sincronización |
| `src/context/auth-context.tsx` | Removida redirección automática por email |
| `src/app/setup-admin/page.tsx` | Actualizado para usar `ADMIN_PANEL_EMAIL` |

---

## 📝 Notas Adicionales

- **gomito724@gmail.com** seguirá recibiendo todas las notificaciones del sistema (webhooks de n8n)
- **gomito724@gmail.com** puede usar la aplicación como cualquier usuario normal
- Solo **admin@debttracker.local** tiene acceso al panel de administración
- El sistema detecta automáticamente si la contraseña es "admin" para redirigir al panel

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo tener más de un administrador?**  
R: Sí, puedes agregar más emails en el hook `use-admin.ts` creando un array de emails permitidos.

**P: ¿Qué pasa si olvido la contraseña de admin@debttracker.local?**  
R: Puedes usar el flujo de recuperación de contraseña, pero como es un email no real, no recibirás el correo. Tendrías que resetear la contraseña directamente desde Firebase Console.

**P: ¿Por qué usar un email ficticio para el admin?**  
R: Para separar completamente la funcionalidad de administración del sistema de tu email personal/notificaciones.

**P: ¿Puedo cambiar el email de admin del panel?**  
R: Sí, solo modifica `NEXT_PUBLIC_ADMIN_PANEL_EMAIL` en `.env` y crea una cuenta con ese nuevo email.
