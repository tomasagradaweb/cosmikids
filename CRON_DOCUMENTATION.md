# 📅 Configuración CRON para Vercel

## 🔄 ¿Cómo funciona?

El sistema CRON está configurado para procesar automáticamente los pedidos de Shopify cada 48 horas.

### Flujo del proceso:

1. **Vercel ejecuta** `/api/cron/process-orders` cada 48h
2. **El endpoint CRON** llama a `/api/process-shopify-orders`
3. **Process-shopify-orders**:
   - Obtiene pedidos de Shopify de las últimas 48h
   - Filtra los ya procesados
   - Genera mandalas y PDFs
   - Envía emails a los clientes
   - Marca pedidos como procesados

## ⏰ Horario configurado

```
"schedule": "0 8 */2 * *"
```

Esto significa:
- **0**: Minuto 0
- **8**: Hora 8 (8:00 AM UTC)
- ***/2**: Cada 2 días
- **\***: Cualquier mes
- **\***: Cualquier día de la semana

**Resultado**: Se ejecuta a las 8:00 AM UTC cada 48 horas

## 🚀 Despliegue en Vercel

### 1. Variables de entorno necesarias en Vercel:

```env
# API Keys
ASTROLOGY_API_URL=https://json.astrologyapi.com/v1
ASTROLOGY_USER_ID=642334
ASTROLOGY_API_KEY=tu_api_key

# Seguridad
CRON_API_KEY=genera_una_clave_segura_aqui
CRON_SECRET=vercel_la_genera_automaticamente

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alexia.cosmikidz@gmail.com
SMTP_PASS=tu_app_password
EMAIL_FROM=alexia.cosmikidz@gmail.com

# Shopify
SHOPIFY_STORE_URL=cosmikidz.myshopify.com
SHOPIFY_ACCESS_TOKEN=tu_shopify_token

# URLs
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

### 2. Configuración en Vercel Dashboard:

1. Ve a **Settings → Environment Variables**
2. Añade todas las variables listadas arriba
3. Ve a **Settings → Functions**
4. Verifica que los Cron Jobs aparezcan

### 3. Limitaciones de Vercel:

- **Hobby Plan**: 
  - Máximo 10 segundos de ejecución
  - 1 cron job
  
- **Pro Plan** (recomendado):
  - Hasta 60 segundos de ejecución
  - Múltiples cron jobs
  - Mejor para producción

## 🧪 Testing

### Test manual del CRON (desarrollo):
```bash
curl http://localhost:3001/api/cron/process-orders
```

### Test manual del CRON (producción):
```bash
curl https://tu-dominio.vercel.app/api/cron/process-orders \
  -H "Authorization: Bearer tu_cron_secret"
```

## 📊 Monitoreo

Vercel proporciona logs automáticos en:
- **Functions → Logs**: Ver ejecuciones
- **Functions → Crons**: Ver historial de CRON

## 🔧 Solución de problemas

### Si el CRON no se ejecuta:
1. Verifica que `vercel.json` esté en la raíz
2. Revisa los logs en Vercel Dashboard
3. Verifica las variables de entorno

### Si falla el procesamiento:
1. Revisa el timeout (máximo 60s en Pro)
2. Verifica credenciales de Shopify
3. Revisa límites de la API de Astrología

## 🎯 Alternativas al horario

Si quieres cambiar la frecuencia:

- **Cada 24 horas a las 8 AM**: `"0 8 * * *"`
- **Cada 3 días a las 10 AM**: `"0 10 */3 * *"`
- **Lunes y Jueves a las 9 AM**: `"0 9 * * 1,4"`
- **Cada hora**: `"0 * * * *"`

## 📝 Notas importantes

1. **Canvas y Puppeteer**: Vercel no soporta binarios nativos. Necesitarás:
   - Usar Vercel Functions con `@vercel/og` para generar imágenes
   - O usar un servicio externo para generar PDFs
   - O cambiar a Edge Functions con PDF generation APIs

2. **Base de datos**: El archivo `processed_orders.json` no funcionará en Vercel.
   Necesitas una base de datos real:
   - Vercel Postgres
   - MongoDB Atlas
   - Supabase

3. **Webhooks de Shopify**: Es mejor configurar webhooks que procesar con CRON:
   - Más eficiente
   - Procesamiento instantáneo
   - Sin duplicados