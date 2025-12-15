# 🔧 Configuración de Nodos IF en n8n

## 📊 Estructura Visual de los Workflows

### Workflow 1: Password Reset Email

```
┌──────────────────┐
│  Webhook         │ Recibe: { email, timestamp }
│  POST /password- │
│  reset           │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  IF              │ Condición: email no está vacío
│  Validate Email  │ 
└────┬────────┬────┘
     │TRUE    │FALSE
     ▼        ▼
┌────────┐  ┌────────┐
│ Gmail  │  │ Error  │
│ Send   │  │ 400    │
└───┬────┘  └────────┘
    │
    ▼
┌────────┐
│Success │
│ 200    │
└────────┘
```

### Workflow 2: User Registration

```
┌──────────────────┐
│  Webhook         │ Recibe: { uid, email, createdAt }
│  POST /user-     │
│  registration    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  IF              │ Condición: email Y uid no vacíos
│  Validate Data   │ 
└────┬────────┬────┘
     │TRUE    │FALSE
     ▼        ▼
┌────────┐  ┌────────┐
│ Gmail  │  │ Error  │
│ Send   │  │ 400    │
└───┬────┘  └────────┘
    │
    ▼
┌────────┐
│Success │
│ 200    │
└────────┘
```

---

## ⚙️ Configuración del Nodo IF

### En n8n, cuando haces click en el nodo IF:

**Pestaña "Parameters":**

```
Conditions:
┌─────────────────────────────────────┐
│ ✓ All conditions have to be true   │ ← AND (todas las condiciones)
│ ○ At least one condition must...   │
└─────────────────────────────────────┘

Condition 1:
┌─────────────────────────────────────┐
│ Value 1: {{ $json.email }}          │
│ Operation: is not empty             │
└─────────────────────────────────────┘

[+ Add Condition] ← Para agregar más condiciones
```

---

## 🔗 Conexiones (Muy Importante)

### Cómo conectar los nodos:

1. **Webhook → IF:**
   - Desde el círculo de salida del Webhook
   - Hasta el círculo de entrada del IF

2. **IF → Gmail (TRUE):**
   - Desde el círculo **de ARRIBA** del IF (verde cuando pasa el test)
   - Hasta el círculo de entrada de Gmail

3. **IF → Error Response (FALSE):**
   - Desde el círculo **de ABAJO** del IF (rojo cuando falla)
   - Hasta el círculo de entrada de Error Response

4. **Gmail → Success Response:**
   - Desde Gmail hasta Success Response

---

## 🎯 Verificación Visual en n8n

Cuando abras el workflow en n8n, debes ver:

### Conexiones:
- Webhook tiene **1 línea** saliendo hacia IF
- IF tiene **2 líneas** saliendo:
  - Una hacia arriba (Gmail) - **TRUE**
  - Una hacia abajo (Error) - **FALSE**
- Gmail tiene **1 línea** hacia Success Response

### Colores (cuando ejecutas):
- Verde ✅ = Ejecutado correctamente
- Rojo ❌ = Error o no ejecutado
- Gris ⚪ = No alcanzado por el flujo

---

## 🧪 Probar el Nodo IF

### En n8n:

1. Abre el workflow
2. Click en el nodo **Webhook**
3. Click en **"Listen for Test Event"**
4. En otra pestaña/terminal ejecuta:

```bash
curl -X POST https://render-repo-36pu.onrender.com/webhook/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","timestamp":"2024-12-14T01:00:00Z"}'
```

5. En n8n verás:
   - ✅ Webhook recibe los datos
   - ✅ IF evalúa → TRUE (porque email no está vacío)
   - ✅ Gmail se ejecuta
   - ✅ Success Response devuelve 200

### Test con email vacío:

```bash
curl -X POST https://render-repo-36pu.onrender.com/webhook/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"","timestamp":"2024-12-14T01:00:00Z"}'
```

Verás:
- ✅ Webhook recibe
- ❌ IF evalúa → FALSE (email vacío)
- ❌ Gmail NO se ejecuta
- ✅ Error Response devuelve 400

---

## 🛠️ Si los nodos no están conectados correctamente

### En la interfaz de n8n:

1. Click en el workflow
2. Verifica visualmente las líneas entre nodos
3. Para conectar manualmente:
   - Hover sobre un nodo
   - Aparecen círculos en los bordes
   - Click y arrastra desde un círculo de salida
   - Hasta un círculo de entrada de otro nodo

4. Para el nodo IF:
   - El círculo de **ARRIBA** = TRUE
   - El círculo de **ABAJO** = FALSE

---

## ✅ Checklist de Configuración

### Password Reset Workflow:
- [ ] Webhook configurado con path "password-reset"
- [ ] IF tiene condición: `{{ $json.email }}` is not empty
- [ ] IF (TRUE) conectado a Gmail
- [ ] IF (FALSE) conectado a Error Response
- [ ] Gmail conectado a Success Response
- [ ] Gmail tiene credencial asignada
- [ ] Workflow está ACTIVE (verde)

### User Registration Workflow:
- [ ] Webhook configurado con path "user-registration"
- [ ] IF tiene 2 condiciones (AND):
  - `{{ $json.email }}` is not empty
  - `{{ $json.uid }}` is not empty
- [ ] IF (TRUE) conectado a Gmail
- [ ] IF (FALSE) conectado a Error Response
- [ ] Gmail conectado a Success Response
- [ ] Gmail tiene credencial asignada
- [ ] Workflow está ACTIVE (verde)

---

## 📸 Screenshot de Referencia

El nodo IF debe verse así:

```
┌─────────────────────────────────────┐
│ IF                                  │
│ ──────────────────────────────────  │
│                                     │
│ Mode: Conditions                    │
│                                     │
│ ☑ All conditions have to be true   │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Condition 1                     ││
│ │ Value 1: {{ $json.email }}      ││
│ │ Operation: is not empty         ││
│ └─────────────────────────────────┘│
│                                     │
│ [+ Add Condition]                   │
│                                     │
└─────────────────────────────────────┘
```

---

¿Qué necesitas específicamente?

1. **¿Cómo agregar más condiciones al IF?**
2. **¿Cómo conectar correctamente TRUE/FALSE?**
3. **¿Necesitas agregar un nodo SET para transformar datos?**
4. **¿Algo más con la configuración?**

Dime exactamente qué parte te está dando problema y te ayudo paso a paso. 🚀
