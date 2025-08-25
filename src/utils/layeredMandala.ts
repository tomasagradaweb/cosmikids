import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

// Registrar fuentes con rutas correctas
try {
  registerFont(path.join(process.cwd(), 'public', 'fonts', 'IBM_Plex_Sans', 'IBMPlexSans-Regular.ttf'), { family: 'IBM Plex Sans' });
  registerFont(path.join(process.cwd(), 'public', 'fonts', 'IBM_Plex_Sans', 'IBMPlexSans-Bold.ttf'), { family: 'IBM Plex Sans', weight: 'bold' });
  registerFont(path.join(process.cwd(), 'public', 'fonts', 'Nunito', 'Nunito-Regular.ttf'), { family: 'Nunito' });
  registerFont(path.join(process.cwd(), 'public', 'fonts', 'Nunito', 'Nunito-SemiBold.ttf'), { family: 'Nunito', weight: '600' });
  registerFont(path.join(process.cwd(), 'public', 'fonts', 'Nunito', 'Nunito-Bold.ttf'), { family: 'Nunito', weight: 'bold' });
  registerFont(path.join(process.cwd(), 'public', 'fonts', 'Rosmatika.ttf'), { family: 'Rosmatika' });
} catch (error) {
  // Font registration failed - will fallback to default fonts
}

// Configuración de los signos con sus posiciones en las celdas del mandala detalles
const ZODIAC_POSITIONS = [
  { name: 'aries', angle: 0, cellRadius: 120, cellAngle: 0 },       
  { name: 'tauro', angle: 30, cellRadius: 120, cellAngle: 30 },     
  { name: 'géminis', angle: 60, cellRadius: 120, cellAngle: 60 },   
  { name: 'cáncer', angle: 90, cellRadius: 120, cellAngle: 90 },    
  { name: 'leo', angle: 120, cellRadius: 120, cellAngle: 120 },     
  { name: 'virgo', angle: 150, cellRadius: 120, cellAngle: 150 },   
  { name: 'libra', angle: 180, cellRadius: 120, cellAngle: 180 },   
  { name: 'escorpio', angle: 210, cellRadius: 120, cellAngle: 210 }, 
  { name: 'sagitario', angle: 240, cellRadius: 120, cellAngle: 240 }, 
  { name: 'capricornio', angle: 270, cellRadius: 120, cellAngle: 270 }, 
  { name: 'acuario', angle: 300, cellRadius: 120, cellAngle: 300 },  
  { name: 'piscis', angle: 330, cellRadius: 120, cellAngle: 330 }    
];

// Mapeo de nombres a archivos
const SIGN_MAPPING: { [key: string]: string } = {
  'Aries': 'aries',
  'Taurus': 'tauro', 
  'Tauro': 'tauro',
  'Gemini': 'geminis',     
  'Géminis': 'geminis',    
  'Cancer': 'cáncer',      
  'Cáncer': 'cáncer',      
  'Leo': 'leo',
  'Virgo': 'virgo',
  'Libra': 'libra',
  'Scorpio': 'escorpio',
  'Escorpio': 'escorpio',
  'Sagittarius': 'sagitario',
  'Sagitario': 'sagitario',
  'Capricorn': 'capricornio',
  'Capricornio': 'capricornio',
  'Aquarius': 'acuario',
  'Acuario': 'acuario', 
  'Pisces': 'piscis',
  'Piscis': 'piscis'
};

// Características astrológicas para el texto personalizado
const ASTROLOGICAL_TRAITS = {
  ascendente: {
    'Aries': 'valor',
    'Taurus': 'calma',
    'Gemini': 'curiosidad',
    'Cancer': 'cuidado',
    'Leo': 'presencia',
    'Virgo': 'claridad',
    'Libra': 'armonía',
    'Scorpio': 'intensidad',
    'Sagittarius': 'entusiasmo',
    'Capricorn': 'logro',
    'Aquarius': 'innovación',
    'Pisces': 'intuición'
  },
  luna: {
    'Aries': 'acción',
    'Taurus': 'comodidad',
    'Gemini': 'aprender',
    'Cancer': 'calor de hogar',
    'Leo': 'reconocimiento',
    'Virgo': 'orden',
    'Libra': 'equilibrio',
    'Scorpio': 'conexiones profundas',
    'Sagittarius': 'aventuras',
    'Capricorn': 'reglas claras',
    'Aquarius': 'su espacio personal',
    'Pisces': 'evadirse'
  },
  sol: {
    'Aries': 'tiene valor',
    'Taurus': 'conecta con su cuerpo',
    'Gemini': 'comparte',
    'Cancer': 'protege',
    'Leo': 'es reconocido',
    'Virgo': 'mejora las cosas',
    'Libra': 'encuentra equilibrio',
    'Scorpio': 'transforma',
    'Sagittarius': 'explora',
    'Capricorn': 'alcanza sus metas',
    'Aquarius': 'imagina soluciones',
    'Pisces': 'crea desde su intuición'
  }
};

