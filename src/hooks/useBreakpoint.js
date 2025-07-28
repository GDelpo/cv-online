import { useState, useEffect } from 'react';

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
};

export const useBreakpoint = (breakpoint) => {
  const [isAbove, setIsAbove] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsAbove(window.innerWidth >= breakpoints[breakpoint]);
    };

    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, [breakpoint]);

  return isAbove;
};
