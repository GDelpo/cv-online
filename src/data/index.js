/**
 * Archivo principal que combina todos los datos del CV
 * Este es el único archivo que necesitas importar en los componentes
 */

import { personalInfo, contactInfo } from './personal.js';
import { technologies, languages, strengths } from './skills.js';
import { experiences } from './experience.js';
import { education, certifications, continuousLearning } from './education.js';

// Re-exportamos las constantes de estilos para mantener compatibilidad
export { TECH_COLORS, LANGUAGE_LEVELS, TECH_CATEGORY_COLORS } from '../constants/styles.js';

export const cvData = {
  header: personalInfo,
  contact: contactInfo,
  technologies,
  languages,
  strengths,
  experiences,
  education,
  certifications,
  continuousLearning
};