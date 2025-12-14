# DebtTracker - Documentación Completa

## 📋 Información del Proyecto

**DebtTracker** es una aplicación web para gestionar y rastrear deudas de manera eficiente.

### Stack Tecnológico
- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Firebase (Auth + Firestore)
- **AI**: Google Gemini 2.5 Flash (via Genkit)
- **UI**: Tailwind CSS + shadcn/ui
- **Validación**: Zod + React Hook Form

---

## 🔐 Autenticación

### ✅ Funcionalidades Implementadas

1. **Registro de Usuario**
   - Email + contraseña
   - Validación de formato
   - Creación automática de perfil en Firestore

2. **Inicio de Sesión**
   - Email + contraseña
   - Manejo de errores personalizado

3. **✨ Recuperación de Contraseña (MEJORADO)**
   - ✅ Validación de email existente ANTES de enviar
   - ✅ Envío de enlace de recuperación por correo
   - ✅ Los campos NO se ponen rojos al cerrar el diálogo
   - ✅ Mensajes de error específicos:
     - "No se encontró ninguna cuenta registrada con este correo electrónico"
     - "El formato del correo electrónico no es válido"

### 🧪 Crear Usuario de Prueba

**Opción 1: Registro en la app**
1. Ve a `http://localhost:3000/register`
2. Ingresa un email válido
3. Contraseña mínimo 6 caracteres
4. El usuario se crea automáticamente en Firebase Auth + Firestore

**Opción 2: Firebase Console**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `studio-6887300440-a8a65`
3. Authentication → Users → Add user
4. Agrega email y contraseña

### 👤 Usuarios Sugeridos para Testing

```plaintext
Usuario 1:
Email: test@debttracker.com
Contraseña: test123456

Usuario 2:
Email: admin@debttracker.com  
Contraseña: admin123456

Usuario 3:
Email: demo@example.com
Contraseña: demo123456
```

> **⚠️ Nota**: Estos usuarios deben crearse manualmente en Firebase Console o mediante el registro en la app. No están pre-creados.

---

## 🗄️ Base de Datos (Firestore)

### Estructura de Colecciones

#### `users` (colección raíz)
```typescript
Document ID: {userId} (UID de Firebase Auth)
{
  uid: string;           // ID del usuario de Firebase Auth
  email: string;         // Email del usuario
  createdAt: string;     // Fecha ISO de creación (ej: "2024-12-13T10:30:00Z")
}
```

**Ejemplo:**
```json
{
  "uid": "m4b2wXC99BVgdEmY9UxZnTev4Rv2",
  "email": "test@debttracker.com",
  "createdAt": "2024-12-13T15:30:00.000Z"
}
```

#### `debtors` (colección raíz)
```typescript
Document ID: {debtorId} (generado automáticamente)
{
  id: string;            // ID único del deudor (igual al document ID)
  alias: string;         // Nombre/alias del deudor
  totalDebt: number;     // Deuda total actual (suma de todas las transacciones)
  ownerUid: string;      // UID del usuario propietario
  debts: Array<{
    id: string;          // ID único de la transacción
    amount: number;      // Monto (positivo = nueva deuda, negativo = pago)
    date: string;        // Fecha ISO de la transacción
  }>;
}
```

**Ejemplo:**
```json
{
  "id": "debtor123",
  "alias": "Juan Pérez",
  "totalDebt": 1500.50,
  "ownerUid": "m4b2wXC99BVgdEmY9UxZnTev4Rv2",
  "debts": [
    {
      "id": "debt001",
      "amount": 1000.00,
      "date": "2024-12-01T10:00:00Z"
    },
    {
      "id": "debt002",
      "amount": 800.50,
      "date": "2024-12-05T14:30:00Z"
    },
    {
      "id": "payment001",
      "amount": -300.00,
      "date": "2024-12-10T09:15:00Z"
    }
  ]
}
```

### 🔒 Reglas de Seguridad

Las reglas de Firestore garantizan que:
- ✅ Los usuarios solo pueden ver/editar SUS PROPIOS datos
- ✅ Cada deudor pertenece a UN SOLO usuario (campo `ownerUid`)
- ❌ No se puede listar todos los usuarios (privacidad)
- ✅ Los debtors se pueden listar solo del usuario autenticado

---

## 🚀 Variables de Entorno

### Desarrollo Local (`.env`)
```env
GEMINI_API_KEY=AIzaSyC6HpT-2i0OV3fkAltA_E7OkFlc2jK0OHI
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC5z1QDzTNQ2sgoD0P_h64iZFptbrMJuhc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-6887300440-a8a65.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-6887300440-a8a65
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-6887300440-a8a65.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=163910146095
NEXT_PUBLIC_FIREBASE_APP_ID=1:163910146095:web:9181898856b50e12514eda
```

### ⚠️ Para Producción (Render)
Agregar TODAS estas variables en el Dashboard de Render + `NODE_ENV=production`

---

## 🎨 Características Principales

### 1. Gestión de Deudores
- ➕ Registrar nuevo deudor con alias
- 💰 Agregar deuda a deudor existente
- 💵 Registrar pagos (montos negativos)
- 🗑️ Eliminar deudor cuando deuda = 0
- 📊 Ver historial completo de transacciones

### 2. Filtros y Búsqueda
- 🔍 Filtrar por nombre/alias
- 📈 Ordenar por monto (mayor a menor / menor a mayor)
- 📉 Filtrar por rango de deuda

### 3. Métricas Agregadas
- 👥 Número total de deudores
- 💸 Deuda total acumulada

### 4. Asistente AI (Gemini)
- 💬 Chat contextual sobre deudores
- 📝 Resumen automático de situación financiera
- 🧠 Análisis de patrones de deuda

---

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor en puerto 9002

# Producción
npm run build           # Construye para producción
npm run start           # Inicia servidor de producción

# AI Development
npm run genkit:dev      # Inicia Genkit en modo desarrollo
npm run genkit:watch    # Genkit con recarga automática

# Otros
npm run lint            # Verifica código con ESLint
npm run typecheck       # Verifica tipos de TypeScript
```

---

## 🐛 Problemas Resueltos

### ✅ Recuperación de Contraseña
**Problema anterior:**
- Los campos se ponían rojos al cerrar el diálogo
- No validaba si el email existía antes de enviar

**Solución implementada:**
```typescript
// 1. Validación previa con fetchSignInMethodsForEmail
const signInMethods = await fetchSignInMethodsForEmail(auth, email);
if (signInMethods.length === 0) {
  throw new Error('No se encontró ninguna cuenta registrada...');
}

// 2. Limpieza de formulario al cerrar diálogo
const handleDialogClose = (open: boolean) => {
  if (!open) {
    forgotPasswordForm.reset();
    forgotPasswordForm.clearErrors(); // ← Esto evita campos rojos
  }
};
```

---

## 📞 Soporte

Para reportar bugs o solicitar features, contacta al desarrollador del proyecto.

---

## 📄 Licencia

Este proyecto es parte de un desarrollo privado.
