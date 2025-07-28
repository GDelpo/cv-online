import React from 'react';
import { TECH_COLORS } from '../../../../constants/cv';

const TechnologyItem = ({ text, color, isMain }) => (  
    <div className={`
      flex items-center gap-2 px-3 py-2 rounded-lg text-sm 
      ${TECH_COLORS[color] || "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"}
      transition-all hover:scale-105
      shadow-sm dark:shadow-gray-900/10 hover:shadow-md
      ${isMain ? 'font-bold' : ''}
    `}>
      {text}
    </div>
  );

export default TechnologyItem;
