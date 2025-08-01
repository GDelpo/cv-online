import React from 'react';
import { Printer } from 'lucide-react';

const PrintButton = () => {
  return (
    <button
      onClick={() => window.print()}
      className="p-2 rounded-full 
        text-gray-800 dark:text-gray-200
        bg-gray-100 hover:bg-gray-200
        dark:bg-gray-800 dark:hover:bg-gray-700
        transition-colors duration-200"
      aria-label="Imprimir o guardar como PDF"
    >
      <Printer className="w-5 h-5" />
    </button>
  );
};

export default PrintButton;