import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { createLayeredMandala } from '@/utils/layeredMandala';

export const dynamic = 'force-dynamic';

// Función para convertir grados zodiacales a signo EN INGLÉS (para coincidir con API)
function getSignFromDegrees(degrees: number): string {
  // Normalizar grados (0-360°)
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  
  // Array de signos en orden zodiacal EN INGLÉS para coincidir con la API (cada uno ocupa 30°)
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const signIndex = Math.floor(normalizedDegrees / 30);
  return signs[signIndex] || 'Aries';
}

// Función para obtener el signo zodiacal del Sol - REVERTIDO al método que funcionaba
function getSunSignFromAPI(horoscopeData: any): string {
  const sun = horoscopeData.planets?.find((planet: any) => planet.name === 'Sol' || planet.name === 'Sun') || horoscopeData.planets?.[0];
  if (!sun) return 'Aries';
  
  const signMap: { [key: string]: string } = {
    'Aries': 'Aries',
    'Tauro': 'Tauro', 
    'Taurus': 'Tauro',
    'Géminis': 'Géminis',
    'Gemini': 'Géminis',
    'Cáncer': 'Cáncer',
    'Cancer': 'Cáncer',
    'Leo': 'Leo',
    'Virgo': 'Virgo',
    'Libra': 'Libra',
    'Escorpio': 'Escorpio',
    'Scorpio': 'Escorpio',
    'Sagitario': 'Sagitario',
    'Sagittarius': 'Sagitario',
    'Capricornio': 'Capricornio',
    'Capricorn': 'Capricornio',
    'Acuario': 'Acuario',
    'Aquarius': 'Acuario',
    'Piscis': 'Piscis',
    'Pisces': 'Piscis'
  };
  
  return signMap[sun.sign] || 'Aries';
}

