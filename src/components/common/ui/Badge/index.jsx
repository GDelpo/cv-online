
import { TECH_COLORS, COMMON_STYLES } from '../../../../constants/styles';

const BADGE_VARIANTS = {
  primary: TECH_COLORS.blue,
  success: TECH_COLORS.emerald,
  warning: TECH_COLORS.yellow,
  info: TECH_COLORS.indigo,
  danger: TECH_COLORS.red,
  secondary: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
};

const BADGE_SIZES = {
  xs: "px-1.5 py-0.5 text-xs",
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base"
};

const Badge = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  color,
  className = "",
  onClick 
}) => {
  const baseClasses = `
    inline-flex items-center rounded-full font-medium
    ${COMMON_STYLES.transition}
    ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
  `.trim();

  // Si se pasa un color específico, usarlo directamente
  const variantClass = color ? TECH_COLORS[color] || BADGE_VARIANTS[variant] : BADGE_VARIANTS[variant];
  const sizeClass = BADGE_SIZES[size] || BADGE_SIZES.md;

  const Component = onClick ? 'button' : 'span';

  return (
    <Component 
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

export default Badge;
