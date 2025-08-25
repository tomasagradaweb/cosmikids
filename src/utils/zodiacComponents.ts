import { ComponentType } from 'react';

// Tipos para las etapas
export type ZodiacStage = 'bebe' | 'niño' | 'adolescente' | 'adulto';

// Interfaz para props de componentes zodiacales
export interface ZodiacComponentProps {
  data: {
    name: string;
    email: string;
    birthDate: string;
    birthTime: string;
    horoscopeData: any;
    zodiacSign: string;
  };
}

// Mapa de signos zodiacales
export const zodiacSigns = [
  'aries', 'tauro', 'geminis', 'cancer', 'leo', 'virgo',
  'libra', 'escorpio', 'sagitario', 'capricornio', 'acuario', 'piscis'
] as const;

export type ZodiacSign = typeof zodiacSigns[number];

// Función para cargar componentes dinámicamente
export async function loadZodiacComponents(sign: ZodiacSign): Promise<ComponentType<ZodiacComponentProps>[]> {
  const components: ComponentType<ZodiacComponentProps>[] = [];
  
  try {
    // Cargar etapa-bebe para cada signo
    const etapaBebe = await import(`@/components/${sign}/etapa-bebe`);
    components.push(etapaBebe.default);
    
    // Intentar cargar otras etapas si existen
    const etapas = ['etapa-niño', 'etapa-adolescente', 'etapa-adulto'];
    
    for (const etapa of etapas) {
      try {
        const component = await import(`@/components/${sign}/${etapa}`);
        components.push(component.default);
      } catch (error) {
      }
    }
    
    
  } catch (error) {
  }
  
  return components;
}

// Función para obtener nombres de archivos esperados
export function getExpectedFiles(sign: ZodiacSign): string[] {
  return [
    `src/components/${sign}/etapa-bebe.tsx`,
    `src/components/${sign}/etapa-niño.tsx`,
    `src/components/${sign}/etapa-adolescente.tsx`,
    `src/components/${sign}/etapa-adulto.tsx`
  ];
}

// Función para verificar si un signo tiene todos los componentes
export async function hasAllComponents(sign: ZodiacSign): Promise<boolean> {
  const components = await loadZodiacComponents(sign);
  return components.length === 4;
}