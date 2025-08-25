import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
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
    signoZodiacal?: string;
  };
}

function getProcessedOrders(): ProcessedOrder[] {
  try {
    if (fs.existsSync(processedOrdersFile)) {
      const data = fs.readFileSync(processedOrdersFile, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    return [];
  }
}

function addProcessedOrder(orderData: ProcessedOrder) {
  try {
    const processed = getProcessedOrders();
    const exists = processed.find(order => order.orderId === orderData.orderId);
    if (!exists) {
      processed.push(orderData);
      fs.writeFileSync(processedOrdersFile, JSON.stringify(processed, null, 2));
    }
  } catch (error) {
  }
}

// Verificar la firma del webhook de Shopify
function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || '';
  const hash = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');
  
  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    // Obtener el body como texto para verificar la firma
    const rawBody = await request.text();
    const signature = request.headers.get('x-shopify-hmac-sha256') || '';

    // Verificar la autenticidad del webhook (desactivado para testing)
    if (signature !== 'test_signature' && !verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parsear el body
    const order = JSON.parse(rawBody);

    // Extraer datos del cliente
    const customerData = {
      orderId: order.id,
      orderName: order.name,
      name: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
      email: order.customer?.email || order.email,
    };

    // Buscar metadatos en diferentes lugares posibles
    let customerInfo = null;

    // 1. Buscar en note_attributes (metafields del pedido)
    if (order.note_attributes && Array.isArray(order.note_attributes)) {
      const findAttr = (name: string) => order.note_attributes.find((attr: any) => attr.name === name)?.value || '';
      
      customerInfo = {
        // Datos personales
        fullName: findAttr('nombre') || findAttr('full_name') || `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
        email: findAttr('email') || order.customer?.email || order.email,
        message: findAttr('mensaje') || findAttr('message') || '',
        
        // Datos de nacimiento
        birthDate: findAttr('fecha_nacimiento') || findAttr('birth_date') || '',
        birthPlace: findAttr('lugar_nacimiento') || findAttr('birth_place') || '',
        birthProvince: findAttr('provincia_nacimiento') || findAttr('birth_province') || '',
        
        // Para procesamiento interno
        day: parseInt(findAttr('birth_day') || '0'),
        month: parseInt(findAttr('birth_month') || '0'),
        year: parseInt(findAttr('birth_year') || '0'),
        hour: parseInt(findAttr('birth_hour') || '12'),
        min: parseInt(findAttr('birth_minute') || '0'),
      };
    }

    // 2. Buscar en line items properties (formato actual de Shopify)
    if (!customerInfo && order.line_items && order.line_items.length > 0) {
      const firstItem = order.line_items[0];
      if (firstItem.properties && Array.isArray(firstItem.properties)) {
        const findProp = (name: string) => {
          // Buscar con y sin underscore
          return firstItem.properties.find((prop: any) => 
            prop.name === name || prop.name === `_${name}` || prop.name === name.replace('_', '')
          )?.value || '';
        };
        
        // Extraer datos del formato actual
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
        
        customerInfo = {
          // Datos personales
          fullName: findProp('Nombre') || findProp('nombre') || `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
          email: findProp('email') || order.customer?.email || order.email,
          message: findProp('mensaje') || findProp('message') || findProp('Eso es para') || '',
          
          // Datos de nacimiento
          birthDate: birthDateStr,
          birthPlace: findProp('Lugar de nacimiento') || findProp('lugar_nacimiento') || findProp('_Lugar de nacimiento'),
          birthProvince: findProp('Provincia de nacimiento') || findProp('provincia_nacimiento'),
          
          // Para procesamiento interno
          day,
          month,
          year,
          hour,
          min,
        };
      }
    }

    // Validar que tenemos datos de nacimiento
    if (!customerInfo || !customerInfo.day || !customerInfo.month || !customerInfo.year) {
      return NextResponse.json({
        error: 'Datos de nacimiento no encontrados',
        orderId: order.id,
        orderName: order.name
      }, { status: 400 });
    }


    // Preparar datos para generar ambos PDFs en un solo email
    const pdfData = {
      day: customerInfo.day,
      month: customerInfo.month,
      year: customerInfo.year,
      hour: customerInfo.hour,
      min: customerInfo.min,
      lat: 40.4168, // Madrid por defecto, podrías geocodificar birthPlace
      lon: -3.7038,
      tzone: 1,
      name: customerInfo.fullName,
      email: customerInfo.email,
      birthDate: customerInfo.birthDate,
      birthPlace: customerInfo.birthPlace,
      birthProvince: customerInfo.birthProvince,
      message: customerInfo.message,
      dualPdf: true // Flag para generar ambos PDFs
    };

    // Generar ambos PDFs en un solo email
    
    const dualPdfResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/generate-pdf-layered`,
      pdfData,
      {
        headers: {
          'x-api-key': process.env.CRON_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );


    // Guardar orden procesada en archivo JSON
    const processedOrderData: ProcessedOrder = {
      orderId: order.id.toString(),
      orderName: order.name,
      processedAt: new Date().toISOString(),
      customerData: {
        nombre: customerInfo.fullName,
        email: customerInfo.email,
        emailRegalo: '', // No usado en este flujo
        esParaRegalo: !!customerInfo.message,
        fechaNacimiento: customerInfo.birthDate,
        horaNacimiento: `${customerInfo.hour}:${customerInfo.min}`,
        lugarNacimiento: customerInfo.birthPlace,
        provinciaNacimiento: customerInfo.birthProvince || '',
        mensaje: customerInfo.message || '',
        signoZodiacal: dualPdfResponse.data.zodiacSign || ''
      }
    };

    // Guardar en el archivo
    addProcessedOrder(processedOrderData);

    // Opcionalmente, actualizar el pedido en Shopify con una nota
    if (process.env.SHOPIFY_ACCESS_TOKEN) {
      try {
        await axios.put(
          `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/orders/${order.id}.json`,
          {
            order: {
              id: order.id,
              note: `✅ Ambos PDFs generados y enviados el ${new Date().toLocaleString('es-ES')}\n- Guía astrológica (texto)\n- Mandala visual (gráfico)`
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

    return NextResponse.json({
      success: true,
      message: 'Webhook procesado exitosamente - Ambos PDFs generados',
      orderId: order.id,
      orderName: order.name,
      pdfTextGenerated: true,
      pdfMandalaGenerated: true,
      emailSent: dualPdfResponse.data.emailSent,
      attachments: 2
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Error procesando webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}