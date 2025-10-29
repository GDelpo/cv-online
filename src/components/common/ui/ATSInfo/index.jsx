import React, { useState, useEffect } from 'react';
import { Info, X, FileText } from 'lucide-react';
import { COMMON_STYLES } from '@constants/styles';

const ATSInfo = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-cerrar después de 8 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm print:hidden">
      <div className={`
        p-4 rounded-xl
        bg-blue-50 dark:bg-blue-950/50
        border border-blue-200 dark:border-blue-800
        shadow-lg backdrop-blur-sm
        ${COMMON_STYLES.transition}
      `}>
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💼 Generar PDF para Enviar
            </h4>
            <p className="text-xs text-blue-600 dark:text-blue-300 mb-3 leading-relaxed">
              Al imprimir, se genera automáticamente una versión profesional optimizada 
              para empresas y sistemas de seguimiento de candidatos.
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <FileText className="w-3 h-3" />
                Imprimir / Guardar PDF
              </button>
              
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSInfo;