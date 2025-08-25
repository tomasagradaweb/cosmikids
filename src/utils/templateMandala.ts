import { createCanvas, loadImage } from 'canvas';
import path from 'path';

// Configuración de los signos con sus posiciones en el círculo
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', angle: 0, spanish: 'Aries' },
  { name: 'Pisces', symbol: '♓', angle: 30, spanish: 'Piscis' },
  { name: 'Aquarius', symbol: '♒', angle: 60, spanish: 'Acuario' },
  { name: 'Capricorn', symbol: '♑', angle: 90, spanish: 'Capricornio' },
  { name: 'Sagittarius', symbol: '♐', angle: 120, spanish: 'Sagitario' },
  { name: 'Scorpio', symbol: '♏', angle: 150, spanish: 'Escorpio' },
  { name: 'Libra', symbol: '♎', angle: 180, spanish: 'Libra' },
  { name: 'Virgo', symbol: '♍', angle: 210, spanish: 'Virgo' },
  { name: 'Leo', symbol: '♌', angle: 240, spanish: 'Leo' },
  { name: 'Cancer', symbol: '♋', angle: 270, spanish: 'Cancer' },
  { name: 'Gemini', symbol: '♊', angle: 300, spanish: 'Géminis' },
  { name: 'Taurus', symbol: '♉', angle: 330, spanish: 'Tauro' }
];

interface PersonalData {
  name: string;
  birthDate: string;
  birthPlace: string;
  sunSign: string;
  moonSign: string;
  ascendantSign: string;
  description?: string;
}

export async function createPersonalizedMandala(
  personalData: PersonalData,
  horoscopeData?: any
): Promise<Buffer> {
  try {
    // Cargar la plantilla limpia
    const templatePath = path.join(process.cwd(), 'public', 'limpio.png');
    const templateImage = await loadImage(templatePath);
    
    // Crear canvas del mismo tamaño que la plantilla
    const canvas = createCanvas(templateImage.width, templateImage.height);
    const ctx = canvas.getContext('2d');
    
    // Dibujar la plantilla base
    ctx.drawImage(templateImage, 0, 0);
    
    // Configuración de posiciones para el círculo
    const centerX = canvas.width / 2;
    const centerY = 358; // Centro aproximado del círculo en la plantilla
    const radius = 140; // Radio para posicionar los signos
    
    // Dibujar los símbolos y nombres de los signos
    ZODIAC_SIGNS.forEach((sign, index) => {
      // Calcular posición (ajustado para que Aries esté arriba)
      const angleRad = (sign.angle - 90) * Math.PI / 180;
      const x = centerX + radius * Math.cos(angleRad);
      const y = centerY + radius * Math.sin(angleRad);
      
      // Configurar fuente para el símbolo
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#4B454F';
      
      // Dibujar símbolo
      ctx.fillText(sign.symbol, x, y);
      
      // Configurar fuente para el nombre
      ctx.font = '12px Arial';
      ctx.fillStyle = '#666666';
      
      // Dibujar nombre encima del símbolo
      ctx.fillText(sign.spanish, x, y - 20);
    });
    
    // Agregar información personal en la parte superior
    ctx.font = 'bold 48px Georgia';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4B454F';
    ctx.fillText(personalData.sunSign.toUpperCase(), centerX, 80);
    
    // Fecha y lugar
    ctx.font = '18px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText(personalData.birthDate, centerX, 120);
    ctx.fillText(personalData.birthPlace, centerX, 145);
    
    // Información astrológica en la parte inferior
    const infoY = 605;
    const infoSpacing = 120;
    
    // Mi Sol
    ctx.font = '14px Arial';
    ctx.fillStyle = '#999999';
    ctx.textAlign = 'center';
    ctx.fillText('Mi Sol', centerX - infoSpacing, infoY);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#4B454F';
    ctx.fillText(personalData.sunSign, centerX - infoSpacing, infoY + 30);
    ctx.font = '16px Arial';
    ctx.fillText(getSymbolForSign(personalData.sunSign), centerX - infoSpacing, infoY + 55);
    
    // Mi Luna
    ctx.font = '14px Arial';
    ctx.fillStyle = '#999999';
    ctx.fillText('Mi Luna', centerX, infoY);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#4B454F';
    ctx.fillText(personalData.moonSign, centerX, infoY + 30);
    ctx.font = '16px Arial';
    ctx.fillText(getSymbolForSign(personalData.moonSign), centerX, infoY + 55);
    
    // Mi Ascendente
    ctx.font = '14px Arial';
    ctx.fillStyle = '#999999';
    ctx.fillText('Mi Ascendente', centerX + infoSpacing, infoY);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#4B454F';
    ctx.fillText(personalData.ascendantSign, centerX + infoSpacing, infoY + 30);
    ctx.font = '16px Arial';
    ctx.fillText(getSymbolForSign(personalData.ascendantSign), centerX + infoSpacing, infoY + 55);
    
    // Descripción personalizada si existe
    if (personalData.description) {
      ctx.font = 'italic 16px Georgia';
      ctx.fillStyle = '#4B454F';
      ctx.textAlign = 'center';
      const lines = wrapText(ctx as any, personalData.description, canvas.width - 100);
      lines.forEach((line, index) => {
        ctx.fillText(line, centerX, 720 + (index * 22));
      });
    }
    
    // Si hay datos del horóscopo, agregar planetas en sus posiciones
    if (horoscopeData && horoscopeData.planets) {
      drawPlanetsOnChart(ctx as any, horoscopeData.planets, centerX, centerY);
    }
    
    return canvas.toBuffer('image/png');
    
  } catch (error) {
    throw error;
  }
}

// Función auxiliar para obtener el símbolo de un signo
function getSymbolForSign(signName: string): string {
  const sign = ZODIAC_SIGNS.find(s => 
    s.spanish.toLowerCase() === signName.toLowerCase() ||
    s.name.toLowerCase() === signName.toLowerCase()
  );
  return sign ? sign.symbol : '';
}

// Función para dividir texto largo en líneas
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// Función para dibujar planetas en el mandala
function drawPlanetsOnChart(
  ctx: CanvasRenderingContext2D, 
  planets: any[], 
  centerX: number, 
  centerY: number
) {
  const planetSymbols: { [key: string]: string } = {
    'Sun': '☉',
    'Sol': '☉',
    'Moon': '☽',
    'Luna': '☽',
    'Mercury': '☿',
    'Mercurio': '☿',
    'Venus': '♀',
    'Mars': '♂',
    'Marte': '♂',
    'Jupiter': '♃',
    'Júpiter': '♃',
    'Saturn': '♄',
    'Saturno': '♄',
    'Uranus': '♅',
    'Urano': '♅',
    'Neptune': '♆',
    'Neptuno': '♆',
    'Pluto': '♇',
    'Plutón': '♇'
  };
  
  planets.forEach(planet => {
    if (planetSymbols[planet.name]) {
      // Calcular posición basada en los grados
      const angle = (planet.norm_degree - 90) * Math.PI / 180;
      const planetRadius = 100; // Radio interno para los planetas
      const x = centerX + planetRadius * Math.cos(angle);
      const y = centerY + planetRadius * Math.sin(angle);
      
      // Dibujar símbolo del planeta
      ctx.font = '16px Arial';
      ctx.fillStyle = '#B6A6CC';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(planetSymbols[planet.name], x, y);
    }
  });
}