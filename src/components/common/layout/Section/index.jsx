
import clsx from 'clsx';
import { COMMON_STYLES } from '@constants/styles';
import useIntersectionObserver from '@hooks/useIntersectionObserver';

const Section = ({
  icon: Icon,
  title,
  children,
  className,
  variant = 'main',
  animationType = 'slideUp',
}) => {
  const [sectionRef, isVisible] = useIntersectionObserver();

  // --- Estilos Base ---
  const baseClasses = 'transition-all duration-700 ease-out';

  // --- Estilos de Variante ---
  // Define los estilos para las variantes 'main' y 'sidebar'.
  const variantClasses = clsx({
    'p-8': variant === 'main',
    'p-6': variant === 'sidebar',
  });

  const titleClasses = clsx('font-bold tracking-tight', COMMON_STYLES.textPrimary, {
    'text-2xl': variant === 'main',
    'text-xl': variant === 'sidebar',
  });

  const iconClasses = clsx('text-white', {
    'h-7 w-7': variant === 'main',
    'h-6 w-6': variant === 'sidebar',
  });

  const headerSpacing = clsx({
    'pb-6': variant === 'main',
    'pb-4': variant === 'sidebar',
  });

  // --- Estilos de Animación ---
  // Define las clases de animación basadas en la visibilidad.
  const animationClasses = clsx({
    [COMMON_STYLES.slideUpEnter]: !isVisible,
    [COMMON_STYLES.slideUpEnterActive]: isVisible && animationType === 'slideUp',
    [COMMON_STYLES.fadeInEnter]: !isVisible,
    [COMMON_STYLES.fadeInEnterActive]: isVisible && animationType === 'fadeIn',
    [COMMON_STYLES.scaleInEnter]: !isVisible,
    [COMMON_STYLES.scaleInEnterActive]: isVisible && animationType === 'scaleIn',
  });

  return (
    <section ref={sectionRef} className={clsx(baseClasses, variantClasses, animationClasses, className)}>
      {/* Encabezado de la sección */}
      <div className={clsx(headerSpacing, 'relative')}>
        <div className="flex items-center gap-4 mb-3">
          {/* Icono */}
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/15 dark:shadow-blue-500/20">
            <Icon className={iconClasses} />
          </div>

          {/* Título */}
          <h3 className={titleClasses}>{title}</h3>
        </div>

        {/* Línea decorativa */}
        <div className="h-px bg-gradient-to-r from-blue-500/20 via-blue-500/40 to-transparent" />
      </div>

      {/* Contenido de la sección */}
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
};

export default Section;
