import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';
import path from 'path';
import { createLayeredMandala } from '../../../utils/layeredMandala';

export const dynamic = "force-dynamic";

// Función para obtener el signo zodiacal del Sol
function getSunSignFromAPI(horoscopeData: any): string {
  const sun = horoscopeData.planets.find((planet: any) => planet.name === 'Sol');
  if (!sun) return 'aries';
  
  const signMap: { [key: string]: string } = {
    'Aries': 'aries',
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
  
  return signMap[sun.sign] || 'aries';
}

// Función para generar HTML de la guía astrológica
async function generateZodiacHTML(zodiacSign: string, data: any) {
  const { name, birthDate, birthTime, horoscopeData } = data;
  
  const sun = horoscopeData.planets.find((p: any) => p.name === 'Sol');
  const moon = horoscopeData.planets.find((p: any) => p.name === 'Luna');
  const ascendant = horoscopeData.houses[0];
  
  const zodiacInfo: { [key: string]: string } = {
    'aries': `
      <div style="background: #f7ede4; padding: 40px; border: 3px solid #CEBFC8; margin: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4b454f; font-size: 24px; margin-bottom: 10px;">🔥 ARIES 🔥</h1>
          <p style="color: #666; font-style: italic;">21 de marzo - 19 de abril</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #4b454f; font-size: 18px;">ETAPA DE BEBÉ</h2>
          <p style="color: #4b454f; line-height: 1.6;">
            En la etapa de bebé, su Ascendente y su Luna nos ofrecen la llave para entender 
            cómo proyecta y siente el mundo antes de las palabras. Su energía Aries es directa, 
            impaciente y con mucha iniciativa.
          </p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #4b454f; font-size: 14px;">🌅 Ascendente: ${ascendant.sign}</h3>
          <p style="color: #4b454f; font-size: 12px;">
            La energía del ascendente es directa y con mucha iniciativa. 
            Reacciona al instante y necesita movimiento y libertad.
          </p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #4b454f; font-size: 14px;">🌙 Luna: ${moon.sign}</h3>
          <p style="color: #4b454f; font-size: 12px;">
            Esta Luna impulsa al bebé a expresar lo que siente de forma directa, 
            con intensidad y sin filtros.
          </p>
        </div>
      </div>
    `,
    'cancer': `
      <div style="background: #f7ede4; padding: 40px; border: 3px solid #CEBFC8; margin: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4b454f; font-size: 24px; margin-bottom: 10px;">🌙 CÁNCER 🌙</h1>
          <p style="color: #666; font-style: italic;">21 de junio - 22 de julio</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #4b454f; font-size: 18px;">ETAPA DE BEBÉ</h2>
          <p style="color: #4b454f; line-height: 1.6;">
            En la etapa de bebé, Cáncer muestra una gran sensibilidad emocional y 
            necesidad de seguridad. Su conexión con la Luna lo hace muy intuitivo 
            y receptivo al ambiente familiar.
          </p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #4b454f; font-size: 14px;">🌅 Ascendente: ${ascendant.sign}</h3>
          <p style="color: #4b454f; font-size: 12px;">
            El ascendente influye en cómo el bebé se presenta al mundo, 
            mostrando su naturaleza protectora y cariñosa.
          </p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #4b454f; font-size: 14px;">🌙 Luna: ${moon.sign}</h3>
          <p style="color: #4b454f; font-size: 12px;">
            La Luna en ${moon.sign} potencia su naturaleza emocional y 
            su necesidad de vínculos afectivos seguros.
          </p>
        </div>
      </div>
    `
  };
  
  const genericHTML = `
    <div style="background: #f7ede4; padding: 40px; border: 3px solid #CEBFC8; margin: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4b454f; font-size: 24px; margin-bottom: 10px;">🌟 ${zodiacSign.toUpperCase()} 🌟</h1>
        <p style="color: #666; font-style: italic;">Signo zodiacal</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h2 style="color: #4b454f; font-size: 18px;">ETAPA DE BEBÉ</h2>
        <p style="color: #4b454f; line-height: 1.6;">
          En la etapa de bebé, ${zodiacSign} desarrolla sus características únicas 
          influenciadas por su signo solar y los aspectos planetarios.
        </p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #4b454f; font-size: 14px;">🌅 Ascendente: ${ascendant.sign}</h3>
        <p style="color: #4b454f; font-size: 12px;">
          El ascendente ${ascendant.sign} influye en la forma en que se presenta al mundo.
        </p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #4b454f; font-size: 14px;">🌙 Luna: ${moon.sign}</h3>
        <p style="color: #4b454f; font-size: 12px;">
          La Luna en ${moon.sign} define sus reacciones emocionales y necesidades básicas.
        </p>
      </div>
    </div>
  `;
  
  return zodiacInfo[zodiacSign] || genericHTML;
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

    // 1. LLAMAR A API DE ASTROLOGÍA
    const auth = Buffer.from(`${process.env.ASTROLOGY_USER_ID}:${process.env.ASTROLOGY_API_KEY}`).toString('base64');
    
    const [horoscopeResponse, natalWheelResponse] = await Promise.all([
      // API para datos del horóscopo
      fetch(`${process.env.ASTROLOGY_API_URL}/western_horoscope`, {
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
      }),
      // API para datos del mandala
      fetch(`${process.env.ASTROLOGY_API_URL}/natal_wheel_chart`, {
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
      })
    ]);

    if (!horoscopeResponse.ok || !natalWheelResponse.ok) {
      throw new Error('Error en API de astrología');
    }

    const horoscopeData = await horoscopeResponse.json();
    const natalWheelData = await natalWheelResponse.json();
    
    
    const zodiacSign = getSunSignFromAPI(horoscopeData);


    // 2. GENERAR PDF DE TEXTO
    const zodiacHTML = await generateZodiacHTML(zodiacSign, {
      name,
      email,
      birthDate: `${day}/${month}/${year}`,
      birthTime: `${hour}:${min}`,
      horoscopeData,
      zodiacSign
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const textPage = await browser.newPage();
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
            <p><strong>Ascendente:</strong> ${horoscopeData.houses[0].sign}</p>
            <p><strong>Sol:</strong> ${horoscopeData.planets[0].sign} ${horoscopeData.planets[0].norm_degree.toFixed(1)}°</p>
            <p><strong>Luna:</strong> ${horoscopeData.planets[1].sign} ${horoscopeData.planets[1].norm_degree.toFixed(1)}°</p>
          </div>

          ${zodiacHTML}
        </body>
      </html>
    `);

    const pdfTextBuffer = await textPage.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    // 3. GENERAR PDF DE MANDALA
    const mandalaBuffer = await createLayeredMandala(natalWheelData, {
      name,
      birthDate: `${day}/${month}/${year}`,
      birthTime: `${hour}:${min}`,
      birthPlace: body.birthPlace || `${lat?.toFixed(4)}°, ${lon?.toFixed(4)}°`
    });

    const mandalaPage = await browser.newPage();
    await mandalaPage.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Mandala Astral - ${name}</title>
          <style>
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
            img { max-width: 100%; max-height: 100%; }
          </style>
        </head>
        <body>
          <img src="data:image/png;base64,${mandalaBuffer.toString('base64')}" />
        </body>
      </html>
    `);

    const pdfMandalaBuffer = await mandalaPage.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });

    await browser.close();

    // 4. ENVIAR EMAIL CON AMBOS PDFs
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
          subject: `🌟 Tu Carta Astral Completa - ${name}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Tu Carta Astral Completa - Cosmikids</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #ffffff; color: #333333;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                
                <!-- Header con logo -->
                <div style="text-align: center; padding: 40px 20px 30px; background: linear-gradient(135deg, #b6a6cc 0%, #e8dff0 100%);">
                  <img src="cid:logo" alt="Cosmikids" style="max-width: 200px; height: auto; margin-bottom: 15px;">
                  <h1 style="color: #4b454f; font-size: 28px; margin: 0; font-weight: normal;">
                    ✨ Tu Carta Astral Completa ✨
                  </h1>
                </div>

                <!-- Contenido principal -->
                <div style="padding: 40px 30px;">
                  <h2 style="color: #b6a6cc; font-size: 24px; margin-bottom: 20px; text-align: center;">
                    ¡Hola ${name}! 🌙
                  </h2>
                  
                  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; text-align: center;">
                    Gracias por confiar en <strong>Cosmikids</strong>. Adjunto encontrarás tu carta astral completa 
                    con dos documentos especiales creados especialmente para ti.
                  </p>

                  <!-- Caja destacada -->
                  <div style="background-color: #f8f6fc; border-left: 4px solid #b6a6cc; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0 0 10px 0; font-size: 18px; color: #4b454f;">
                      <strong>🌟 Tu signo solar:</strong> 
                      <span style="color: #b6a6cc; font-weight: bold;">${zodiacSign.toUpperCase()}</span>
                    </p>
                  </div>

                  <!-- PDFs incluidos -->
                  <div style="background-color: #f8f6fc; padding: 20px; margin: 25px 0; border-radius: 8px;">
                    <h3 style="color: #4b454f; font-size: 18px; margin-top: 0;">📄 Documentos incluidos:</h3>
                    <ul style="color: #4b454f; line-height: 1.6;">
                      <li><strong>📖 Guía Astrológica:</strong> Interpretación detallada de tu signo y características</li>
                      <li><strong>🌟 Mandala Visual:</strong> Tu carta natal representada artísticamente</li>
                    </ul>
                  </div>

                  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
                    ¡Esperamos que disfrutes explorando las maravillas de tu universo interior! 
                    Cada detalle ha sido cuidadosamente preparado para ayudarte a conocerte mejor.
                  </p>

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
              filename: `guia-astrologica-${name.replace(/\s/g, '-').toLowerCase()}.pdf`,
              content: Buffer.from(pdfTextBuffer)
            },
            {
              filename: `mandala-astral-${name.replace(/\s/g, '-').toLowerCase()}.pdf`,
              content: Buffer.from(pdfMandalaBuffer)
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
      message: emailSent ? `PDFs generados y enviados a ${email}` : `PDFs generados (email no configurado)`,
      zodiacSign,
      pdfTextGenerated: true,
      pdfMandalaGenerated: true,
      emailSent,
      attachments: 2
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error generando PDFs',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}