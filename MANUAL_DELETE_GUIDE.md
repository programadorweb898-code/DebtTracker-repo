# 📖 Método Manual para Eliminar Usuarios Completamente

Esta guía explica cómo eliminar usuarios completamente (Firestore + Authentication) usando el método manual sin Firebase Admin SDK.

---

## 🎯 ¿Cuándo usar este método?

- ✅ No quieres configurar Firebase Admin SDK
- ✅ Prefieres más seguridad (sin credenciales sensibles)
- ✅ Estás en producción
- ✅ Solo eliminas usuarios ocasionalmente

---

## 📝 Proceso Completo Paso a Paso

### **Paso 1: Eliminar desde el Panel de Admin**

1. **Abre tu panel de admin:**
   ```
   http://localhost:9002/admin
   ```
   (o la URL de tu deployment)

2. **Ve a la pestaña "Usuarios"**

3. **Localiza el usuario** que quieres eliminar en la tabla

4. **Click en el botón rojo** 🗑️ (Eliminar) a la derecha del usuario

5. **Confirma la eliminación** en el diálogo que aparece

### **Paso 2: Datos de Firestore Eliminados ✅**

Cuando confirmes, automáticamente se eliminan:
- ✅ Documento del usuario en `/users`
- ✅ Todos los deudores del usuario en `/debtors`

Verás un mensaje confirmando esto.

### **Paso 3: Modal con Instrucciones**

Aparecerá un **modal elegante** con toda la información que necesitas:

#### **Información Disponible:**
- **Email del usuario** - con botón para copiar 📋
- **UID del usuario** - con botón para copiar 📋

#### **5 Pasos Numerados:**

```
1️⃣ Abre Firebase Console
   └─ Botón directo: "Abrir Firebase Console" 🔗

2️⃣ Navega a Authentication
   └─ En el menú lateral: Authentication → Users

3️⃣ Busca el usuario
   └─ Usa el email mostrado en el modal

4️⃣ Elimina la cuenta
   └─ Click en ⋮ (tres puntos) → Delete account

5️⃣ Confirma la eliminación
   └─ Click en "Delete"
```

### **Paso 4: Eliminar de Firebase Console**

1. **Click en "Abrir Firebase Console"** (se abre en nueva pestaña)

2. **Inicia sesión** en Firebase (si no lo estás)

3. **Selecciona tu proyecto:**
   - `studio-6887300440-a8a65`

4. **Ve a Authentication:**
   - Menú lateral → **Authentication**
   - Pestaña **Users**

5. **Busca el usuario:**
   - Usa la barra de búsqueda
   - Pega el email que copiaste del modal
   - O busca manualmente en la lista

6. **Elimina la cuenta:**
   - Localiza al usuario en la lista
   - A la derecha verás **⋮** (tres puntos verticales)
   - Click en **⋮**
   - Selecciona **"Delete account"**

7. **Confirma:**
   - Aparecerá un diálogo de confirmación
   - Click en **"Delete"**
   - ✅ Usuario eliminado completamente

### **Paso 5: Verificar**

Para confirmar que todo se eliminó correctamente:

1. **En Firebase Console - Authentication:**
   - Busca el email del usuario
   - No debería aparecer ✅

2. **En Firebase Console - Firestore:**
   - Ve a la colección `users`
   - Busca por UID
   - No debería existir ✅

3. **En tu Panel de Admin:**
   - Recarga la página
   - El usuario no debe aparecer en la lista ✅

---

## ⏱️ Tiempo Estimado

- **Todo el proceso:** 30-60 segundos
- **Paso 1-3 (tu panel):** 10 segundos
- **Paso 4 (Firebase Console):** 20-50 segundos

---

## 🎨 Capturas de Pantalla Conceptuales

### **Modal en tu Panel de Admin:**
```
┌─────────────────────────────────────────────┐
│  ⚠️ Acción Manual Requerida                 │
├─────────────────────────────────────────────┤
│  Email: user@example.com          [📋]     │
│  UID: abc123xyz...                 [📋]     │
│                                             │
│  Pasos para eliminar:                       │
│                                             │
│  1️⃣ Abre Firebase Console [🔗 Abrir]       │
│  2️⃣ Navega a Authentication → Users        │
│  3️⃣ Busca: user@example.com                │
│  4️⃣ Click en ⋮ → Delete account            │
│  5️⃣ Confirma la eliminación                 │
│                                             │
│                         [Entendido]         │
└─────────────────────────────────────────────┘
```

