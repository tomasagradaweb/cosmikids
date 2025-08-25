import { NextResponse } from 'next/server';

function getSunSignFromAPI(horoscopeData: any): string {
  const sun = horoscopeData.planets.find((planet: any) => planet.name === 'Sol');
  
  if (!sun) {
    return 'aries';
  }
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

export default async function ProcessHoroscope() {
  const shopifyData = {
    day: 15,
    month: 4,
    year: 1990,
    hour: 10,
    min: 30,
    lat: 40.4168,
    lon: -3.7038,
    tzone: 1,
    name: "Juan Pérez",
    email: "juan@example.com"
  };
  const auth = Buffer.from(`${process.env.ASTROLOGY_USER_ID}:${process.env.ASTROLOGY_API_KEY}`).toString('base64');
  
  try {
    const response = await fetch(`${process.env.ASTROLOGY_API_URL}/western_horoscope`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'es'
      },
      body: JSON.stringify({
        day: shopifyData.day,
        month: shopifyData.month,
        year: shopifyData.year,
        hour: shopifyData.hour,
        min: shopifyData.min,
        lat: shopifyData.lat,
        lon: shopifyData.lon,
        tzone: shopifyData.tzone
      })
    });

    const horoscopeData = await response.json();
    
    const zodiacSign = getSunSignFromAPI(horoscopeData);
    
    // Cargar componentes usando el util
    const { loadZodiacComponents } = await import('@/utils/zodiacComponents');
    const components = await loadZodiacComponents(zodiacSign as any);
    
    
    if (components.length > 0) {
      components.forEach((_, index) => {
        const etapas = ['Bebé', 'Niño', 'Adolescente', 'Adulto'];
      });
    } else {
    }

    return {
      success: true,
      zodiacSign,
      horoscopeData
    };

  } catch (error) {
    return {
      success: false,
      error: 'Error procesando horóscopo'
    };
  }
}