interface PersonalData {
  name: string;
  birthDate: string;
  birthPlace: string;
  provincia?: string;
  sunSign: string;
  moonSign: string;
  ascendantSign: string;
  description?: string;
}

export async function createLayeredMandala(
  personalData: PersonalData,
  horoscopeData?: any
): Promise<Buffer> {
  try {
    // Cargar todas las capas base
    const fondoPath = path.join(process.cwd(), 'public', 'fondos', 'Fondo sin palabras.jpg');
    const mandalaBasePath = path.join(process.cwd(), 'public', 'fondos', 'base mandala.png');
    const mandalaDetallesPath = path.join(process.cwd(), 'public', 'fondos', 'mandala detalles.png');
    
    const [fondoImage, mandalaBaseImage, mandalaDetallesImage] = await Promise.all([
      loadImage(fondoPath),
      loadImage(mandalaBasePath),
      loadImage(mandalaDetallesPath)
    ]);
    
    // Crear canvas del tamaño del fondo
    const canvas = createCanvas(fondoImage.width, fondoImage.height);
    const ctx = canvas.getContext('2d');
    
    // 1. Dibujar el fondo
    ctx.drawImage(fondoImage as any, 0, 0);
    
    // 2. Calcular posición del mandala (centrado) - SUBIDO 150px adicionales para dejar espacio arriba
    const mandalaX = (canvas.width - mandalaBaseImage.width) / 2;
    const mandalaY = (canvas.height - mandalaBaseImage.height) / 2 - 50 - 350; // Subir mandala 350px adicionales
    
    // 3. Dibujar el círculo base del mandala
    ctx.drawImage(mandalaBaseImage as any, mandalaX, mandalaY);
    
    // 4. Dibujar mandala detalles.png centrado encima del base mandala.png
    const detallesX = mandalaX + (mandalaBaseImage.width - mandalaDetallesImage.width) / 2;
    const detallesY = mandalaY + (mandalaBaseImage.height - mandalaDetallesImage.height) / 2;
    ctx.drawImage(mandalaDetallesImage as any, detallesX, detallesY);
    
    // 5. Dibujar información personal en la parte superior
    await drawPersonalInfo(ctx as any, personalData, canvas.width);
    
    // 6. Dibujar los símbolos y nombres de los signos usando datos reales de la API
    await drawZodiacSigns(ctx as any, mandalaX, mandalaY, mandalaBaseImage.width, horoscopeData);
    
    // 7. Si hay datos astrológicos, dibujar planetas
    if (horoscopeData && horoscopeData.planets) {
      await drawPlanets(ctx as any, horoscopeData.planets, mandalaX, mandalaY, mandalaBaseImage.width, horoscopeData);
    }
    
    // 8. Dibujar información astrológica en la parte inferior
    await drawAstrologicalInfo(ctx as any, personalData, canvas.width, canvas.height);
    
    return canvas.toBuffer('image/png');
    
  } catch (error) {
    throw error;
  }
}

// Función para dibujar información personal en la parte superior
async function drawPersonalInfo(ctx: CanvasRenderingContext2D, personalData: PersonalData, canvasWidth: number) {
  const centerX = canvasWidth / 2;
  
  // Extraer solo el primer nombre
  const firstName = personalData.name.split(' ')[0];
  
  // Nombre principal - 150px con Georgia Bold
  ctx.font = 'bold 150px Georgia';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#4B454F';
  ctx.fillText(firstName.toUpperCase(), centerX, 240);
  
  // Fecha - 90px con Nunito Regular
  ctx.font = '90px "Nunito", Arial';
  ctx.fillStyle = '#666666';
  ctx.fillText(personalData.birthDate, centerX, 350);
  
  // Lugar - 90px con Nunito Regular
  ctx.font = '90px "Nunito", Arial';
  const locationText = personalData.provincia 
    ? `${personalData.birthPlace}, ${personalData.provincia}, España`
    : `${personalData.birthPlace}, España`;
  ctx.fillText(locationText, centerX, 440);
}

