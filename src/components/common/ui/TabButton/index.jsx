// TabButton.jsx

import React from 'react';

const TabButton = ({ label, viewName, activeView, onClick }) => {
  const isActive = activeView === viewName;

  const baseClasses = "flex-1 text-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300";
  
  const activeClasses = "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-white";
  
  const inactiveClasses = "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-gray-700/50";

  return (
    <button
      onClick={() => onClick(viewName)}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {label}
    </button>
  );
};

export default TabButton;