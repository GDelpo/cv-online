import React, { useState, Suspense } from 'react';
import { useBreakpoint } from '@hooks/useBreakpoint';
import { COMMON_STYLES } from '@constants/styles';
import { validateCvData } from '@utils/propTypes';
import ErrorBoundary from '@components/common/ErrorBoundary';
import Header from '@cv/header';
import Contact from '@sections/Contact';
import TechStack from '@sections/TechStack';
import Languages from '@sections/Languages';
import Strengths from '@sections/Strengths';
import Experience from '@sections/Experience';
import Education from '@sections/Education';
import Certifications from '@sections/Certifications';
import ContinuousLearning from '@sections/ContinuousLearning';
import Card from '@ui/Card';
import { formatBuildDate } from '@utils/date';
import TabButton from '@ui/TabButton';

// Configuración de secciones centralizada y reutilizable
const CV_SECTIONS = [
  { 
    id: 'experience', 
    label: 'Experiencia', 
    area: 'main',
    priority: 1
  },
  { 
    id: 'education', 
    label: 'Educación', 
    area: 'main',
    priority: 2
  },
  { 
    id: 'certifications', 
    label: 'Certificaciones', 
    area: 'main',
    priority: 3
  },
  { 
    id: 'continuous-learning', 
    label: 'Aprendizaje', 
    area: 'main',
    priority: 4
  },
  { 
    id: 'contact', 
    label: 'Contacto', 
    area: 'sidebar',
    priority: 1
  },
  { 
    id: 'tech', 
    label: 'Tecnologías', 
    area: 'sidebar',
    priority: 2
  },
  { 
    id: 'languages', 
    label: 'Idiomas', 
    area: 'sidebar',
    priority: 3
  },
  { 
    id: 'strengths', 
    label: 'Fortalezas', 
    area: 'sidebar',
    priority: 4
  }
];

const Cv = ({ cvData }) => {
  const isDesktop = useBreakpoint('lg');
  const [activeView, setActiveView] = useState('experience');

  // Validar datos del CV
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      validateCvData(cvData);
    }
  }, [cvData]);

  // Función para obtener el componente de cada sección con diferentes animaciones
  const getSectionComponent = (sectionId, index = 0) => {
    const animationTypes = ['slideUp', 'fadeIn', 'scaleIn'];
    const animationType = animationTypes[index % animationTypes.length];
    
    const components = {
      experience: <Experience experiences={cvData.experiences} animationType={animationType} />,
      education: <Education education={cvData.education} animationType={animationType} />,
      certifications: <Certifications certifications={cvData.certifications} animationType={animationType} />,
      'continuous-learning': <ContinuousLearning continuousLearning={cvData.continuousLearning} animationType={animationType} />,
      contact: <Contact {...cvData.contact} animationType="fadeIn" />,
      tech: <TechStack technologies={cvData.technologies} animationType="scaleIn" />,
      languages: <Languages languages={cvData.languages} animationType="slideUp" />,
      strengths: <Strengths items={cvData.strengths} animationType="fadeIn" />
    };
    return components[sectionId];
  };

  // Filtrar y ordenar secciones por área y prioridad
  const getSectionsByArea = (area) => 
    CV_SECTIONS
      .filter(section => section.area === area)
      .sort((a, b) => a.priority - b.priority);

  const mainSections = getSectionsByArea('main');
  const sidebarSections = getSectionsByArea('sidebar');

  // Componente de loading para Suspense
  const SectionLoader = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  );

  // Renderizar secciones con animaciones y error boundaries
  const renderSections = (sections) => 
    sections.map((section, index) => (
      <Card key={section.id}>
        <ErrorBoundary
          title="Error en la sección"
          message={`No se pudo cargar la sección ${section.label}. Esto no afecta el resto del CV.`}
        >
          <Suspense fallback={<SectionLoader />}>
            {getSectionComponent(section.id, index)}
          </Suspense>
        </ErrorBoundary>
      </Card>
    ));

  return (
    <div className={`space-y-6 ${COMMON_STYLES.transition}`}>
      <ErrorBoundary
        title="Error en el header"
        message="No se pudo cargar la información del header."
      >
        <Header {...cvData.header} />
      </ErrorBoundary>
      
      {isDesktop ? (
        <div className="grid lg:grid-cols-[1fr,2fr] gap-6">
          <aside className="space-y-6">
            {renderSections(sidebarSections)}
          </aside>
          <main className="space-y-6">
            {renderSections(mainSections)}
          </main>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Navegación por tabs para móvil */}
          <nav className="flex flex-wrap gap-2 p-2 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl">
            {CV_SECTIONS.map(section => (
              <TabButton 
                key={section.id}
                label={section.label} 
                viewName={section.id} 
                activeView={activeView} 
                onClick={setActiveView} 
              />
            ))}
          </nav>

          {/* Contenido activo */}
          <Card>
            <ErrorBoundary
              title="Error en la sección activa"
              message="No se pudo cargar la sección seleccionada."
            >
              <Suspense fallback={<SectionLoader />}>
                {getSectionComponent(activeView)}
              </Suspense>
            </ErrorBoundary>
          </Card>
        </div>
      )}

      {/* Footer: Última actualización (solo impresión) */}
      <footer className="hidden print:block text-center text-xs text-gray-600 mt-2">
        Última actualización: {formatBuildDate(import.meta.env.VITE_BUILD_TIME)}
      </footer>
    </div>
  );
};

export default Cv;
