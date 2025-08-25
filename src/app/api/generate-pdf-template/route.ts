import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';
import path from 'path';
import { createPersonalizedMandala } from '@/utils/templateMandala';

export const dynamic = "force-dynamic";

// Función para obtener el signo zodiacal del Sol
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

// Función para obtener descripción personalizada por signo
function getPersonalizedDescription(zodiacSign: string): string {
  const descriptions: { [key: string]: string } = {
    'aries': 'Proyecta entusiasmo, necesita evadirse y brilla cuando conecta con su cuerpo',
    'tauro': 'Busca estabilidad y seguridad, conecta profundamente con la naturaleza',
    'géminis': 'Curioso e inquieto, necesita variedad y estimulación mental constante',
    'cáncer': 'Sensible y protector, busca crear un hogar seguro y cálido',
    'leo': 'Creativo y expresivo, necesita brillar y ser reconocido por su autenticidad',
    'virgo': 'Detallista y servicial, busca la perfección y ayudar a otros',
    'libra': 'Busca armonía y equilibrio, valora la belleza y las relaciones',
    'escorpio': 'Intenso y transformador, busca profundidad en todas sus experiencias',
    'sagitario': 'Aventurero y filosófico, necesita libertad para explorar y crecer',
    'capricornio': 'Ambicioso y responsable, construye paso a paso hacia sus metas',
    'acuario': 'Innovador e independiente, busca cambiar el mundo con ideas originales',
    'piscis': 'Intuitivo y compasivo, conecta profundamente con las emociones y la espiritualidad'
  };
  
  return descriptions[zodiacSign.toLowerCase()] || 'Una personalidad única con grandes cualidades por descubrir';
}

export async function POST(request: NextRequest) {
  try {
    // Verificar API Key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const { day, month, year, hour, min, lat, lon, tzone, name, email } = body;
    

    // Validar datos requeridos
    if (!day || !month || !year || !name || !email) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Llamar a la API de astrología para obtener datos del horóscopo
    const auth = Buffer.from(`${process.env.ASTROLOGY_USER_ID}:${process.env.ASTROLOGY_API_KEY}`).toString('base64');
    
    const response = await fetch(`${process.env.ASTROLOGY_API_URL}/western_horoscope`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
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

    const horoscopeData = await response.json();
    const sunSign = getSunSignFromAPI(horoscopeData);
    
    // Obtener información de Luna y Ascendente
    const moon = horoscopeData.planets?.find((p: any) => p.name === 'Luna' || p.name === 'Moon') || horoscopeData.planets?.[1];
    const ascendant = horoscopeData.houses?.[0] || { sign: 'Desconocido' };

    
    // Crear el mandala personalizado usando la plantilla
    const personalData = {
      name,
      birthDate: `${day} de ${getMonthName(month)} de ${year}`,
      birthPlace: 'Madrid, España', // Puedes hacerlo dinámico si tienes los datos
      sunSign,
      moonSign: moon?.sign || 'Calculando...',
      ascendantSign: ascendant?.sign || 'Calculando...',
      description: getPersonalizedDescription(sunSign)
    };

    const customizedMandalaBuffer = await createPersonalizedMandala(personalData, horoscopeData);
    const customizedMandalaBase64 = `data:image/png;base64,${customizedMandalaBuffer.toString('base64')}`;
    

    // Generar PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Carta Astral Personalizada - ${name}</title>
          <style>
            body {
              font-family: Georgia, serif;
              margin: 0;
              padding: 0;
              background-color: white;
              color: #333;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .mandala-container {
              text-align: center;
              max-width: 100%;
            }
            .mandala-container img {
              width: 100%;
              max-width: 800px;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="mandala-container">
            <img src="${customizedMandalaBase64}" alt="Carta Astral Personalizada" />
          </div>
        </body>
      </html>
    `);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    });

    await browser.close();

    // Enviar email
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
          subject: `🌟 Tu Carta Astral Personalizada Cosmikids - ${name}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Tu Carta Astral Personalizada - Cosmikids</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #ffffff; color: #333333;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                
                <!-- Header con logo -->
                <div style="text-align: center; padding: 40px 20px 30px; background: linear-gradient(135deg, #b6a6cc 0%, #e8dff0 100%);">
                  <img src="cid:logo" alt="Cosmikids" style="max-width: 200px; height: auto; margin-bottom: 15px;">
                  <h1 style="color: #4b454f; font-size: 28px; margin: 0; font-weight: normal;">
                    ✨ Tu Carta Astral Personalizada ✨
                  </h1>
                </div>

                <!-- Contenido principal -->
                <div style="padding: 40px 30px;">
                  <h2 style="color: #b6a6cc; font-size: 24px; margin-bottom: 20px; text-align: center;">
                    ¡Hola ${name}! 🌙
                  </h2>
                  
                  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; text-align: center;">
                    Gracias por confiar en <strong>Cosmikids</strong>. Adjunto encontrarás tu carta astral personalizada 
                    con un diseño único que muestra tu información astrológica de forma clara y hermosa.
                  </p>

                  <!-- Caja destacada -->
                  <div style="background-color: #f8f6fc; border-left: 4px solid #b6a6cc; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0 0 10px 0; font-size: 18px; color: #4b454f;">
                      <strong>🌟 Tu signo solar:</strong> 
                      <span style="color: #b6a6cc; font-weight: bold;">${sunSign}</span>
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #666;">
                      <strong>🎨 Diseño personalizado</strong> con tu nombre y datos únicos
                    </p>
                  </div>

                  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
                    Este diseño único incluye todos los signos zodiacales, tus datos personales y una descripción 
                    especial de tu personalidad astrológica.
                  </p>

                  <!-- Separador decorativo -->
                  <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; width: 60px; height: 3px; background: linear-gradient(to right, #b6a6cc, #e8dff0); border-radius: 3px;"></div>
                  </div>

                  <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 30px;">
                    Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para acompañarte en este viaje cósmico!
                  </p>
                </div>

                <!-- Footer -->
                <div style="background-color: #f8f6fc; padding: 25px 30px; text-align: center; border-top: 1px solid #e8dff0;">
                  <p style="margin: 0 0 10px 0; font-size: 16px; color: #b6a6cc; font-weight: bold;">
                    Con amor cósmico,
                  </p>
                  <p style="margin: 0; font-size: 16px; color: #4b454f;">
                    El equipo de <strong>Cosmikids</strong> 🌙✨
                  </p>
                  
                  <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e8dff0;">
                    <p style="margin: 0; font-size: 12px; color: #999;">
                      Cosmikids - Descubre tu universo interior
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
              filename: `carta-astral-personalizada-${name.replace(/\s/g, '-').toLowerCase()}.pdf`,
              content: Buffer.from(pdfBuffer)
            }
          ]
        });
        emailSent = true;
      } else {
      }
    } catch (emailError) {
    }

    return NextResponse.json({
      success: true,
      message: emailSent ? `PDF personalizado generado y enviado a ${email}` : `PDF personalizado generado (email no configurado)`,
      zodiacSign: sunSign,
      pdfGenerated: true,
      emailSent
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error generando PDF personalizado',
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