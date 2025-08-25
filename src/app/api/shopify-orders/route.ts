import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    // Verificar API Key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Últimas 24h por defecto
    const limit = searchParams.get('limit') || '50';

    // Llamar a la API de Shopify
    const response = await axios.get(
      `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/orders.json`,
      {
        params: {
          status: 'any',
          created_at_min: since,
          limit: limit,
          fields: 'id,name,created_at,customer,note_attributes,line_items,note,email'
        },
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
          'Content-Type': 'application/json'
        }
      }
    );

    const orders = response.data.orders;

    // Procesar cada orden
    const processedOrders = [];
    
    for (const order of orders) {
      try {
        // Extraer datos de nacimiento de cada orden
        let birthData = null;

        // Buscar en note_attributes
        if (order.note_attributes && Array.isArray(order.note_attributes)) {
          birthData = {
            day: parseInt(order.note_attributes.find((attr: any) => attr.name === 'birth_day')?.value || '0'),
            month: parseInt(order.note_attributes.find((attr: any) => attr.name === 'birth_month')?.value || '0'),
            year: parseInt(order.note_attributes.find((attr: any) => attr.name === 'birth_year')?.value || '0'),
            hour: parseInt(order.note_attributes.find((attr: any) => attr.name === 'birth_hour')?.value || '12'),
            min: parseInt(order.note_attributes.find((attr: any) => attr.name === 'birth_minute')?.value || '0'),
          };
        }

        // Buscar en line items properties
        if (!birthData?.day && order.line_items && order.line_items.length > 0) {
          const firstItem = order.line_items[0];
          if (firstItem.properties && Array.isArray(firstItem.properties)) {
            birthData = {
              day: parseInt(firstItem.properties.find((prop: any) => prop.name === 'birth_day')?.value || '0'),
              month: parseInt(firstItem.properties.find((prop: any) => prop.name === 'birth_month')?.value || '0'),
              year: parseInt(firstItem.properties.find((prop: any) => prop.name === 'birth_year')?.value || '0'),
              hour: parseInt(firstItem.properties.find((prop: any) => prop.name === 'birth_hour')?.value || '12'),
              min: parseInt(firstItem.properties.find((prop: any) => prop.name === 'birth_minute')?.value || '0'),
            };
          }
        }

        if (birthData && birthData.day && birthData.month && birthData.year) {
          // Generar PDF para esta orden
          const pdfResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/generate-pdf`,
            {
              day: birthData.day,
              month: birthData.month,
              year: birthData.year,
              hour: birthData.hour,
              min: birthData.min,
              lat: 40.4168,
              lon: -3.7038,
              tzone: 1,
              name: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim() || 'Cliente',
              email: order.customer?.email || order.email
            },
            {
              headers: {
                'x-api-key': process.env.CRON_API_KEY,
                'Content-Type': 'application/json'
              }
            }
          );

          processedOrders.push({
            orderId: order.id,
            orderName: order.name,
            status: 'success',
            zodiacSign: pdfResponse.data.zodiacSign,
            pdfGenerated: true
          });

        } else {
          processedOrders.push({
            orderId: order.id,
            orderName: order.name,
            status: 'skipped',
            reason: 'No birth data found'
          });
        }

      } catch (orderError) {
        processedOrders.push({
          orderId: order.id,
          orderName: order.name,
          status: 'error',
          error: orderError instanceof Error ? orderError.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Procesadas ${processedOrders.length} órdenes`,
      since: since,
      results: processedOrders,
      summary: {
        total: processedOrders.length,
        success: processedOrders.filter(o => o.status === 'success').length,
        skipped: processedOrders.filter(o => o.status === 'skipped').length,
        errors: processedOrders.filter(o => o.status === 'error').length
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Error obteniendo órdenes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}