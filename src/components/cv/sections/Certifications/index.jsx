import { useState } from 'react';
import { Award, ExternalLink } from 'lucide-react';
import Button from '@ui/Button';
import AnimatedCard from '@ui/AnimatedCard';
import { COMMON_STYLES } from '@constants/styles';

const CertificationItem = ({ certification }) => {
  const { title, institution, date, credentialUrl, credentialId, verified } = certification;

  return (
    <div className="group mb-4 relative">
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
      
      <div className="relative p-6 bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-blue-950/20 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-px">
        {/* Header con título, fecha y verificación */}
        <div className="mb-4">
          {/* Título con indicador de verificación y fecha */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-start gap-4 flex-1">
              {verified && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Award size={16} className="text-white" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 font-semibold text-lg">
                  {institution}
                </p>
              </div>
            </div>
            
            {/* Fecha alineada a la derecha a la altura del título */}
            <div className="flex-shrink-0">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/15 dark:shadow-blue-500/20">
                {date}
              </span>
            </div>
          </div>
          
          {/* ID de credencial y botón */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* ID de credencial */}
            <div className="flex-1">
              {credentialId && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                    ID: {credentialId}
                  </span>
                </div>
              )}
            </div>
            
            {/* Botón para ver credencial */}
            <div className="flex-shrink-0">
              {credentialUrl && credentialUrl !== '#' && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => window.open(credentialUrl, '_blank')}
                  className="inline-flex items-center gap-3 px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
                >
                  <ExternalLink size={16} />
                  Ver Credencial
                </Button>
              )}
              
              {credentialUrl === '#' && (
                <Button
                  variant="outline"
                  size="md"
                  disabled
                  className="inline-flex items-center gap-3 px-6 py-3 text-sm opacity-60"
                >
                  <ExternalLink size={16} />
                  Próximamente
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Indicador de verificación mejorado */}
        {verified && (
          <div className="pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-lg">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                <Award size={14} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                ✓ Certificación Oficial Verificable
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Certifications = ({ data = [] }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Número de certificaciones a mostrar inicialmente
  const INITIAL_DISPLAY = 3;
  
  if (!data || data.length === 0) {
    return null;
  }

  // Determinar qué certificaciones mostrar
  const displayedCerts = showAll ? data : data.slice(0, INITIAL_DISPLAY);
  const hasMore = data.length > INITIAL_DISPLAY;

  return (
    <>
      <div className="space-y-4">
        {displayedCerts.map((cert, index) => (
          <AnimatedCard 
            key={`cert-${index}-${cert.credentialId || cert.title}`}
            animationType="slideUp"
            delay={index * 100}
          >
            <CertificationItem 
              certification={cert} 
            />
          </AnimatedCard>
        ))}
      </div>

      {/* Botón "Ver más" / "Ver menos" */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={`
            w-full py-3 px-4 mt-4
            bg-gradient-to-r from-blue-50 to-indigo-50 
            hover:from-blue-100 hover:to-indigo-100
            dark:from-blue-900/20 dark:to-indigo-900/20
            dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30
            text-blue-700 dark:text-blue-300
            font-semibold rounded-xl
            border border-blue-200 dark:border-blue-800
            ${COMMON_STYLES.transition}
            hover:scale-[1.01] active:scale-[0.99]
            shadow-sm hover:shadow-md
          `}
        >
          {showAll 
            ? `Ver menos certificaciones` 
            : `Ver todas las certificaciones (${data.length - INITIAL_DISPLAY} más)`
          }
        </button>
      )}
      
      {/* Call to action para reclutadores */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Award className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
              💼 Para Reclutadores y Empleadores
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Todas estas certificaciones son <strong>oficiales y verificables</strong>. 
              Haz clic en "Ver Credencial" para validar directamente con la institución emisora.
              Esto te garantiza la autenticidad de mi formación técnica.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Certifications;