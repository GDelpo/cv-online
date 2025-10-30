import { User } from 'lucide-react';
import IconWrapper from '@icons/IconWrapper';
import useIntersectionObserver from '@hooks/useIntersectionObserver';
import { useTypingEffect } from '@hooks/useTypingEffect';
import { COMMON_STYLES } from '@constants/styles';

const Header = ({ name, title, description, photo }) => {
  const [headerRef, isVisible] = useIntersectionObserver();
  const headerAnimation = isVisible ? COMMON_STYLES.fadeInEnterActive : COMMON_STYLES.fadeInEnter;
  
  // Detectar si el título tiene múltiples opciones separadas por |
  const titles = title ? title.split('|').map(t => t.trim()) : [];
  const hasMultipleTitles = titles.length > 1;
  const displayedTitle = useTypingEffect(
    hasMultipleTitles ? titles : [title],
    100,  // velocidad escritura
    50,   // velocidad borrado
    2000  // pausa entre títulos
  );
  
  // Función para procesar el HTML de la descripción
  const processDescription = (desc) => {
    if (!desc) return '';
    // Reemplazar \n por <br> para saltos de línea
    return desc.replace(/\\n/g, '<br>');
  };

  return (
    <header 
      ref={headerRef}
      className={`relative overflow-hidden rounded-3xl mb-8 shadow-2xl ${headerAnimation}`}
    >
      {/* Background gradient moderno */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-950"></div>
      
      {/* Patrón decorativo con glassmorphism */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-white/10 to-transparent opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-radial from-cyan-400/15 to-transparent opacity-40"></div>
      </div>
      
      <div className="relative z-10 p-8 md:p-12 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-8 lg:gap-16">
          {/* Foto de perfil mejorada */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-white/10 to-cyan-300/20 rounded-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 blur-xl"></div>
              
              <div className="relative w-56 h-56 lg:w-64 lg:h-64 rounded-3xl overflow-hidden 
                border-4 border-white/30 backdrop-blur-sm
                shadow-xl shadow-blue-900/30 dark:shadow-black/50
                transition-all duration-500 ease-out
                group-hover:border-white/50 group-hover:shadow-2xl group-hover:shadow-blue-900/40 dark:group-hover:shadow-black/60
                group-hover:scale-[1.01] group-hover:-rotate-0.5">
                
                {photo ? (
                  <img
                    src={photo}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-800 to-indigo-900">
                    <IconWrapper 
                      icon={User} 
                      size="lg" 
                      color="white" 
                      className="w-32 h-32 opacity-70"
                    />
                  </div>
                )}
                
                {/* Overlay gradient sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>

          {/* Información principal */}
          <div className="space-y-6 text-center lg:text-left">
            {/* Nombre y título */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {name}
                </span>
              </h1>
              
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4">
                <h2 className="text-xl md:text-2xl text-blue-100 font-medium tracking-wide min-w-[280px] md:min-w-[420px]">
                  {displayedTitle}
                  {hasMultipleTitles && (
                    <span className="inline-block w-0.5 h-6 bg-blue-200 ml-1 animate-pulse align-middle"></span>
                  )}
                </h2>
              </div>
            </div>

            {/* Descripción con HTML renderizado */}
            {description && (
              <div 
                className="text-base md:text-lg text-white/90 leading-relaxed max-w-4xl font-light space-y-3"
                dangerouslySetInnerHTML={{ __html: processDescription(description) }}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;