// Función para dibujar los signos del zodíaco
async function drawZodiacSigns(ctx: CanvasRenderingContext2D, mandalaX: number, mandalaY: number, mandalaSize: number, horoscopeData?: any) {
  if (!horoscopeData?.houses || horoscopeData.houses.length < 12) {
    return;
  }
  
  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  // Obtener el grado ABSOLUTO del Ascendente (Casa 1)
  const ascendantAbsoluteDegree = horoscopeData.ascendant || horoscopeData.houses[0].degree;
  const ascendantSign = horoscopeData.houses[0].sign;
  
  // Centro del mandala detalles
  const centerX = mandalaX + mandalaSize / 2;
  const centerY = mandalaY + mandalaSize / 2;
  const symbolRadius = 640; // Radio para símbolos
  const nameRadius = 685;   // Radio para nombres
  
  const fineAdjustment = 0;
  
  for (const zodiacSign of zodiacSigns) {
    try {
      // Calcular grados absolutos para el CENTRO del signo
      const signIndex = zodiacSigns.indexOf(zodiacSign);
      const signCenterAbsolute = signIndex * 30 + 15;
      
      // Calcular ángulo relativo desde el Ascendente
      const relativeAngleCenter = getPlanetAngleFromAbsolute(ascendantAbsoluteDegree, signCenterAbsolute);
      
      // Convertir a ángulo del canvas (Ascendente = 270° = 9:00)
      const rotationOffset = 7.5;
      const canvasAngleCenter = (270 - relativeAngleCenter + fineAdjustment + rotationOffset + 360) % 360;
      let adjustedDegree = canvasAngleCenter;
      if (adjustedDegree < 0) adjustedDegree += 360;
      
      const angleRad = (canvasAngleCenter - 90) * Math.PI / 180;
      
      const signName = getSignFileName(zodiacSign, 'signos');
      
      // 1. DIBUJAR SÍMBOLO
      try {
        const symbolPath = path.join(process.cwd(), 'public', 'signos', `${signName}_.png`);
        const symbolImage = await loadImage(symbolPath);
        
        const symbolX = centerX + symbolRadius * Math.cos(angleRad);
        const symbolY = centerY + symbolRadius * Math.sin(angleRad);
        
        ctx.save();
        ctx.translate(symbolX, symbolY);
        ctx.rotate(angleRad + Math.PI / 2);
        
        const iconScale = 0.9;
        const scaledWidth = symbolImage.width * iconScale;
        const scaledHeight = symbolImage.height * iconScale;
        
        ctx.drawImage(symbolImage as any as any, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
        ctx.restore();
        
      } catch (symbolError) {
        // Symbol loading failed
      }
      
      // 2. DIBUJAR NOMBRE
      try {
        const namePath = path.join(process.cwd(), 'public', 'signos', `${signName}.png`);
        const nameImage = await loadImage(namePath);
        
        const nameX = centerX + nameRadius * Math.cos(angleRad);
        const nameY = centerY + nameRadius * Math.sin(angleRad);
        
        ctx.save();
        ctx.translate(nameX, nameY);
        ctx.rotate(angleRad + Math.PI / 2);
        ctx.drawImage(nameImage as any, -nameImage.width / 2, -nameImage.height / 2);
        ctx.restore();
        
      } catch (nameError) {
        // Name loading failed
      }
      
    } catch (error) {
      // Sign processing failed
    }
  }
}

// Función simplificada para dibujar planetas
async function drawPlanets(
  ctx: CanvasRenderingContext2D, 
  planets: any[], 
  mandalaX: number, 
  mandalaY: number,
  mandalaSize: number,
  horoscopeData: any
) {
  if (!horoscopeData?.houses?.[0]) {
    return;
  }
  
  // Obtener el grado ABSOLUTO del Ascendente
  const ascendantAbsoluteDegree = horoscopeData.ascendant || horoscopeData.houses[0].degree;
  
  const allowedPlanets = [
    'Sun', 'Sol', 'Moon', 'Luna', 'Mercury', 'Mercurio', 'Venus',
    'Mars', 'Marte', 'Jupiter', 'Júpiter', 'Saturn', 'Saturno',
    'Uranus', 'Urano', 'Neptune', 'Neptuno', 'Pluto', 'Plutón'
  ];

  const getPlanetImageFile = (planetName: string): string => {
    const imageMap: { [key: string]: string } = {
      'Sun': 'sol.png', 'Sol': 'sol.png',
      'Moon': 'luna.png', 'Luna': 'luna.png',
      'Mercury': 'mercurio.png', 'Mercurio': 'mercurio.png',
      'Venus': 'venus.png',
      'Mars': 'marte.png', 'Marte': 'marte.png',
      'Jupiter': 'jupiter.png', 'Júpiter': 'jupiter.png',
      'Saturn': 'saturno.png', 'Saturno': 'saturno.png',
      'Uranus': 'urano.png', 'Urano': 'urano.png',
      'Neptune': 'neptuno.png', 'Neptuno': 'neptuno.png',
      'Pluto': 'pluto.png', 'Plutón': 'pluto.png'
    };
    
    return imageMap[planetName] || 'mercury';
  };

  const centerX = mandalaX + mandalaSize / 2;
  const centerY = mandalaY + mandalaSize / 2;
  
  const validPlanets = planets.filter(planet => 
    allowedPlanets.includes(planet.name) && planet.full_degree !== undefined
  );
  
  // NUEVO SISTEMA: separación por radio, manteniendo ángulos exactos
  const planetPositions: { x: number, y: number, planet: any }[] = [];
  
  // Ordenar por grados para mantener orden astronómico
  const sortedPlanets = [...validPlanets].sort((a, b) => a.full_degree - b.full_degree);
  
  sortedPlanets.forEach((planet, index) => {
    // Usar grados EXACTOS - sin cambios
    const planetAbsoluteDegree = planet.full_degree;
    const relativeAngle = getPlanetAngleFromAbsolute(ascendantAbsoluteDegree, planetAbsoluteDegree);
    const canvasAngle = (270 - relativeAngle + 360) % 360;
    
    // Radio base según tipo - REDUCIDOS para más compacto
    let baseRadius;
    if (planet.name === 'Sun') {
      baseRadius = 456; // Sol aún más exterior (+3px)
    } else if (planet.name === 'Moon') {
      baseRadius = 400; // Luna mantiene posición
    } else if (['Mercury', 'Mercurio'].includes(planet.name)) {
      baseRadius = 415; // Mercurio más exterior
    } else if (planet.name === 'Venus') {
      baseRadius = 402; // Venus aún más interior
    } else if (['Mars', 'Marte'].includes(planet.name)) {
      baseRadius = 445; // Marte aún más exterior
    } else if (['Saturn', 'Saturno'].includes(planet.name)) {
      baseRadius = 400; // Saturno a 400px
    } else if (['Pluto', 'Plutón'].includes(planet.name)) {
      baseRadius = 450; // Plutón al mismo nivel que el Sol
    } else if (['Jupiter', 'Júpiter'].includes(planet.name)) {
      baseRadius = 418; // Jupiter mucho más interior
    } else if (['Uranus', 'Urano'].includes(planet.name)) {
      baseRadius = 440; // Urano mucho más exterior
    } else {
      baseRadius = 430; // Otros planetas exteriores (Neptuno)
    }
    
    // Sistema SUAVE de separación manteniendo posiciones astronómicas
    let radius = baseRadius;
    let radiusOffset = 0;
    
    // Solo detectar planetas MUY cercanos (menos de 5°)
    const veryNearPlanets = sortedPlanets.filter(otherPlanet => {
      const angleDiff = Math.abs(planet.full_degree - otherPlanet.full_degree);
      return angleDiff < 5; // Solo muy cercanos
    });
    
    if (veryNearPlanets.length > 1) {
      // Separación MUY SUAVE para mantener posiciones naturales
      const positionInGroup = veryNearPlanets.findIndex(p => p.full_degree === planet.full_degree);
      
      // Micro-ajustes muy pequeños
      radiusOffset = positionInGroup * 12; // Solo 12px entre cada uno
    }
    
    radius = baseRadius + radiusOffset; // Sin límites agresivos
    
    // Calcular posición final
    const angleRad = (canvasAngle - 90) * Math.PI / 180;
    const x = centerX + radius * Math.cos(angleRad);
    const y = centerY + radius * Math.sin(angleRad);
    
    planetPositions.push({ x, y, planet });
  });

  // Draw planets
  for (const { x, y, planet } of planetPositions) {
    const planetImageFile = getPlanetImageFile(planet.name);
    
    if (planetImageFile) {
      try {
        const planetImagePath = path.join(process.cwd(), 'public', 'planetas', planetImageFile);
        const planetImage = await loadImage(planetImagePath);
        
        const aspectRatio = planetImage.width / planetImage.height;
        
        let desiredHeight;
        if (planet.name === 'Sun') {
          desiredHeight = 32; // Sol aún más pequeño
        } else if (planet.name === 'Moon') {
          desiredHeight = 42; // Luna mantiene tamaño
        } else if (['Mercury', 'Venus', 'Mars'].includes(planet.name)) {
          desiredHeight = 36;
        } else {
          desiredHeight = 32;
        }
        const scaledWidth = desiredHeight * aspectRatio;
        
        ctx.drawImage(
          planetImage as any, 
          x - scaledWidth / 2, 
          y - desiredHeight / 2, 
          scaledWidth, 
          desiredHeight
        );
        
      } catch (error) {
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#4B454F';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(planet.name, x, y);
      }
    }
  }
}

// Función para dibujar información astrológica en la parte inferior
async function drawAstrologicalInfo(
  ctx: CanvasRenderingContext2D, 
  personalData: PersonalData, 
  canvasWidth: number, 
  canvasHeight: number
) {
  const centerX = canvasWidth / 2;
  const infoY = canvasHeight - 260 - 700;
  
  // Columnas MÁS JUNTAS pero equidistantes
  const totalWidth = canvasWidth * 0.6;
  const columnSeparation = totalWidth / 3;
  const startX = centerX - (totalWidth / 2);
  const solX = startX + (columnSeparation / 2);
  const lunaX = centerX;
  const ascendenteX = startX + totalWidth - (columnSeparation / 2);
  
  const headerY = infoY - 200;
  const symbolY = infoY - 50;
  const textY = infoY + 100;
  
  // Configurar tipografía para headers
  ctx.font = '60px "Nunito", Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#4B454F';
  
  // COLUMNA 1: MI SOL
  try {
    ctx.fillText('Mi Sol', solX, headerY);
    
    const sunSignFile = getSignFileName(personalData.sunSign, 'abajo');
    const sunIconImage = await loadImage(path.join(process.cwd(), 'public', 'abajo', `${sunSignFile}_.png`));
    ctx.drawImage(sunIconImage as any, solX - 50, symbolY - 50, 100, 100);
    
    ctx.font = '50px "Nunito", Arial';
    ctx.fillStyle = '#666666';
    const sunSignSpanish = translateSignToSpanish(personalData.sunSign);
    const sunSignCapitalized = sunSignSpanish.charAt(0).toUpperCase() + sunSignSpanish.slice(1).toLowerCase();
    ctx.fillText(sunSignCapitalized, solX, textY);
    
  } catch (error) {
    // Sol section error
  }

  // COLUMNA 2: MI LUNA
  try {
    ctx.font = '60px "Nunito", Arial';
    ctx.fillStyle = '#4B454F';
    
    ctx.fillText('Mi Luna', lunaX, headerY);
    
    const moonSignFile = getSignFileName(personalData.moonSign, 'abajo');
    const moonIconImage = await loadImage(path.join(process.cwd(), 'public', 'abajo', `${moonSignFile}_.png`));
    ctx.drawImage(moonIconImage as any, lunaX - 50, symbolY - 50, 100, 100);
    
    ctx.font = '50px "Nunito", Arial';
    ctx.fillStyle = '#666666';
    const moonSignSpanish = translateSignToSpanish(personalData.moonSign);
    const moonSignCapitalized = moonSignSpanish.charAt(0).toUpperCase() + moonSignSpanish.slice(1).toLowerCase();
    ctx.fillText(moonSignCapitalized, lunaX, textY);
    
  } catch (error) {
    // Luna section error
  }

  // COLUMNA 3: MI ASCENDENTE
  try {
    ctx.font = '60px "Nunito", Arial';
    ctx.fillStyle = '#4B454F';
    
    ctx.fillText('Mi Ascendente', ascendenteX, headerY);
    
    const ascSignFile = getSignFileName(personalData.ascendantSign, 'abajo');
    const ascIconImage = await loadImage(path.join(process.cwd(), 'public', 'abajo', `${ascSignFile}_.png`));
    ctx.drawImage(ascIconImage as any, ascendenteX - 50, symbolY - 50, 100, 100);
    
    ctx.font = '50px "Nunito", Arial';
    ctx.fillStyle = '#666666';
    const ascSignSpanish = translateSignToSpanish(personalData.ascendantSign);
    const ascSignCapitalized = ascSignSpanish.charAt(0).toUpperCase() + ascSignSpanish.slice(1).toLowerCase();
    ctx.fillText(ascSignCapitalized, ascendenteX, textY);
    
  } catch (error) {
    // Ascendente section error
  }
  
  // 4. TEXTO PERSONALIZADO DEBAJO DE LOS BLOQUES
  try {
    // Obtener características de cada signo
    const ascendenteTrait = (ASTROLOGICAL_TRAITS.ascendente as any)[personalData.ascendantSign] || 'presencia';
    const lunaTrait = (ASTROLOGICAL_TRAITS.luna as any)[personalData.moonSign] || 'equilibrio';
    const solTrait = (ASTROLOGICAL_TRAITS.sol as any)[personalData.sunSign] || 'brilla';
    
    // Dividir el texto en dos líneas
    const line1 = `Proyecta ${ascendenteTrait}, necesita ${lunaTrait} y brilla`;
    const line2 = `cuando ${solTrait}.`;
    
    const personalTextY = textY + 300;
    
    ctx.font = '65px "Rosmatika", "Nunito", Arial';
    ctx.fillStyle = '#4B454F';
    ctx.textAlign = 'center';
    
    ctx.fillText(line1, centerX, personalTextY);
    ctx.fillText(line2, centerX, personalTextY + 80);
    
  } catch (error) {
    // Personalized text error
  }
}

// Función CORREGIDA para usar grados absolutos de la API
function getPlanetAngleFromAbsolute(ascendantAbsoluteDegree: number, planetAbsoluteDegree: number): number {
  // Calcular la diferencia relativa desde el Ascendente
  let relativeDegrees = planetAbsoluteDegree - ascendantAbsoluteDegree;
  
  // Normalizar a 0-360°
  if (relativeDegrees < 0) relativeDegrees += 360;
  if (relativeDegrees >= 360) relativeDegrees -= 360;
  
  return relativeDegrees;
}

// Función auxiliar para convertir signo a nombre de archivo
export function getSignFileName(signName: string, forFolder: 'signos' | 'abajo' = 'abajo'): string {
  if (forFolder === 'signos') {
    const signMappingWithAccents: { [key: string]: string } = {
      'Aries': 'aries',
      'Taurus': 'tauro',
      'Gemini': 'géminis',
      'Cancer': 'cáncer',
      'Leo': 'leo',
      'Virgo': 'virgo',
      'Libra': 'libra',
      'Scorpio': 'escorpio',
      'Sagittarius': 'sagitario',
      'Capricorn': 'capricornio',
      'Aquarius': 'acuario',
      'Pisces': 'piscis'
    };
    return signMappingWithAccents[signName] || signName.toLowerCase();
  }
  return SIGN_MAPPING[signName] || signName.toLowerCase();
}

// Función para traducir nombre de signo de inglés a español
function translateSignToSpanish(signName: string): string {
  const translations: { [key: string]: string } = {
    'Aries': 'Aries',
    'Taurus': 'Tauro',
    'Gemini': 'Géminis',
    'Cancer': 'Cáncer',
    'Leo': 'Leo',
    'Virgo': 'Virgo',
    'Libra': 'Libra',
    'Scorpio': 'Escorpio',
    'Sagittarius': 'Sagitario',
    'Capricorn': 'Capricornio',
    'Aquarius': 'Acuario',
    'Pisces': 'Piscis'
  };
  return translations[signName] || signName;
}