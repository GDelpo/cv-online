/**
 * Utilidades comunes para componentes
 * Funciones reutilizables que se usan en múltiples componentes
 */

/**
 * Genera una key única para elementos de lista
 * @param {string} prefix - Prefijo para la key
 * @param {number} index - Índice del elemento
 * @param {any} item - Elemento para extraer identificador único
 * @returns {string} Key única
 */
export const generateKey = (prefix, index, item) => {
  if (typeof item === 'string') {
    return `${prefix}-${index}-${item.slice(0, 10).replace(/\s+/g, '-')}`;
  }
  
  if (typeof item === 'object' && item !== null) {
    const identifier = item.id || item.name || item.title || item.company || 
                      item.language || item.text || Object.keys(item)[0];
    return `${prefix}-${index}-${String(identifier).slice(0, 15).replace(/\s+/g, '-')}`;
  }
  
  return `${prefix}-${index}`;
};

/**
 * Combina nombres de clases CSS de forma condicional
 * @param {...(string|boolean|null|undefined)} classes - Clases a combinar
 * @returns {string} Clases combinadas
 */
export const cn = (...classes) => {
  return classes
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Valida si un array tiene elementos válidos
 * @param {any} array - Array a validar
 * @param {string} componentName - Nombre del componente para logging
 * @returns {boolean} True si es válido
 */
export const validateArray = (array, componentName = 'Component') => {
  if (!Array.isArray(array)) {
    console.warn(`${componentName}: Expected array, received ${typeof array}`);
    return false;
  }
  
  if (array.length === 0) {
    console.warn(`${componentName}: Array is empty`);
    return false;
  }
  
  return true;
};

/**
 * Valida si un objeto tiene las propiedades requeridas
 * @param {object} obj - Objeto a validar
 * @param {string[]} requiredProps - Propiedades requeridas
 * @param {string} componentName - Nombre del componente para logging
 * @returns {boolean} True si es válido
 */
export const validateObject = (obj, requiredProps = [], componentName = 'Component') => {
  if (!obj || typeof obj !== 'object') {
    console.warn(`${componentName}: Expected object, received ${typeof obj}`);
    return false;
  }
  
  const missingProps = requiredProps.filter(prop => !obj[prop]);
  if (missingProps.length > 0) {
    console.warn(`${componentName}: Missing required properties: ${missingProps.join(', ')}`);
    return false;
  }
  
  return true;
};

/**
 * Formatea texto para mostrar en componentes
 * @param {string} text - Texto a formatear
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto formateado
 */
export const formatText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  
  return text.length > maxLength 
    ? `${text.slice(0, maxLength).trim()}...`
    : text;
};

/**
 * Formatea período de tiempo
 * @param {string} period - Período a formatear
 * @returns {string} Período formateado
 */
export const formatPeriod = (period) => {
  if (!period) return '';
  
  // Si ya está en formato "YYYY - YYYY" o "YYYY - Presente", devolverlo
  if (period.includes(' - ')) return period;
  
  // Si es solo un año, asumimos que es "YYYY - Presente"
  if (/^\d{4}$/.test(period)) return `${period} - Presente`;
  
  return period;
};

/**
 * Obtiene el color por defecto para diferentes tipos de badges
 * @param {string} type - Tipo de badge (language, technology, skill, etc.)
 * @returns {string} Color por defecto
 */
export const getDefaultColor = (type) => {
  const colorMap = {
    language: 'blue',
    technology: 'indigo',
    skill: 'emerald',
    certification: 'violet',
    education: 'cyan',
    experience: 'slate',
    default: 'blue'
  };
  
  return colorMap[type] || colorMap.default;
};

/**
 * Hook personalizado para logging con contexto
 * @param {string} componentName - Nombre del componente
 * @returns {object} Funciones de logging
 */
export const useLogger = (componentName) => {
  const createLogger = (level) => (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${componentName}: ${message}`;
    
    if (data) {
      console[level](logMessage, data);
    } else {
      console[level](logMessage);
    }
  };

  return {
    info: createLogger('info'),
    warn: createLogger('warn'),
    error: createLogger('error'),
    debug: createLogger('debug')
  };
};