// Sistema de colores moderno con mejor contraste
export const MODERN_COLORS = {
  // Paleta principal - azules más vibrantes
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe', 
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49'
  },
  
  // Accent colors - tonos más suaves y modernos
  accent: {
    violet: '#8b5cf6',
    emerald: '#10b981', 
    amber: '#f59e0b',
    rose: '#f43f5e',
    indigo: '#6366f1',
    cyan: '#06b6d4'
  },
  
  // Grises más cálidos para mejor legibilidad
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a'
  }
};

export const TECH_COLORS = {
  blue: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
  indigo: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800",
  violet: "bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800",
  emerald: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
  yellow: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
  purple: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
  red: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
};

export const LANGUAGE_LEVELS = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];

// Estilos modernos con mejor performance y accesibilidad
export const COMMON_STYLES = {
  // Transiciones más fluidas
  transition: 'transition-all duration-300 ease-out',
  transitionFast: 'transition-all duration-150 ease-out',
  
  // Efectos hover modernos
  hoverScale: 'hover:scale-[1.02] active:scale-[0.98]',
  hoverLift: 'hover:-translate-y-1 hover:shadow-lg',
  
  // Focus states mejorados para accesibilidad
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
  
  // Sombras más suaves y naturales
  cardShadow: 'shadow-sm shadow-gray-900/[0.03] dark:shadow-gray-900/20',
  cardShadowHover: 'hover:shadow-lg hover:shadow-gray-900/[0.06] dark:hover:shadow-gray-900/25',
  cardShadowActive: 'shadow-xl shadow-gray-900/[0.08] dark:shadow-gray-900/30',
  
  // Gradientes modernos
  gradientBg: 'bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800',
  gradientCard: 'bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900/90 dark:to-gray-800/50',
  
  // Bordes con mejor contraste
  border: 'border border-gray-200/60 dark:border-gray-700/60',
  borderHover: 'hover:border-gray-300/80 dark:hover:border-gray-600/80',
  
  // Backgrounds con glassmorphism
  glass: 'backdrop-blur-sm bg-white/80 dark:bg-gray-900/80',
  glassCard: 'backdrop-blur-md bg-white/60 dark:bg-gray-900/60',
  
  // Text colors mejorados
  textPrimary: 'text-gray-900 dark:text-gray-100',
  textSecondary: 'text-gray-600 dark:text-gray-300',
  textMuted: 'text-gray-500 dark:text-gray-400',
  textAccent: 'text-blue-600 dark:text-blue-400',
  
  // Animaciones de entrada sutiles
  slideUpEnter: 'transform translate-y-6 opacity-0',
  slideUpEnterActive: 'transform translate-y-0 opacity-100 transition-all duration-700 ease-out',
  fadeInEnter: 'opacity-0',
  fadeInEnterActive: 'opacity-100 transition-opacity duration-500 ease-out',
  scaleInEnter: 'transform scale-95 opacity-0',
  scaleInEnterActive: 'transform scale-100 opacity-100 transition-all duration-600 ease-out'
};

// Configuración de breakpoints (sincronizada con Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};