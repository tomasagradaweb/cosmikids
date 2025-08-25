import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Máximo 60 segundos para Vercel

export async function GET(request: NextRequest) {
  try {
    // Verificar que viene de Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // En producción, Vercel añade CRON_SECRET automáticamente
      // Solo en desarrollo permitimos sin auth
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Log del inicio
    const startTime = new Date().toISOString();
    
    // Llamar al endpoint de procesamiento
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await axios.post(
      `${baseUrl}/api/process-shopify-orders`,
      {},
      {
        headers: {
          'x-api-key': process.env.CRON_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 55000 // 55 segundos de timeout
      }
    );

    // Log de resultado
    const endTime = new Date().toISOString();
    
    return NextResponse.json({
      success: true,
      message: 'Cron job ejecutado exitosamente',
      startTime,
      endTime,
      ordersProcessed: response.data.summary || {},
      nextRun: 'En 48 horas'
    });

  } catch (error) {
    // Log de error para debugging
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}