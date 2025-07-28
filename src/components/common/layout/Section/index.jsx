import React from 'react';

const Section = ({ 
  icon: Icon, 
  title, 
  children, 
  className = "", 
  variant = "main"
}) => {
  const variantStyles = {
    main: "text-xl pb-3",
    sidebar: "text-lg pb-3"
  };

  return (
    <section className={`
      bg-white dark:bg-gray-800 
      rounded-xl p-6 shadow-sm 
      dark:shadow-lg dark:shadow-gray-900/10 
      ${className}
    `}>
      <h3 className={`
        font-bold mb-8 
        text-gray-800 dark:text-gray-100
        border-b border-gray-200 dark:border-gray-700
        flex items-center gap-3
        ${variantStyles[variant]}
      `}>
        <Icon className={`
          ${variant === 'main' ? 'h-6 w-6' : 'h-5 w-5'} 
          text-blue-600 dark:text-blue-400
        `} />
        {title}
      </h3>
      {children}
    </section>
  );
};

export default Section;