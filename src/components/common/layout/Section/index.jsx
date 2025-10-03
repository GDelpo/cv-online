
import { COMMON_STYLES } from '@constants/styles';
import useIntersectionObserver from '@hooks/useIntersectionObserver';

const Section = ({ 
  icon: Icon, 
  title, 
  children, 
  className = "", 
  variant = "main",
  animationType = "slideUp"
}) => {
  const [sectionRef, isVisible] = useIntersectionObserver();
  
  const variantStyles = {
    main: {
      titleSize: "text-2xl",
      iconSize: "h-7 w-7",
      padding: "p-8",
      spacing: "pb-6"
    },
    sidebar: {
      titleSize: "text-xl", 
      iconSize: "h-6 w-6",
      padding: "p-6",
      spacing: "pb-4"
    }
  };

  const animationStyles = {
    slideUp: isVisible ? COMMON_STYLES.slideUpEnterActive : COMMON_STYLES.slideUpEnter,
    fadeIn: isVisible ? COMMON_STYLES.fadeInEnterActive : COMMON_STYLES.fadeInEnter,
    scaleIn: isVisible ? COMMON_STYLES.scaleInEnterActive : COMMON_STYLES.scaleInEnter
  };

  const currentVariant = variantStyles[variant];
  const currentAnimation = animationStyles[animationType];

  return (
    <section 
      ref={sectionRef}
      className={`${currentVariant.padding} ${currentAnimation} ${className}`}
    >
      {/* Header con gradiente sutil */}
      <div className={`${currentVariant.spacing} mb-6 relative`}>
        <div className="flex items-center gap-4 mb-3">
          {/* Icono con background gradient */}
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/15 dark:shadow-blue-500/20">
            <Icon className={`${currentVariant.iconSize} text-white`} />
          </div>
          
          {/* Título moderno */}
          <h3 className={`
            ${currentVariant.titleSize}
            font-bold 
            ${COMMON_STYLES.textPrimary}
            tracking-tight
          `}>
            {title}
          </h3>
        </div>
        
        {/* Línea decorativa */}
        <div className="h-px bg-gradient-to-r from-blue-500/20 via-blue-500/40 to-transparent"></div>
      </div>
      
      {/* Contenido */}
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
};

export default Section;
