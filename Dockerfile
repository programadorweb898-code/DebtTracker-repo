# Imagen base oficial de Node.js
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y lock primero para aprovechar cache
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Declarar las variables de entorno como ARG para que estén disponibles durante el build
# Next.js necesita NEXT_PUBLIC_* en build-time
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_WEBHOOK_URL
ARG NEXT_PUBLIC_ADMIN_EMAIL
ARG NEXT_PUBLIC_ADMIN_PANEL_EMAIL
ARG GEMINI_API_KEY
ARG RENDER_API_KEY
ARG FIREBASE_SERVICE_ACCOUNT_KEY

# Convertir ARG a ENV para que estén disponibles en runtime también
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_WEBHOOK_URL=$NEXT_PUBLIC_WEBHOOK_URL
ENV NEXT_PUBLIC_ADMIN_EMAIL=$NEXT_PUBLIC_ADMIN_EMAIL
ENV NEXT_PUBLIC_ADMIN_PANEL_EMAIL=$NEXT_PUBLIC_ADMIN_PANEL_EMAIL
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV RENDER_API_KEY=$RENDER_API_KEY
ENV FIREBASE_SERVICE_ACCOUNT_KEY=$FIREBASE_SERVICE_ACCOUNT_KEY

# Build de Next.js en modo standalone
RUN npm run build

# Next.js standalone requiere copiar public y .next/static
# Copiar recursivamente si existen, ignorar errores si no existen
RUN mkdir -p .next/standalone/public .next/standalone/.next/static
RUN cp -r public/* .next/standalone/public/ 2>/dev/null || true
RUN cp -r .next/static/* .next/standalone/.next/static/ 2>/dev/null || true

# Cambiar al directorio standalone para ejecutar
WORKDIR /app/.next/standalone

# Exponer el puerto (Render asigna uno dinámico en $PORT)
EXPOSE 3000

# En Docker, server.js está directamente en .next/standalone/
# No en subdirectorios como en local
CMD ["node", "server.js"]
