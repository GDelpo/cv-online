import { useState, useEffect, useCallback } from 'react';

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export const useBreakpoint = (breakpoint) => {
  const [isAbove, setIsAbove] = useState(() => {
    // Inicialización lazy para evitar problemas de hidratación
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= BREAKPOINTS[breakpoint];
  });

  const checkSize = useCallback(() => {
    const width = window.innerWidth;
    const targetWidth = BREAKPOINTS[breakpoint];
    
    if (!targetWidth) {
      console.warn(`Breakpoint "${breakpoint}" not found. Available: ${Object.keys(BREAKPOINTS).join(', ')}`);
      return;
    }
    
    setIsAbove(width >= targetWidth);
  }, [breakpoint]);

  useEffect(() => {
    // Evitar ejecutar en SSR
    if (typeof window === 'undefined') return;

    checkSize();
    
    // Usar requestAnimationFrame para mejor performance
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkSize, 100); // Debounce
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [checkSize]);

  return isAbove;
};
