# Panel de Administración - DebtTracker

## Acceso

El panel de administración está disponible solo para el email configurado como administrador en las variables de entorno.

### Configuración

En tu archivo `.env`:
```
NEXT_PUBLIC_ADMIN_EMAIL=gomito724@gmail.com
```

### Acceder al Panel

1. **Iniciar sesión** con tu cuenta de administrador (gomito724@gmail.com)
2. Click en el **icono de menú** (LogOut) en la esquina superior derecha
3. Selecciona **"Panel Admin"**
4. O navega directamente a: `/admin`

## Características del Panel

### 📊 Vista de Resumen (Overview)
- **Tarjetas de estadísticas:**
  - Total de usuarios registrados
  - Total de deudores en el sistema
  - Deuda total acumulada
  - Promedio de deuda por usuario
- **Información del sistema**
- **Acciones rápidas**

### 👥 Gestión de Usuarios
- **Tabla completa** con todos los usuarios registrados
- **Columnas:**
  - Email del usuario
  - Fecha y hora de registro
  - Número de deudores
  - Deuda total del usuario
  - Acciones (Ver detalles / Eliminar)

### 🔍 Detalles de Usuario
Al hacer click en "Ver" (ícono de ojo) en cualquier usuario:

- **Información general:**
  - Email
  - UID de Firebase
  - Fecha exacta de registro
  - Total de deudores

- **Lista de deudores:**
  - Alias del deudor
  - Deuda total
  - Historial completo de transacciones:
    - Fecha y hora de cada transacción
    - Monto (positivo para deudas, negativo para pagos)
  - Vista detallada de cada movimiento

### 🗑️ Eliminación de Usuarios
- Click en el botón rojo de **Eliminar** (ícono de basurero)
- Confirmación antes de eliminar
- Elimina el documento de Firestore
- **Nota:** La cuenta de Firebase Auth debe eliminarse manualmente

## Seguridad

- ✅ Solo accesible por el email de administrador
- ✅ Redirección automática si no eres admin
- ✅ Verificación en el frontend y backend
- ✅ Toast de error si intentas acceder sin permisos

## UI/UX

### Diseño
- **Responsive:** Funciona en móvil, tablet y desktop
- **Dark mode compatible**
- **Tabs para navegación:** Resumen y Usuarios
- **Diálogos modales** para detalles y confirmaciones
- **Iconos intuitivos** de Lucide React

### Accesibilidad
- Botones con labels descriptivos
- Contrastes adecuados
- Navegación por teclado
- Loading states claros

### Componentes Reutilizables
- `AdminStatsCards`: Tarjetas de estadísticas
- `UsersTable`: Tabla de usuarios con acciones
- `use-admin`: Hook para verificar permisos de admin

## API Routes

### GET `/api/admin/users`
Obtiene todos los usuarios con sus deudores y estadísticas.

**Respuesta:**
```json
{
  "success": true,
  "users": [
    {
      "id": "doc_id",
      "uid": "firebase_uid",
      "email": "user@example.com",
      "createdAt": "2024-12-27T...",
      "debtors": [...],
      "totalDebtAmount": 1500,
      "debtorsCount": 3
    }
  ],
  "total": 5
}
```

### DELETE `/api/admin/users`
Elimina un usuario (solo Firestore, Auth manual).

**Body:**
```json
{
  "userId": "firebase_uid"
}
```

## Mejoras Futuras

- [ ] Eliminación completa con Firebase Admin SDK
- [ ] Exportar datos a CSV/Excel
- [ ] Filtros y búsqueda en la tabla
- [ ] Gráficos de tendencias
- [ ] Logs de actividad
- [ ] Roles de admin múltiples
- [ ] Notificaciones en tiempo real

## Desarrollo

### Agregar más admins
Modifica el hook `use-admin.ts`:
```typescript
const adminEmails = [
  'gomito724@gmail.com',
  'otro-admin@gmail.com'
];
return adminEmails.includes(user.email.toLowerCase());
```

### Personalizar estadísticas
Modifica `AdminStatsCards` para agregar más métricas.

### Agregar más acciones
Extiende `UsersTable` con botones adicionales.
