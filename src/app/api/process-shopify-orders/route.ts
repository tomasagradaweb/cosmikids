import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Sistema para evitar duplicados y base de datos de órdenes
const processedOrdersFile = path.join(process.cwd(), 'processed_orders.json');

interface ProcessedOrder {
  orderId: string;
  orderName: string;
  processedAt: string;
  customerData: {
    nombre: string;
    email: string;
    emailRegalo?: string;
    esParaRegalo: boolean;
    fechaNacimiento: string;
    horaNacimiento: string;
    lugarNacimiento: string;
    provinciaNacimiento: string;
    mensaje: string;
    signoZodiacal: string;
  };
}

function getProcessedOrders(): ProcessedOrder[] {
  try {
    if (fs.existsSync(processedOrdersFile)) {
      const data = fs.readFileSync(processedOrdersFile, 'utf8');
      const parsed = JSON.parse(data);
      // Compatibilidad: si es array de strings, convertir a nuevo formato
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
        return [];
      }
      return parsed;
    }
    return [];
  } catch (error) {
    return [];
  }
}

function addProcessedOrder(orderData: ProcessedOrder) {
  try {
    const processed = getProcessedOrders();
    // Verificar si ya existe por ID
    const exists = processed.find(order => order.orderId === orderData.orderId);
    if (!exists) {
      processed.push(orderData);
      fs.writeFileSync(processedOrdersFile, JSON.stringify(processed, null, 2));
    }
  } catch (error) {
  }
}

function isOrderProcessed(orderId: string): boolean {
  const processed = getProcessedOrders();
  return processed.some(order => order.orderId === orderId);
}

