// Mediopunto: vitral de abanico colonial cubano. Plomo calido, cristal ambar (luz) y cristal azul (sin luz).
export const color = {
  lead: '#12100E', // fondo, plomo calido
  wall: '#1C1916', // superficie
  wall2: '#26221E', // elevado
  line: '#0A0908', // lineas de plomo entre cristales
  cal: '#F1EBDD', // texto
  smoke: '#A39B8C', // texto secundario

  glassOn: '#E9A23B', // luz
  glassOnDeep: '#C9791F',
  glassOff: '#232A3A', // sin luz
  glassOffEdge: '#3D5BB8',
  offText: '#8FA6FF',
  ruby: '#C63A33', // proximo cambio, unico uso del rojo

  // solo para el aro ornamental y el icono
  cobalt: '#2347B5',
  bottle: '#1D7C5C',
  turquoise: '#2AA5A0',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 6, md: 12, lg: 20 } as const;

export const font = {
  display: 'BarlowCondensed_800ExtraBold',
  displayMedium: 'BarlowCondensed_600SemiBold',
  body: undefined, // Roboto del sistema
} as const;
