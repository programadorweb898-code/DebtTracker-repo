# 💰 DebtTracker

Una aplicación moderna y eficiente para gestionar y rastrear deudas, construida con Next.js 15, Firebase y AI.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Firebase](https://img.shields.io/badge/Firebase-10-orange)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

## ✨ Características

- 📝 **Gestión de Deudores**: Registra, actualiza y elimina deudores fácilmente
- 💸 **Historial de Transacciones**: Rastrea deudas y pagos con fechas
- 🔍 **Filtros Avanzados**: Busca por nombre, monto y rango de deuda
- 📊 **Métricas en Tiempo Real**: Total de deudores y deuda acumulada
- 🤖 **Asistente AI**: Chat inteligente con Google Gemini para análisis financiero
- 🔐 **Autenticación Segura**: Login, registro y recuperación de contraseña
- 🎨 **UI Moderna**: Interfaz limpia con shadcn/ui y Tailwind CSS

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm o pnpm
- Cuenta de Firebase

### Instalación

```bash
# Clonar repositorio
git clone <tu-repo>
cd DebtTracker-repo

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Firebase y Gemini

# Iniciar en desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:9002`

## 🔑 Variables de Entorno

Crea un archivo `.env` en la raíz con:

```env
GEMINI_API_KEY=tu_api_key_gemini
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

## 🧪 Testing

### Crear Usuario de Prueba

**Opción 1: Registro en la app**
1. Ve a `/register`
2. Usa cualquier email válido
3. Contraseña mínimo 6 caracteres

**Opción 2: Firebase Console**
1. Firebase Console → Authentication → Users
2. Add user manualmente

### Usuarios Sugeridos
```
test@debttracker.com / test123456
demo@example.com / demo123456
```

## 📦 Scripts

```bash
npm run dev          # Desarrollo (puerto 9002)
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run typecheck    # Verificación de tipos
```

## 🏗️ Estructura del Proyecto

```
src/
├── app/              # Pages de Next.js
├── components/       # Componentes React
├── context/          # Context providers (Auth, etc)
├── firebase/         # Configuración de Firebase
├── ai/               # Flows de Genkit AI
│   ├── genkit.ts
│   └── flows/
├── hooks/            # Custom hooks
└── lib/              # Utilidades y tipos
```

## 🗄️ Base de Datos

### Firestore Collections

**users/**
```typescript
{
  uid: string;
  email: string;
  createdAt: string;
}
```

**debtors/**
```typescript
{
  id: string;
  alias: string;
  totalDebt: number;
  ownerUid: string;
  debts: Array<{
    id: string;
    amount: number;  // Positivo = deuda, Negativo = pago
    date: string;
  }>;
}
```

## 🚢 Deployment

### Render

1. **Configurar variables de entorno** en Render Dashboard
2. **Build command**: `npm install && npm run build`
3. **Start command**: `npm start`
4. **Agregar todas las variables de `.env`**

Ver `render.yaml` para configuración automática.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Documentación Completa

Ver [DOCUMENTATION.md](./docs/DOCUMENTATION.md) para:
- Guía detallada de autenticación
- Estructura de base de datos
- Reglas de seguridad de Firestore
- Problemas resueltos
- Tips de desarrollo

## 🐛 Problemas Conocidos

Ver [Issues](../../issues) para reportar bugs o solicitar features.

## 📄 Licencia

Este proyecto es privado y está en desarrollo activo.

## 👨‍💻 Autor

Desarrollado con ❤️ para gestionar deudas de forma eficiente.

---

**Nota**: Este README se actualiza constantemente. Consulta la documentación completa para más detalles.
