import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';
import path from 'path';

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

// Función para generar HTML estático sin React rendering
async function generateZodiacHTML(zodiacSign: string, data: any) {
  const { name, birthDate, birthTime, horoscopeData } = data;
  
  // Obtener los planetas principales
  const sun = horoscopeData.planets.find((p: any) => p.name === 'Sol');
  const moon = horoscopeData.planets.find((p: any) => p.name === 'Luna');
  const ascendant = horoscopeData.houses[0];
  
  // HTML básico para cada signo
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
  
  // HTML genérico para otros signos
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

    // Llamar a la API de astrología
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

    const horoscopeData = await response.json();
    const zodiacSign = getSunSignFromAPI(horoscopeData);

    // Generar HTML del signo
    const zodiacHTML = await generateZodiacHTML(zodiacSign, {
      name,
      email,
      birthDate: `${day}/${month}/${year}`,
      birthTime: `${hour}:${min}`,
      horoscopeData,
      zodiacSign
    });

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

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
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
          subject: `🌟 Tu Carta Astral Personalizada - ${name}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Tu Carta Astral - Cosmikids</title>
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
                    Gracias por confiar en <strong>Cosmikids</strong>. Adjunto encontrarás tu carta astral personalizada, 
                    creada especialmente para ti con todo nuestro amor cósmico.
                  </p>

                  <!-- Caja destacada -->
                  <div style="background-color: #f8f6fc; border-left: 4px solid #b6a6cc; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; font-size: 18px; color: #4b454f;">
                      <strong>🌟 Tu signo solar:</strong> 
                      <span style="color: #b6a6cc; font-weight: bold;">${zodiacSign.toUpperCase()}</span>
                    </p>
                  </div>

                  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
                    ¡Esperamos que disfrutes explorando las maravillas de tu universo interior! 
                    Cada detalle ha sido cuidadosamente preparado para ayudarte a conocerte mejor.
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
              filename: `carta-astral-${name.replace(/\s/g, '-').toLowerCase()}.pdf`,
              content: Buffer.from(pdfBuffer)
            }
          ]
        });
        emailSent = true;
      }
    } catch (emailError) {
      // Error silencioso
    }

    return NextResponse.json({
      success: true,
      message: emailSent ? `PDF generado y enviado a ${email}` : `PDF generado (email no configurado)`,
      zodiacSign,
      pdfGenerated: true,
      emailSent
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error generando PDF',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}