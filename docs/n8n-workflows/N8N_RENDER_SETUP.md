# 🔧 Configuración de n8n en Render - Checklist Completa

## ⚠️ Problema Actual

Tu n8n en Render está dando error 404, lo que indica:
- ❌ La URL podría estar incorrecta
- ❌ El servicio podría estar apagado
- ❌ La API no está habilitada

---

## ✅ Pasos para Arreglar

### 1. Verificar que n8n esté corriendo en Render

1. Ve a https://dashboard.render.com/
2. Busca tu servicio de n8n
3. Verifica que esté **"Live"** (verde)
4. Si está suspendido, haz click en **"Resume"**

### 2. Obtener la URL Correcta

En el dashboard de tu servicio n8n:
- Copia la URL que aparece arriba (ej: `https://n8n-xxxx.onrender.com`)
- Esta es tu URL REAL de n8n

### 3. Verificar Variables de Entorno

En tu servicio n8n en Render, verifica que tengas estas variables:

```bash
# ESENCIALES para que n8n funcione
WEBHOOK_URL=https://TU-N8N-URL.onrender.com
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https

# Para habilitar la API (IMPORTANTE)
N8N_API_ENABLED=true
N8N_API_KEY=tu_api_key_generada

# Para seguridad básica
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=tu_password

# Si usas PostgreSQL
DB_TYPE=postgresdb
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_HOST=dpg-xxxxx.postgres.render.com
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_USER=n8n_user
DB_POSTGRESDB_PASSWORD=password
DB_POSTGRESDB_SCHEMA=public

# Encryption key (genera una única)
N8N_ENCRYPTION_KEY=tu_encryption_key_unica_larga
```

### 4. Generar N8N_ENCRYPTION_KEY

Ejecuta en tu terminal:

```bash
openssl rand -hex 32
```

Copia el resultado y agrégalo como `N8N_ENCRYPTION_KEY`

### 5. Habilitar la API de n8n

**Opción A: Por Variables de Entorno (Recomendado)**

Agrega en Render:
```bash
N8N_API_ENABLED=true
N8N_API_KEY=genera_una_key_segura_aqui
```

**Opción B: Desde la Interfaz de n8n**

1. Accede a https://TU-N8N-URL.onrender.com
2. Login con tus credenciales
3. Ve a **Settings** → **API**
4. Habilita la API
5. Genera una API Key
6. Copia la key

### 6. Actualizar Configuración MCP de Claude

**Archivo**: `claude_desktop_config.json`

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://TU-N8N-URL.onrender.com",
        "N8N_API_KEY": "TU_API_KEY_REAL"
      }
    }
  }
}
```

**Reemplaza:**
- `TU-N8N-URL.onrender.com` → URL real de tu servicio
- `TU_API_KEY_REAL` → La API key generada

### 7. Verificar Dockerfile

Si tienes un Dockerfile en tu repo de n8n, asegúrate que tenga:

```dockerfile
FROM n8nio/n8n:latest

# Exponer puerto
EXPOSE 5678

# Variables de entorno base
ENV N8N_HOST=0.0.0.0
ENV N8N_PORT=5678
ENV N8N_PROTOCOL=https

# Comando de inicio
CMD ["n8n", "start"]
```

### 8. Verificar render.yaml (si lo usas)

```yaml
services:
  - type: web
    name: n8n
    env: docker
    plan: starter  # Mínimo starter para persistent disk
    autoDeploy: true
    healthCheckPath: /healthz
    disk:
      name: n8n-data
      mountPath: /home/node/.n8n
      sizeGB: 1
    envVars:
      - key: N8N_HOST
        value: 0.0.0.0
      - key: N8N_PORT
        value: 5678
      - key: N8N_PROTOCOL
        value: https
      - key: WEBHOOK_URL
        sync: false  # Configurar manualmente después del deploy
      - key: N8N_API_ENABLED
        value: true
      - key: N8N_API_KEY
        sync: false  # Configurar manualmente (secreto)
      - key: N8N_BASIC_AUTH_ACTIVE
        value: true
      - key: N8N_BASIC_AUTH_USER
        value: admin
      - key: N8N_BASIC_AUTH_PASSWORD
        sync: false  # Configurar manualmente (secreto)
      - key: N8N_ENCRYPTION_KEY
        sync: false  # Configurar manualmente (secreto)
      - key: DB_TYPE
        value: postgresdb
      - key: DB_POSTGRESDB_DATABASE
        fromDatabase:
          name: n8n-db
          property: database
      - key: DB_POSTGRESDB_HOST
        fromDatabase:
          name: n8n-db
          property: host
      - key: DB_POSTGRESDB_PORT
        fromDatabase:
          name: n8n-db
          property: port
      - key: DB_POSTGRESDB_USER
        fromDatabase:
          name: n8n-db
          property: user
      - key: DB_POSTGRESDB_PASSWORD
        fromDatabase:
          name: n8n-db
          property: password

databases:
  - name: n8n-db
    plan: free
    databaseName: n8n
```

---

## 🧪 Testing

### 1. Verificar que n8n esté accesible

```bash
curl https://TU-N8N-URL.onrender.com/healthz
```

Debería devolver algo como:
```json
{"status":"ok"}
```

### 2. Verificar la API

```bash
curl -H "X-N8N-API-KEY: TU_API_KEY" \
     https://TU-N8N-URL.onrender.com/api/v1/workflows
```

Debería devolver lista de workflows (o array vacío si no hay)

### 3. Probar desde Claude

Reinicia Claude Desktop y ejecuta:

```
¿Puedes verificar la conexión con n8n?
```

Debería conectarse correctamente.

---

## 🎯 Solución Rápida

Si quieres ir directo al grano:

1. **Ve a Render Dashboard**
2. **Encuentra tu servicio n8n**
3. **Copia la URL** (ej: `https://n8n-abc123.onrender.com`)
4. **Ve a Environment Variables**
5. **Agrega/verifica**:
   ```
   N8N_API_ENABLED=true
   N8N_API_KEY=cualquier_string_segura_123456
   WEBHOOK_URL=https://n8n-abc123.onrender.com
   ```
6. **Guarda y redeploy**
7. **Actualiza** `claude_desktop_config.json` con la URL y API key reales
8. **Reinicia Claude Desktop**

---

## 📸 URLs Importantes

- **n8n Dashboard**: `https://TU-URL.onrender.com`
- **API Endpoint**: `https://TU-URL.onrender.com/api/v1/`
- **Webhooks**: `https://TU-URL.onrender.com/webhook/`
- **Health Check**: `https://TU-URL.onrender.com/healthz`

---

## 🆘 Si sigue sin funcionar

**Opción 1: Crear workflows manualmente**

Sigue la guía en `MANUAL_SETUP_GUIDE.md` - Los workflows se pueden crear desde la interfaz web de n8n sin necesidad de la API.

**Opción 2: Usar plantillas JSON**

Importa los archivos:
- `password-reset-workflow.json`
- `user-registration-workflow.json`

Desde la interfaz de n8n: **Workflows → Import from File**

---

## ✅ Checklist Final

- [ ] n8n está corriendo en Render (verde)
- [ ] URL correcta copiada
- [ ] Variables de entorno configuradas
- [ ] API habilitada
- [ ] API Key generada
- [ ] Config MCP actualizada
- [ ] Claude Desktop reiniciado
- [ ] Conexión probada

---

## 💡 Tip Pro

Una vez que todo funcione, puedes crear los workflows desde Claude:

```
Crea el workflow de password reset en n8n
```

Y yo lo crearé automáticamente usando la API. 🚀
