
import clsx from 'clsx';
import { COMMON_STYLES } from '@constants/styles';

const Card = ({ children, hover = true, className, variant = 'default' }) => {
  // --- Estilos Base ---
  const baseClasses = 'rounded-2xl break-inside-avoid overflow-hidden';

  // --- Estilos de Variante ---
  // Define las clases para cada variante del Card.
  const variantClasses = clsx({
    'bg-white/85 dark:bg-gray-800/85 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-sm shadow-gray-900/[0.02] dark:shadow-gray-900/15':
      variant === 'default',
    'bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-white/15 dark:border-gray-700/25 shadow-md shadow-gray-900/[0.04] dark:shadow-gray-900/20':
      variant === 'glass',
    'bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700/70 shadow-lg shadow-gray-900/[0.06] dark:shadow-gray-900/20':
      variant === 'elevated',
  });

  // --- Estilos Hover ---
  // Aplica efectos de hover si la prop `hover` es true.
  const hoverClasses = hover
    ? clsx(
        COMMON_STYLES.transitionFast,
        'hover:shadow-lg hover:shadow-gray-900/[0.08] dark:hover:shadow-gray-900/25',
        'hover:-translate-y-px hover:scale-[1.002]',
        'hover:border-gray-300/70 dark:hover:border-gray-600/70',
        'active:scale-[0.998] active:translate-y-0'
      )
    : '';

  return (
    <div className={clsx(baseClasses, variantClasses, hoverClasses, className)}>
      {children}
    </div>
  );
};

export default Card;
