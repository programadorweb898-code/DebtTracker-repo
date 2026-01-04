#!/bin/sh

# Script de inicio para Next.js Standalone en Render

# Render asigna el puerto dinámicamente via $PORT
export PORT=${PORT:-3000}
export HOSTNAME="0.0.0.0"
export NODE_ENV=production

echo "=================================="
echo "🚀 DebtTracker Server Starting"
echo "=================================="
echo "📍 Hostname: $HOSTNAME"
echo "🔌 Port: $PORT"
echo "🔧 Node: $(node --version)"
echo "📁 Working directory: $(pwd)"
echo "=================================="

# Listar archivos para debug
echo "📂 Files in current directory:"
ls -la

# Verificar que server.js existe
if [ ! -f "server.js" ]; then
    echo "❌ ERROR: server.js not found!"
    echo "📂 Contents of $(pwd):"
    find . -name "server.js" -o -name "Server.js"
    exit 1
fi

echo "✅ server.js found"
echo "🚀 Starting server..."
echo "=================================="

# Iniciar el servidor Next.js con output visible
node server.js
