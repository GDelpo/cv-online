
import { Award, ExternalLink } from 'lucide-react';
import Section from '@layout/Section';
import Button from '@ui/Button';
import AnimatedCard from '@ui/AnimatedCard';

const CertificationItem = ({ certification }) => {
  const { title, institution, date, credentialUrl, credentialId, verified } = certification;

  return (
    <div className="group mb-6 last:mb-0 relative">
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
      
      <div className="relative p-6 bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-blue-950/20 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-px">
        {/* Header con título y fecha */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
          <div className="flex-1">
            {/* Título con indicador de verificación */}
            <div className="flex items-start gap-4 mb-3">
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
            
            {credentialId && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                  ID: {credentialId}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-start lg:items-end gap-4">
            <div className="flex items-center gap-2">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/15 dark:shadow-blue-500/20">
                {date}
              </span>
            </div>
            
            {/* Botón para ver credencial */}
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

const Certifications = ({ certifications, animationType = "scaleIn" }) => {
  if (!certifications || certifications.length === 0) {
    return null;
  }

  return (
    <Section 
      icon={Award} 
      title="Certificaciones" 
      className="mb-6"
      animationType={animationType}
    >
      <div className="space-y-0">
        {certifications.map((cert, index) => (
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
    </Section>
  );
};

export default Certifications;
