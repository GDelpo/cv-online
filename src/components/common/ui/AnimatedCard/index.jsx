
import { COMMON_STYLES } from '@constants/styles';
import useIntersectionObserver from '@hooks/useIntersectionObserver';

const AnimatedCard = ({ 
  children, 
  className = "",
  animationType = "slideUp",
  delay = 0
}) => {
  const [cardRef, isVisible] = useIntersectionObserver();
  
  const animationStyles = {
    slideUp: isVisible ? COMMON_STYLES.slideUpEnterActive : COMMON_STYLES.slideUpEnter,
    fadeIn: isVisible ? COMMON_STYLES.fadeInEnterActive : COMMON_STYLES.fadeInEnter,
    scaleIn: isVisible ? COMMON_STYLES.scaleInEnterActive : COMMON_STYLES.scaleInEnter
  };

  const currentAnimation = animationStyles[animationType];
  const delayStyle = delay > 0 ? { transitionDelay: `${delay}ms` } : {};

  return (
    <div 
      ref={cardRef}
      className={`${currentAnimation} ${className}`}
      style={delayStyle}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
