import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';
import { COMMON_STYLES } from '@constants/styles';

const ScrollToTop = ({ 
  threshold = 300,
  className = "",
  size = 48,
  showProgress = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    
    setScrollProgress(progress);
    setIsVisible(scrollTop > threshold);
  }, [threshold]);

  useEffect(() => {
    handleScroll(); // Verificar estado inicial
    
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', scrollListener);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // No mostrar si no está visible
  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center justify-center
        rounded-xl shadow-lg
        ${COMMON_STYLES.transition}
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
        print:hidden
        bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
        text-white border-0
        ${className}
      `}
      style={{
        width: `${size}px`,
        height: `${size}px`
      }}
      title={`Volver al inicio ${showProgress ? `(${Math.round(scrollProgress)}% completado)` : ''}`}
      aria-label="Volver al inicio de la página"
    >
      {/* Indicador de progreso como background */}
      {showProgress && (
        <div
          className="absolute inset-0 rounded-xl bg-white/20 transition-all duration-100 ease-out"
          style={{
            clipPath: `inset(${100 - scrollProgress}% 0 0 0)`
          }}
        />
      )}
      
      <ChevronUp 
        size={size > 40 ? 24 : 20} 
        className="relative z-10 transition-transform group-hover:scale-110" 
      />
    </button>
  );
};

export default ScrollToTop;
