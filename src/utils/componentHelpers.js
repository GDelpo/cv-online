/**
 * @file Contiene funciones de utilidad comunes para componentes de React.
 * Estas funciones ayudan a generar claves, validar datos y formatear contenido.
 */

/**
 * Genera una clave única y estable para elementos de una lista en React.
 * Utiliza un prefijo, el índice y un identificador del objeto para crear la clave.
 *
 * @param {string} prefix - Un prefijo para asegurar que la clave sea única entre diferentes listas.
 * @param {number} index - El índice del elemento en la lista.
 * @param {any} item - El objeto o valor del que se extrae un identificador.
 * @returns {string} Una `key` única para el elemento.
 *
 * @example
 * // Para un array de strings:
 * // generateKey('fruit', 1, 'apple') => 'fruit-1-apple'
 *
 * // Para un array de objetos:
 * // generateKey('user', 0, { id: 123, name: 'John' }) => 'user-0-123'
 */
export const generateKey = (prefix, index, item) => {
  if (typeof item === 'string') {
    return `${prefix}-${index}-${item.slice(0, 10).replace(/\s+/g, '-')}`;
  }

  if (typeof item === 'object' && item !== null) {
    const identifier = item.id || item.name || item.title || item.company || item.language || item.text || Object.keys(item)[0];
    return `${prefix}-${index}-${String(identifier).slice(0, 15).replace(/\s+/g, '-')}`;
  }

  return `${prefix}-${index}`;
};

/**
 * Valida si un valor es un array y no está vacío.
 * Muestra una advertencia en la consola si la validación falla.
 *
 * @param {any} array - El valor a validar.
 * @param {string} [componentName='Component'] - El nombre del componente para incluir en el mensaje de advertencia.
 * @returns {boolean} `true` si es un array válido y no vacío, de lo contrario `false`.
 */
export const validateArray = (array, componentName = 'Component') => {
  if (!Array.isArray(array)) {
    console.warn(`${componentName}: Se esperaba un array, pero se recibió ${typeof array}.`);
    return false;
  }

  if (array.length === 0) {
    console.warn(`${componentName}: El array está vacío.`);
    return false;
  }

  return true;
};

/**
 * Valida si un valor es un objeto y contiene las propiedades requeridas.
 *
 * @param {any} obj - El objeto a validar.
 * @param {string[]} [requiredProps=[]] - Una lista de propiedades que deben existir en el objeto.
 * @param {string} [componentName='Component'] - El nombre del componente para los mensajes de advertencia.
 * @returns {boolean} `true` si el objeto es válido y contiene las propiedades, de lo contrario `false`.
 */
export const validateObject = (obj, requiredProps = [], componentName = 'Component') => {
  if (!obj || typeof obj !== 'object') {
    console.warn(`${componentName}: Se esperaba un objeto, pero se recibió ${typeof obj}.`);
    return false;
  }

  const missingProps = requiredProps.filter((prop) => !Object.prototype.hasOwnProperty.call(obj, prop));
  if (missingProps.length > 0) {
    console.warn(`${componentName}: Faltan las siguientes propiedades requeridas: ${missingProps.join(', ')}.`);
    return false;
  }

  return true;
};

/**
 * Trunca un texto si excede una longitud máxima, añadiendo puntos suspensivos.
 *
 * @param {string} text - El texto a formatear.
 * @param {number} [maxLength=100] - La longitud máxima permitida para el texto.
 * @returns {string} El texto formateado.
 */
export const formatText = (text, maxLength = 100) => {
  if (typeof text !== 'string' || !text) return '';

  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
};

/**
 * Formatea un período de tiempo para asegurar un formato consistente.
 *
 * @param {string} period - El período a formatear (p. ej., "2023" o "2022 - 2023").
 * @returns {string} El período formateado (p. ej., "2023 - Presente").
 */
export const formatPeriod = (period) => {
  if (!period) return '';
  if (period.includes(' - ')) return period;
  if (/^\d{4}$/.test(period)) return `${period} - Presente`;
  return period;
};

/**
 * Asigna un color por defecto basado en una categoría o tipo.
 * Útil para la consistencia visual en badges y otros elementos.
 *
 * @param {string} type - La categoría para la que se necesita un color (p. ej., 'language', 'technology').
 * @returns {string} Un nombre de color de Tailwind CSS.
 */
export const getDefaultColor = (type) => {
  const colorMap = {
    language: 'blue',
    technology: 'indigo',
    skill: 'emerald',
    certification: 'violet',
    education: 'cyan',
    experience: 'slate',
  };

  return colorMap[type] || 'blue';
};