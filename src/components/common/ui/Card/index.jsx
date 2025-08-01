import React from 'react';

const Card = ({ children, hover = true, className = "" }) => (
  <div className={`
    bg-white dark:bg-gray-800/50
    rounded-xl 
    shadow-sm dark:shadow-none
    dark:border-white/[0.05]
    break-inside-avoid
    ${hover ? "hover:shadow-md dark:hover:border-white/[0.08] transition-all duration-300" : ""}
    ${className}
  `}>
    {children}
  </div>
);

export default Card;