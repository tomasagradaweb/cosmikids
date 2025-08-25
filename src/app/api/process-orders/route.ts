import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Sistema para evitar duplicados
const processedOrdersFile = path.join(process.cwd(), 'processed_orders.json');

function getProcessedOrders(): string[] {
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

function addProcessedOrder(orderId: string) {
  try {
    const processed = getProcessedOrders();
    if (!processed.includes(orderId)) {
      processed.push(orderId);
      fs.writeFileSync(processedOrdersFile, JSON.stringify(processed, null, 2));
    }
  } catch (error) {
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar API Key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orders } = body; // Array de órdenes de Shopify

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: 'Se requiere un array de órdenes' }, { status: 400 });
    }

    const processedOrders = getProcessedOrders();
    const results = [];

    for (const order of orders) {
      const orderId = order.id?.toString() || order.order_id?.toString();
      
      if (!orderId) {
        results.push({
          orderId: 'unknown',
          status: 'error',
          message: 'ID de orden no encontrado'
        });
        continue;
      }

      // Verificar si ya fue procesada
      if (processedOrders.includes(orderId)) {
        results.push({
          orderId,
          status: 'skipped',
          message: 'Orden ya procesada anteriormente'
        });
        continue;
      }

      try {
        // Extraer datos de la orden
        const orderData = {
          day: order.birth_day || order.day,
          month: order.birth_month || order.month,
          year: order.birth_year || order.year,
          hour: order.birth_hour || order.hour || 12,
          min: order.birth_minute || order.min || 0,
          lat: order.latitude || order.lat || 40.4168,
          lon: order.longitude || order.lon || -3.7038,
          tzone: order.timezone || order.tzone || 1,
          name: order.customer_name || order.name || 'Cliente',
          email: order.customer_email || order.email
        };

        // Validar datos mínimos
        if (!orderData.day || !orderData.month || !orderData.year || !orderData.email) {
          results.push({
            orderId,
            status: 'error',
            message: 'Datos de nacimiento o email faltantes'
          });
          continue;
        }

        // Llamar al endpoint de generación de PDF
        const pdfResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/generate-pdf`,
          orderData,
          {
            headers: {
              'x-api-key': process.env.CRON_API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );

        if (pdfResponse.data.success) {
          // Marcar como procesada
          addProcessedOrder(orderId);
          
          results.push({
            orderId,
            status: 'success',
            message: 'PDF generado y enviado exitosamente',
            zodiacSign: pdfResponse.data.zodiacSign
          });
        } else {
          results.push({
            orderId,
            status: 'error',
            message: 'Error generando PDF'
          });
        }

      } catch (error) {
        results.push({
          orderId,
          status: 'error',
          message: `Error procesando orden: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Procesadas ${results.length} órdenes`,
      results,
      summary: {
        total: results.length,
        success: results.filter(r => r.status === 'success').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        errors: results.filter(r => r.status === 'error').length
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error procesando órdenes',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}