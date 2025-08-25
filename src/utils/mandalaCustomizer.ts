import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

// Configuración de los signos con sus posiciones angulares
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', angle: 0, spanish: 'Aries' },
  { name: 'Taurus', symbol: '♉', angle: 30, spanish: 'Tauro' },
  { name: 'Gemini', symbol: '♊', angle: 60, spanish: 'Géminis' },
  { name: 'Cancer', symbol: '♋', angle: 90, spanish: 'Cáncer' },
  { name: 'Leo', symbol: '♌', angle: 120, spanish: 'Leo' },
  { name: 'Virgo', symbol: '♍', angle: 150, spanish: 'Virgo' },
  { name: 'Libra', symbol: '♎', angle: 180, spanish: 'Libra' },
  { name: 'Scorpio', symbol: '♏', angle: 210, spanish: 'Escorpio' },
  { name: 'Sagittarius', symbol: '♐', angle: 240, spanish: 'Sagitario' },
  { name: 'Capricorn', symbol: '♑', angle: 270, spanish: 'Capricornio' },
  { name: 'Aquarius', symbol: '♒', angle: 300, spanish: 'Acuario' },
  { name: 'Pisces', symbol: '♓', angle: 330, spanish: 'Piscis' }
];

interface CustomizationOptions {
  showNames?: boolean;
  showSymbols?: boolean;
  nameColor?: string;
  fontSize?: number;
  fontFamily?: string;
  language?: 'es' | 'en';
  highlightSign?: string;
  highlightColor?: string;
}

export async function customizeMandala(
  mandalaUrl: string,
  options: CustomizationOptions = {}
): Promise<Buffer> {
  const {
    showNames = true,
    showSymbols = false,
    nameColor = '#4B454F',
    fontSize = 14,
    fontFamily = 'Arial',
    language = 'es',
    highlightSign = null,
    highlightColor = '#B6A6CC'
  } = options;

  try {
    // Cargar la imagen del mandala
    const response = await fetch(mandalaUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const image = await loadImage(buffer);
    
    // Crear canvas del mismo tamaño
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    // Dibujar la imagen original
    ctx.drawImage(image, 0, 0);
    
    // Configurar el texto
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Centro del círculo
    const centerX = image.width / 2;
    const centerY = image.height / 2;
    
    // Radio para posicionar los nombres (ajustar según el diseño del mandala)
    const radius = image.width * 0.45; // 45% del ancho para estar justo fuera del círculo
    
    // Dibujar los nombres de los signos con efecto radial
    ZODIAC_SIGNS.forEach(sign => {
      // Guardar el estado del contexto
      ctx.save();
      
      // Calcular la posición y rotación
      const angleRad = (sign.angle - 90) * Math.PI / 180;
      const x = centerX + radius * Math.cos(angleRad);
      const y = centerY + radius * Math.sin(angleRad);
      
      // Trasladar al punto donde queremos dibujar
      ctx.translate(x, y);
      
      // Rotar el texto para que siga la orientación radial del círculo
      // Cada texto se orienta perpendicular al radio (tangente al círculo)
      let rotation = angleRad + Math.PI / 2; // +90° para orientación tangencial
      
      // Si el texto quedaría al revés (parte inferior del círculo), rotarlo 180°
      if (sign.angle > 90 && sign.angle <= 270) {
        rotation += Math.PI;
      }
      
      ctx.rotate(rotation);
      
      // Determinar qué texto mostrar
      let text = '';
      if (showNames && showSymbols) {
        text = language === 'es' ? `${sign.symbol} ${sign.spanish}` : `${sign.symbol} ${sign.name}`;
      } else if (showNames) {
        text = language === 'es' ? sign.spanish : sign.name;
      } else if (showSymbols) {
        text = sign.symbol;
      }
      
      // Aplicar estilo
      if (highlightSign && sign.spanish.toLowerCase() === highlightSign.toLowerCase()) {
        ctx.fillStyle = highlightColor;
        ctx.font = `bold ${fontSize + 2}px ${fontFamily}`;
      } else {
        ctx.fillStyle = nameColor;
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
      }
      
      // Configurar sombra blanca fuerte para contraste
      ctx.shadowColor = 'rgba(255, 255, 255, 1)';
      ctx.shadowBlur = 5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      
      // No añadir fondo rectangular, solo usar sombra para contraste
      
      // Dibujar el texto centrado con borde blanco primero
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Primero dibujar el contorno blanco
      ctx.strokeText(text, 0, 0);
      
      // Luego dibujar el texto relleno
      ctx.fillStyle = highlightSign && sign.spanish.toLowerCase() === highlightSign.toLowerCase() ? highlightColor : nameColor;
      ctx.fillText(text, 0, 0);
      
      // Restaurar el estado del contexto
      ctx.restore();
    });
    
    // Agregar marca de agua opcional
    if (options.showNames) {
      ctx.font = `10px ${fontFamily}`;
      ctx.fillStyle = 'rgba(182, 166, 204, 0.5)';
      ctx.textAlign = 'right';
      ctx.fillText('Cosmikids', image.width - 10, image.height - 10);
    }
    
    // Convertir a buffer
    return canvas.toBuffer('image/png');
    
  } catch (error) {
    throw error;
  }
}

// Función helper para agregar el nombre del niño en el centro
export async function addChildNameToMandala(
  mandalaUrl: string,
  childName: string,
  options: CustomizationOptions = {}
): Promise<Buffer> {
  try {
    // Primero personalizar con los nombres de los signos
    const customizedBuffer = await customizeMandala(mandalaUrl, options);
    const image = await loadImage(customizedBuffer);
    
    // Crear nuevo canvas
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    // Dibujar la imagen personalizada
    ctx.drawImage(image, 0, 0);
    
    // Agregar el nombre del niño en el centro
    const centerX = image.width / 2;
    const centerY = image.height / 2;
    
    // Configurar estilo para el nombre
    ctx.font = `bold 24px ${options.fontFamily || 'Arial'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = options.highlightColor || '#B6A6CC';
    
    // Fondo semitransparente para el nombre
    const textMetrics = ctx.measureText(childName);
    const padding = 20;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(
      centerX - textMetrics.width / 2 - padding,
      centerY - 15,
      textMetrics.width + padding * 2,
      30
    );
    
    // Dibujar el nombre
    ctx.fillStyle = options.highlightColor || '#B6A6CC';
    ctx.fillText(childName, centerX, centerY);
    
    return canvas.toBuffer('image/png');
    
  } catch (error) {
    throw error;
  }
}