// Función para mapear signos zodiacales a nombres de archivos PDF
function getZodiacFilename(zodiacSign: string): string {
  const filenameMap: { [key: string]: string } = {
    'Aries': 'aires',
    'Tauro': 'tauro',
    'Géminis': 'geminis', 
    'Cáncer': 'cancer',
    'Leo': 'leo',
    'Virgo': 'virgo',
    'Libra': 'libra',
    'Escorpio': 'escorpio',
    'Sagitario': 'sagitario',
    'Capricornio': 'capricornio',
    'Acuario': 'acuario',
    'Piscis': 'piscis'
  };
  
  return filenameMap[zodiacSign] || zodiacSign.toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    // Verificar API Key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Si viene el flag dualPdf, generar ambos PDFs en un solo email
    const generateDualPdf = body.dualPdf || false;
    
    const { day, month, year, hour, min, lat, lon, tzone, name, email, birthPlace: originalBirthPlace, birthProvince } = body;

    // Validar datos requeridos
    if (!day || !month || !year || !name || !email) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    let textPdfBuffer = null;
    let horoscopeData = null;
    
    // Mantener lugar y provincia separados para el mandala
    const birthPlaceClean = originalBirthPlace || 'Madrid';
    const birthProvinceClean = birthProvince || '';
    
    // Llamar a la API de astrología para obtener datos del horóscopo
    const auth = Buffer.from(`${process.env.ASTROLOGY_USER_ID}:${process.env.ASTROLOGY_API_KEY}`).toString('base64');
    
    const response = await fetch(`${process.env.ASTROLOGY_API_URL}/western_horoscope`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'es'
      },
      body: JSON.stringify({
        day, month, year, hour, min,
        lat: lat || 40.4168,
        lon: lon || -3.7038,
        tzone: tzone || 1
      })
    });

    if (!response.ok) {
      throw new Error('Error en API de astrología');
    }

    horoscopeData = await response.json();
    
    
    const zodiacSign = getSunSignFromAPI(horoscopeData);
    
    // Si se solicita PDF dual, generar también el PDF de texto
    if (generateDualPdf) {
      
      // Función para generar HTML de la guía astrológica (copiada del otro endpoint)
      const generateZodiacHTML = (zodiacSign: string, data: any) => {
        const { name, horoscopeData } = data;
        const sun = horoscopeData.planets?.find((p: any) => p.name === 'Sol' || p.name === 'Sun');
        const moon = horoscopeData.planets?.find((p: any) => p.name === 'Luna' || p.name === 'Moon');
        const ascendant = horoscopeData.houses?.[0];
        
        // HTML básico para el signo
        return `
          <div style="background: #f7ede4; padding: 40px; border: 3px solid #CEBFC8; margin: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4b454f; font-size: 24px; margin-bottom: 10px;">🌟 ${zodiacSign.toUpperCase()} 🌟</h1>
              <p style="color: #666; font-style: italic;">Tu signo zodiacal</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h2 style="color: #4b454f; font-size: 18px;">CARACTERÍSTICAS PRINCIPALES</h2>
              <p style="color: #4b454f; line-height: 1.6;">
                Tu signo ${zodiacSign} define aspectos fundamentales de tu personalidad y características únicas 
                influenciadas por la posición de los planetas en el momento de tu nacimiento.
              </p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #4b454f; font-size: 14px;">🌅 Ascendente: ${ascendant?.sign || 'N/A'}</h3>
              <p style="color: #4b454f; font-size: 12px;">
                Tu ascendente ${ascendant?.sign || 'N/A'} influye en la forma en que te presentas al mundo.
              </p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #4b454f; font-size: 14px;">🌙 Luna: ${moon?.sign || 'N/A'}</h3>
              <p style="color: #4b454f; font-size: 12px;">
                La Luna en ${moon?.sign || 'N/A'} define tus reacciones emocionales y necesidades básicas.
              </p>
            </div>
          </div>
        `;
      };

      const zodiacHTML = generateZodiacHTML(zodiacSign, {
        name,
        horoscopeData
      });

      // Crear página temporal para el PDF de texto
      const textPage = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }).then(browser => browser.newPage());
      
      await textPage.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Carta Astral - ${name}</title>
            <style>
              body {
                font-family: Georgia, serif;
                margin: 0;
                padding: 20px;
                background-color: white;
                color: #333;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #ddd;
                padding-bottom: 20px;
              }
              .zodiac-info {
                background-color: #f9f9f9;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🌟 Carta Astral de ${name} 🌟</h1>
              <p><strong>Signo Solar:</strong> ${zodiacSign.toUpperCase()}</p>
              <p><strong>Fecha:</strong> ${day}/${month}/${year} a las ${hour}:${min}</p>
            </div>
            
            <div class="zodiac-info">
              <h2>Información Astrológica</h2>
              <p><strong>Ascendente:</strong> ${horoscopeData.houses?.[0]?.sign || 'N/A'}</p>
              <p><strong>Sol:</strong> ${horoscopeData.planets?.[0]?.sign || 'N/A'} ${horoscopeData.planets?.[0]?.norm_degree?.toFixed(1) || '0.0'}°</p>
              <p><strong>Luna:</strong> ${horoscopeData.planets?.[1]?.sign || 'N/A'} ${horoscopeData.planets?.[1]?.norm_degree?.toFixed(1) || '0.0'}°</p>
            </div>

            ${zodiacHTML}
          </body>
        </html>
      `);

      textPdfBuffer = await textPage.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      await textPage.browser().close();
    }
    
    // Obtener información de planetas usando norm_degree como fuente única
    const sun = horoscopeData.planets?.find((p: any) => p.name === 'Sun' || p.name === 'Sol');
    const moon = horoscopeData.planets?.find((p: any) => p.name === 'Moon' || p.name === 'Luna');
    const ascendant = horoscopeData.houses?.[0]; // Primera casa = Ascendente
    
    // Usar full_degree para cálculos correctos (norm_degree son grados dentro del signo, no totales)
    const sunSignFromDegrees = sun?.full_degree ? getSignFromDegrees(sun.full_degree) : zodiacSign;
    const moonSignFromDegrees = moon?.full_degree ? getSignFromDegrees(moon.full_degree) : zodiacSign;
    const ascendantSignFromDegrees = ascendant?.degree ? getSignFromDegrees(ascendant.degree) : zodiacSign;
    

    
    // Crear el mandala con capas - todos usando full_degree para consistencia
    const personalData = {
      name,
      birthDate: `${day} de ${getMonthName(month)} de ${year}`,
      birthPlace: birthPlaceClean, // Ciudad/lugar
      provincia: birthProvinceClean, // Comunidad/provincia
      sunSign: sunSignFromDegrees,
      moonSign: moonSignFromDegrees,
      ascendantSign: ascendantSignFromDegrees,
      description: '' // Sin descripciones hardcodeadas
    };

    const layeredMandalaBuffer = await createLayeredMandala(personalData, horoscopeData);
    const layeredMandalaBase64 = `data:image/png;base64,${layeredMandalaBuffer.toString('base64')}`;
    

    // Generar PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    });
    
    const page = await browser.newPage();
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Carta Astral con Capas - ${name}</title>
          <style>
            @font-face {
              font-family: 'IBM Plex Sans';
              src: url('/fonts/IBM_Plex_Sans/IBMPlexSans-Regular.ttf') format('truetype');
              font-weight: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'IBM Plex Sans';
              src: url('/fonts/IBM_Plex_Sans/IBMPlexSans-Bold.ttf') format('truetype');
              font-weight: bold;
              font-display: swap;
            }
            @font-face {
              font-family: 'Nunito';
              src: url('/fonts/Nunito/Nunito-Regular.ttf') format('truetype');
              font-weight: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Nunito';
              src: url('/fonts/Nunito/Nunito-SemiBold.ttf') format('truetype');
              font-weight: 600;
              font-display: swap;
            }
            @font-face {
              font-family: 'Nunito';
              src: url('/fonts/Nunito/Nunito-Bold.ttf') format('truetype');
              font-weight: bold;
              font-display: swap;
            }
            body {
              font-family: 'IBM Plex Sans', Arial, sans-serif;
              margin: 0;
              padding: 0;
              width: 100vw;
              height: 100vh;
              overflow: hidden;
            }
            .mandala-container {
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .mandala-container img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          </style>
        </head>
        <body>
          <div class="mandala-container">
            <img src="${layeredMandalaBase64}" alt="Carta Astral con Capas" />
          </div>
        </body>
      </html>
    `);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      }
    });

    await browser.close();

    // Enviar email (opcional)
    let emailSent = false;
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: `🌟 Tu Carta Astral Completa Cosmikids - ${name}`,
          html: `
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Tu Mandala Astrológico - Cosmikids</title>
            </head>
            <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f8f8f8; color: #333;">
              
              <!-- Container principal -->
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
                
                <!-- Header -->
                <div style="background: #6b46c1; padding: 40px 30px; text-align: center;">
                  <img src="cid:logo" alt="Cosmikids" style="max-width: 160px; height: auto; margin-bottom: 20px;">
                  <h1 style="color: #ffffff; font-size: 28px; margin: 0;">
                    Tu Mandala Astrológico
                  </h1>
                </div>

                <!-- Contenido principal -->
                <div style="padding: 40px 30px;">
                  
                  <h2 style="color: #6b46c1; font-size: 24px; margin: 0 0 20px 0; text-align: center;">
                    ¡Hola, ${name}!
                  </h2>
                  
                  <!-- Signo destacado -->
                  <div style="background: #f8f6fc; border: 1px solid #e8dff0; padding: 20px; margin: 25px 0; text-align: center;">
                    <div style="background: #6b46c1; color: white; padding: 6px 12px; display: inline-block; font-size: 12px; margin-bottom: 10px;">
                      TU SIGNO SOLAR
                    </div>
                    <h3 style="color: #6b46c1; font-size: 32px; margin: 0; text-transform: uppercase;">
                      ${zodiacSign}
                    </h3>
                  </div>

                  <!-- Descripción -->
                  <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Hemos creado tu <strong>mandala astrológico personalizado</strong> usando las posiciones exactas de los planetas en el momento de tu nacimiento.
                  </p>

                  <!-- Lista de características -->
                  <div style="background: #f9f9f9; padding: 20px; margin: 25px 0;">
                    <h4 style="color: #6b46c1; font-size: 18px; margin: 0 0 15px 0;">
                      Elementos Incluidos:
                    </h4>
                    <ul style="color: #555; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Posicionamiento astronómico exacto de planetas</li>
                      <li>Los 12 signos zodiacales con símbolos auténticos</li>
                      <li>Información personalizada de Sol, Luna y Ascendente</li>
                      <li>Diseño artístico profesional por capas</li>
                    </ul>
                  </div>

                  <!-- Archivo adjunto -->
                  <div style="text-align: center; margin: 30px 0;">
                    <div style="background: #6b46c1; color: white; padding: 10px 20px; display: inline-block; font-size: 14px; margin-bottom: 10px;">
                      📎 ARCHIVO ADJUNTO
                    </div>
                    <p style="color: #666; font-size: 14px; margin: 0;">
                      Tu mandala en formato PDF de alta calidad.
                    </p>
                  </div>

                </div>

                <!-- Footer -->
                <div style="background: #f8f6fc; padding: 30px; text-align: center; border-top: 1px solid #e8dff0;">
                  <p style="color: #6b46c1; font-size: 16px; margin: 0 0 10px 0;">
                    Con amor cósmico
                  </p>
                  <p style="color: #666; font-size: 14px; margin: 0;">
                    El equipo de <strong>Cosmikids</strong>
                  </p>
                  
                  <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e8dff0;">
                    <p style="color: #888; font-size: 12px; margin: 0;">
                      Cosmikids · Astrología personalizada
                    </p>
                  </div>
                </div>

              </div>
            </body>
            </html>
          `,
          attachments: [
            {
              filename: 'logo.webp',
              path: path.join(process.cwd(), 'public', 'Logo_Cosmikidz.webp'),
              cid: 'logo'
            },
            {
              filename: `guia-${zodiacSign.toLowerCase()}-${name.replace(/\s/g, '-').toLowerCase()}.pdf`,
              path: path.join(process.cwd(), 'public', 'pdfs', `${getZodiacFilename(zodiacSign)}.pdf`)
            },
            {
              filename: `mandala-astral-${name.replace(/\s/g, '-').toLowerCase()}.pdf`,
              content: Buffer.from(pdfBuffer)
            }
          ]
        });
        emailSent = true;
      }
    } catch (emailError) {
      emailSent = false;
    }

    return NextResponse.json({
      success: true,
      message: emailSent ? `PDF con capas generado y enviado a ${email}` : `PDF con capas generado (email no configurado)`,
      zodiacSign: zodiacSign,
      layersUsed: ['Fondo sin palabras.jpg', 'base mandala.png', 'mandala detalles.png', 'signos/*.png'],
      pdfGenerated: true,
      emailSent,
      resendConfigured: !!process.env.RESEND_API_KEY
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error generando PDF con capas',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Función auxiliar para obtener nombre del mes
function getMonthName(month: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month - 1] || 'Mes';
}