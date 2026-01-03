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

# Build de Next.js en modo standalone
RUN npm run build

# Exponer el puerto (Render asigna uno dinámico en $PORT)
EXPOSE 3000

# Comando de arranque: standalone server
CMD ["node", ".next/standalone/server.js"]