export async function POST(request: NextRequest) {
  try {
    // Verificar API Key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    // Obtener parámetros
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const limit = searchParams.get('limit') || '50';

    // 1. OBTENER ÓRDENES DE SHOPIFY
    const shopifyResponse = await axios.get(
      `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/orders.json`,
      {
        params: {
          status: 'any',
          created_at_min: since,
          limit: limit
          // Sin filtro de fields - obtener TODOS los campos
        },
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
          'Content-Type': 'application/json'
        }
      }
    );

    const orders = shopifyResponse.data.orders;

    // 2. VERIFICAR DUPLICADOS
    const newOrders = orders.filter((order: any) => !isOrderProcessed(order.id.toString()));

    const results = [];

    // 3. PROCESAR CADA ORDEN NUEVA
    for (const order of newOrders) {
      try {
        if (order.customer) {
          if (order.customer.default_address) {
          }
        }
        if (order.billing_address) {
        }
        if (order.shipping_address) {
        }

        // Extraer datos del cliente
        let customerInfo = null;

        // Buscar en line items properties
        if (order.line_items && order.line_items.length > 0) {
          const firstItem = order.line_items[0];
          if (firstItem.properties && Array.isArray(firstItem.properties)) {
            const findProp = (name: string) => {
              return firstItem.properties.find((prop: any) => 
                prop.name === name || prop.name === `_${name}` || prop.name === name.replace('_', '')
              )?.value || '';
            };
            
            // Extraer y parsear datos
            const birthDateStr = findProp('Fecha de nacimiento') || findProp('fecha_nacimiento');
            const birthTimeStr = findProp('Hora de nacimiento') || findProp('hora_nacimiento');
            
            // Parsear fecha "13/07/1997"
            let day = 0, month = 0, year = 0;
            if (birthDateStr) {
              const dateParts = birthDateStr.split('/');
              if (dateParts.length === 3) {
                day = parseInt(dateParts[0]);
                month = parseInt(dateParts[1]);
                year = parseInt(dateParts[2]);
              }
            }
            
            // Parsear hora "12:00"
            let hour = 12, min = 0;
            if (birthTimeStr) {
              const timeParts = birthTimeStr.split(':');
              if (timeParts.length === 2) {
                hour = parseInt(timeParts[0]);
                min = parseInt(timeParts[1]);
              }
            }
            
            // Detectar si es para regalar
            const esoEsPara = findProp('Eso es para');
            const esParaRegalo = esoEsPara?.toLowerCase().includes('regalar') || esoEsPara?.toLowerCase().includes('regalo') || false;
            
            // Buscar email (puede ser "Email", "email", "Email para regalar", etc.)
            const emailEnProperties = findProp('Email') || findProp('email') || findProp('Email para regalar') || findProp('email_regalo') || findProp('Email de regalo') || '';
            
            // Buscar en TODOS los campos posibles de la orden
            const emailShopify = order.customer?.email || 
                               order.email || 
                               order.contact_email || 
                               order.billing_address?.email || 
                               order.shipping_address?.email ||
                               order.customer?.default_address?.email ||
                               '';
            
            
            // Lógica de selección de email CORREGIDA - Priorizar properties:
            let emailFinal;
            let emailRegalo = '';
            let emailPrincipal = '';
            
            // LÓGICA CORREGIDA Y SIMPLIFICADA:
            if (esParaRegalo) {
              // Si es para regalar, usar email de properties (destinatario)
              if (emailEnProperties) {
                emailFinal = emailEnProperties;
                emailRegalo = emailEnProperties;
                emailPrincipal = emailShopify || emailEnProperties; // Quien compra
              } else {
                // Si no hay email en properties pero es regalo, usar Shopify
                emailFinal = emailShopify || 'cto@highdatanet.com'; // HARDCODED como fallback temporal
                emailRegalo = emailFinal;
                emailPrincipal = emailShopify || 'cto@highdatanet.com';
              }
            } else {
              // Si NO es para regalar, usar email del checkout (quien compra para sí mismo)
              emailFinal = emailShopify || emailEnProperties || 'cto@highdatanet.com'; // HARDCODED como fallback temporal
              emailPrincipal = emailFinal;
              emailRegalo = ''; // No es regalo
            }
            
            
            
            customerInfo = {
              fullName: findProp('Nombre') || findProp('nombre') || `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
              email: emailFinal,
              emailPrincipal: emailPrincipal,
              emailRegalo: emailRegalo,
              esParaRegalo: esParaRegalo,
              message: findProp('Mensaje') || findProp('mensaje') || findProp('message') || esoEsPara || '',
              birthDate: birthDateStr,
              birthPlace: findProp('Lugar de nacimiento') || findProp('lugar_nacimiento') || findProp('_Lugar de nacimiento'),
              birthProvince: findProp('Provincia de nacimiento') || findProp('provincia_nacimiento'),
              day, month, year, hour, min,
            };
          }
        }

        // Validar datos
        if (!customerInfo || !customerInfo.day || !customerInfo.month || !customerInfo.year) {
          results.push({
            orderId: order.id,
            orderName: order.name,
            status: 'skipped',
            reason: 'Sin datos de nacimiento'
          });
          continue;
        }

        // 4. LLAMAR A API ASTROLÓGICA
        const auth = Buffer.from(`${process.env.ASTROLOGY_USER_ID}:${process.env.ASTROLOGY_API_KEY}`).toString('base64');
        
        const astrologyPayload = {
          day: customerInfo.day,
          month: customerInfo.month,
          year: customerInfo.year,
          hour: customerInfo.hour,
          min: customerInfo.min,
          lat: 40.4168,
          lon: -3.7038,
          tzone: 1
        };
        
        const astrologyResponse = await axios.post(
          `${process.env.ASTROLOGY_API_URL}/western_horoscope`,
          astrologyPayload,
          {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json',
              'Accept-Language': 'es'
            }
          }
        );

        // 5. DETECTAR SIGNO ZODIACAL
        const horoscopeData = astrologyResponse.data;
        const sun = horoscopeData.planets.find((planet: any) => planet.name === 'Sol');
        
        const signMap: { [key: string]: string } = {
          'Aries': 'aries', 'Tauro': 'tauro', 'Géminis': 'geminis', 'Cáncer': 'cancer',
          'Leo': 'leo', 'Virgo': 'virgo', 'Libra': 'libra', 'Escorpio': 'escorpio',
          'Sagitario': 'sagitario', 'Capricornio': 'capricornio', 'Acuario': 'acuario', 'Piscis': 'piscis'
        };
        
        const zodiacSign = signMap[sun?.sign] || 'aries';

        // 6. GENERAR AMBOS PDFs EN UN SOLO EMAIL
        const pdfPayload = {
          day: customerInfo.day,
          month: customerInfo.month,
          year: customerInfo.year,
          hour: customerInfo.hour,
          min: customerInfo.min,
          lat: 40.4168,
          lon: -3.7038,
          tzone: 1,
          name: customerInfo.fullName,
          email: customerInfo.email,
          birthDate: customerInfo.birthDate,
          birthPlace: customerInfo.birthPlace,
          birthProvince: customerInfo.birthProvince,
          message: customerInfo.message,
          dualPdf: true // Flag para generar ambos PDFs en un solo email
        };
        
        const dualPdfResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/generate-pdf-layered`,
          pdfPayload,
          {
            headers: {
              'x-api-key': process.env.CRON_API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );


        // 7. MARCAR COMO PROCESADA Y GUARDAR EN BASE DE DATOS
        const orderData: ProcessedOrder = {
          orderId: order.id.toString(),
          orderName: order.name,
          processedAt: new Date().toISOString(),
          customerData: {
            nombre: customerInfo.fullName,
            email: customerInfo.email,
            emailRegalo: customerInfo.emailRegalo,
            esParaRegalo: customerInfo.esParaRegalo,
            fechaNacimiento: customerInfo.birthDate,
            horaNacimiento: `${customerInfo.hour}:${customerInfo.min}`,
            lugarNacimiento: customerInfo.birthPlace,
            provinciaNacimiento: customerInfo.birthProvince,
            mensaje: customerInfo.message,
            signoZodiacal: zodiacSign.toUpperCase()
          }
        };
        addProcessedOrder(orderData);

        // 8. ACTUALIZAR ORDEN EN SHOPIFY
        if (dualPdfResponse.data.success) {
          try {
            await axios.put(
              `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/orders/${order.id}.json`,
              {
                order: {
                  id: order.id,
                  note: `✅ Ambos PDFs generados y enviados en un solo email el ${new Date().toLocaleString('es-ES')}\n- Carta astral ${zodiacSign.toUpperCase()} (texto)\n- Mandala visual (gráfico)`
                }
              },
              {
                headers: {
                  'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
                  'Content-Type': 'application/json'
                }
              }
            );
          } catch (updateError) {
          }
        }

        results.push({
          orderId: order.id,
          orderName: order.name,
          status: 'success',
          customerName: customerInfo.fullName,
          zodiacSign: zodiacSign.toUpperCase(),
          pdfTextGenerated: true,
          pdfMandalaGenerated: true,
          emailSent: dualPdfResponse.data.emailSent || false,
          attachments: 2,
          // DEBUG: Incluir JSON completo de la orden para análisis
          orderDataDebug: {
            customer: order.customer,
            email: order.email,
            contact_email: order.contact_email,
            billing_address: order.billing_address,
            shipping_address: order.shipping_address,
            line_items_properties: order.line_items?.[0]?.properties,
            allEmailSources: {
              customer_email: order.customer?.email,
              order_email: order.email,
              contact_email: order.contact_email,
              billing_email: order.billing_address?.email,
              shipping_email: order.shipping_address?.email
            }
          }
        });


      } catch (orderError) {
        
        // Error al procesar orden
        if (axios.isAxiosError(orderError)) {
          // Error de API
        }
        
        results.push({
          orderId: order.id,
          orderName: order.name,
          status: 'error',
          error: orderError instanceof Error ? orderError.message : 'Unknown error',
          details: axios.isAxiosError(orderError) ? {
            status: orderError.response?.status,
            api: orderError.config?.url,
            data: orderError.response?.data
          } : undefined
        });
      }
    }

    // RESUMEN FINAL
    const summary = {
      totalOrders: orders.length,
      newOrders: newOrders.length,
      processed: results.length,
      success: results.filter(r => r.status === 'success').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length
    };


    return NextResponse.json({
      success: true,
      message: `Procesamiento completado`,
      since,
      summary,
      results
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Error procesando órdenes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}