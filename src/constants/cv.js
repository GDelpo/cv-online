/**
 * @deprecated Este archivo se mantiene para compatibilidad hacia atrás.
 * Los datos del CV ahora están organizados en módulos separados en /src/data/
 * Usa: import { cvData } from '@/data' en su lugar
 */

// Re-exportamos todo desde la nueva estructura modular
export { cvData, TECH_COLORS, LANGUAGE_LEVELS, TECH_CATEGORY_COLORS } from '../data/index.js';