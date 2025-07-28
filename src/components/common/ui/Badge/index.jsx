import React from 'react';

const Badge = ({ children, variant = "primary", size = "md" }) => {
  const variants = {
    primary: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100",
    success: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100",
    warning: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100",
    info: "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base"
  };

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium
      ${variants[variant]} ${sizes[size]}
      transition-all duration-200 hover:opacity-90
    `}>
      {children}
    </span>
  );
};


  
export default Badge;