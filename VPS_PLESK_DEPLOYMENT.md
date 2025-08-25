# 🖥️ Despliegue en VPS con Plesk

## 🚀 CONFIGURACIÓN INICIAL

### 1. Preparar el VPS
```bash
# En Plesk, crear nueva suscripción:
# - Dominio: cosmikids.com
# - Node.js: Activado
# - Base de datos: PostgreSQL/MySQL
```

### 2. Configurar Node.js en Plesk
1. Ir a **Websites & Domains**
2. Click en **Node.js**
3. **Enable Node.js** ✅
4. Seleccionar **Node.js version**: 18.x o superior
5. **Document root**: `/httpdocs`
6. **Application root**: `/httpdocs`
7. **Application startup file**: `server.js`

### 3. Preparar el código para producción

#### A. Crear server.js
```javascript
// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
```

#### B. Actualizar package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "node server.js",
    "production": "npm run build && npm start"
  }
}
```

### 4. Variables de entorno en Plesk
En **Node.js → Environment Variables**:

```env
NODE_ENV=production
ASTROLOGY_API_URL=https://json.astrologyapi.com/v1
ASTROLOGY_USER_ID=642334
ASTROLOGY_API_KEY=tu_api_key
CRON_API_KEY=genera_clave_segura
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alexia.cosmikidz@gmail.com
SMTP_PASS=tu_app_password
EMAIL_FROM=alexia.cosmikidz@gmail.com
SHOPIFY_STORE_URL=cosmikidz.myshopify.com
SHOPIFY_ACCESS_TOKEN=tu_shopify_token
NEXT_PUBLIC_APP_URL=https://cosmikids.com
DATABASE_URL=postgresql://usuario:password@localhost:5432/cosmikids
```

### 5. Base de datos PostgreSQL
En Plesk → **Databases**:
1. Crear nueva base de datos: `cosmikids`
2. Crear usuario con permisos completos
3. Anotar credenciales para DATABASE_URL

### 6. Cron Jobs en Plesk
**Plesk → Tools & Settings → Scheduled Tasks**

```bash
# Cada 48 horas a las 8:00 AM
0 8 */2 * * curl -X GET "https://cosmikids.com/api/cron/process-orders" -H "x-api-key: TU_CRON_API_KEY"
```

### 7. SSL Automático
Plesk → **SSL/TLS Certificates** → **Let's Encrypt** ✅

## 📁 ESTRUCTURA DE ARCHIVOS EN VPS

```
/var/www/vhosts/cosmikids.com/httpdocs/
├── server.js
├── package.json
├── next.config.js
├── .env.production
├── .next/ (después del build)
├── src/
├── public/
└── node_modules/
```

## 🚀 PROCESO DE DEPLOY

### Opción 1: Git Deploy (Recomendado)
```bash
# En el VPS via SSH o File Manager
cd /var/www/vhosts/cosmikids.com/httpdocs
git clone https://github.com/tu-usuario/cosmikids.git .
npm install
npm run build
```

### Opción 2: Plesk Git Integration
1. **Git → Repository**: Conectar tu repo
2. **Auto-deploy**: Activar
3. **Build commands**: `npm install && npm run build`

### Opción 3: Upload Manual
1. Comprimir proyecto local
2. Subir via **File Manager**
3. Descomprimir y ejecutar `npm install`

## 🔄 VENTAJAS DEL VPS vs PAAS

### ✅ Lo que SÍ puedes hacer:
- Canvas + Puppeteer sin problemas
- Cron jobs ilimitados
- Cualquier base de datos
- Archivos temporales/cache
- Logs persistentes
- Backups personalizados
- Múltiples dominios
- Staging environments

### ⚠️ Lo que debes gestionar:
- Actualizaciones de seguridad (Plesk lo facilita)
- Monitoring básico (Plesk incluye)
- Backups (Plesk automatiza)
- SSL (Let's Encrypt automático)

## 💰 COMPARACIÓN DE COSTOS

| Servicio | Costo/mes | Canvas | CRON | DB | Tiempo ejecución |
|----------|-----------|--------|------|-----|------------------|
| **VPS+Plesk** | €8-15 | ✅ | ✅ | ✅ | Ilimitado |
| Vercel Pro | $20 | ❌ | ✅ | Aparte | 60s |
| Railway | $10 | ✅ | ✅ | Aparte | Ilimitado |

## 🛡️ SEGURIDAD Y MANTENIMIENTO

### Plesk se encarga de:
- Actualizaciones de seguridad
- Firewall básico
- SSL automático
- Backups programados
- Monitoring de recursos

### Tú solo gestionas:
- Tu código
- Variables de entorno
- Base de datos (schema)

## 🎯 RECOMENDACIÓN VPS

**Ionos VPS M**: €8/mes
- 2 vCPU
- 4GB RAM  
- 80GB SSD
- Plesk incluido

**Perfecto para Cosmikids** ✅