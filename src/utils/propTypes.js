/**
 * Utilidades para validación de tipos y props
 * Centraliza definiciones de PropTypes comunes para reutilización
 */

// Tipos comunes para secciones del CV
export const CV_SECTION_PROPS = {
  animationType: ['slideUp', 'fadeIn', 'scaleIn']
};

// Tipos para componentes de UI
export const UI_COMPONENT_PROPS = {
  sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
  variants: ['primary', 'secondary', 'outline', 'ghost'],
  colors: ['blue', 'indigo', 'violet', 'emerald', 'yellow', 'purple', 'red']
};

// Validadores personalizados
export const customValidators = {
  email: (props, propName, componentName) => {
    const value = props[propName];
    if (value && !/\S+@\S+\.\S+/.test(value)) {
      return new Error(`Invalid prop \`${propName}\` of value \`${value}\` supplied to \`${componentName}\`, expected a valid email address.`);
    }
  },
  
  url: (props, propName, componentName) => {
    const value = props[propName];
    if (value && !/^https?:\/\/.+/.test(value)) {
      return new Error(`Invalid prop \`${propName}\` of value \`${value}\` supplied to \`${componentName}\`, expected a valid URL.`);
    }
  }
};

// Validación de experiencias
export const validateExperience = (experience) => {
  const required = ['title', 'company', 'period'];
  const missing = required.filter(field => !experience[field]);
  
  if (missing.length > 0) {
    console.warn(`Experience missing required fields: ${missing.join(', ')}`);
  }
  
  return missing.length === 0;
};

// Validación de datos del CV
export const validateCvData = (cvData) => {
  const errors = [];
  
  if (!cvData.header?.name) errors.push('Header name is required');
  if (!cvData.contact?.email) errors.push('Contact email is required');
  if (!Array.isArray(cvData.experiences)) errors.push('Experiences must be an array');
  
  if (errors.length > 0) {
    console.error('CV Data validation errors:', errors);
  }
  
  return errors;
};