### **Firebase Console - Authentication:**
```
┌─────────────────────────────────────────────┐
│  Authentication                             │
├─────────────────────────────────────────────┤
│  [🔍 Search]                                │
│                                             │
│  Email                Created       ⋮       │
│  ─────────────────────────────────────────  │
│  user@example.com     Dec 28       ⋮       │
│                                     │       │
│                                     ▼       │
│                             [Delete account]│
└─────────────────────────────────────────────┘
```

---

## 💡 Tips y Trucos

### **Copiar Email/UID Rápidamente:**
- El modal tiene botones 📋 junto al email y UID
- Un click y está copiado
- Pégalo directamente en Firebase Console

### **Mantener el Modal Abierto:**
- No lo cierres hasta terminar
- Puedes cambiar de pestaña
- El modal seguirá ahí cuando vuelvas

### **Buscar Rápido en Firebase:**
- Usa `Ctrl + F` (o `Cmd + F` en Mac) en la página
- Pega el email
- Te lleva directo al usuario

### **Verificar Antes de Eliminar:**
- Confirma que es el usuario correcto
- Revisa el email cuidadosamente
- La eliminación NO se puede deshacer

---

## ❓ Preguntas Frecuentes

### **P: ¿Por qué no se elimina automáticamente?**
R: Para eliminar de Authentication automáticamente necesitas Firebase Admin SDK. El método manual es más seguro y no requiere credenciales sensibles.

### **P: ¿Qué pasa si no elimino de Authentication?**
R: El usuario seguirá pudiendo intentar iniciar sesión, pero como no está en Firestore, verá "Credenciales incorrectas" y no podrá acceder.

### **P: ¿Puedo eliminar varios usuarios a la vez?**
R: Sí, repite el proceso para cada usuario. En Firebase Console no hay eliminación masiva por seguridad.

### **P: ¿Se puede recuperar un usuario eliminado?**
R: No, la eliminación es permanente. Asegúrate antes de confirmar.

### **P: ¿El usuario puede registrarse de nuevo con el mismo email?**
R: Sí, una vez eliminado completamente, el email queda disponible para registro.

---

## 🔄 Alternativa: Firebase Admin SDK (Automático)

Si prefieres que todo sea automático, puedes configurar Firebase Admin SDK:

**Ventajas:**
- ✅ Un solo click, todo se elimina
- ✅ No necesitas ir a Firebase Console
- ✅ Más rápido para muchos usuarios

**Desventajas:**
- ⚠️ Requiere configurar credenciales sensibles
- ⚠️ No recomendado para producción sin medidas de seguridad

**Guía:** Ver `FIREBASE_ADMIN_SETUP.md`

---

## 📊 Comparación

| Aspecto | Método Manual | Firebase Admin SDK |
|---------|---------------|-------------------|
| **Tiempo por usuario** | 30-60 seg | 5 seg |
| **Seguridad** | ✅ Alta | ⚠️ Requiere cuidado |
| **Configuración** | ✅ Ninguna | ⚠️ 5-10 min |
| **Recomendado para** | Producción | Desarrollo |
| **Costo** | Gratis | Gratis |

---

## ✅ Checklist de Eliminación

Use esta lista cada vez que elimine un usuario:

- [ ] Usuario eliminado del panel de admin
- [ ] Modal de instrucciones leído
- [ ] Email/UID copiados
- [ ] Firebase Console abierto
- [ ] Usuario encontrado en Authentication
- [ ] Cuenta eliminada de Authentication
- [ ] Verificado que no aparece en Authentication
- [ ] Verificado que no aparece en Firestore
- [ ] Verificado que no aparece en el panel de admin

---

## 🎓 Conclusión

El método manual es:
- ✅ Seguro
- ✅ Confiable
- ✅ Fácil de seguir
- ✅ No requiere configuración adicional

Solo toma 30-60 segundos por usuario y garantiza una eliminación completa y segura.

Para uso frecuente o con muchos usuarios, considera configurar Firebase Admin SDK.
