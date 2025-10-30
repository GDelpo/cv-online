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
import { Briefcase, GraduationCap, Award, BookOpen, User, Cpu, Languages as LanguagesIcon, Zap } from 'lucide-react';
import Section from '@components/common/layout/Section';


const SECTION_COMPONENTS = {
  experience: Experience,
  education: Education,
  certifications: Certifications,
  'continuous-learning': ContinuousLearning,
  contact: Contact,
  tech: TechStack,
  languages: Languages,
  strengths: Strengths,
};


// Configuración de secciones centralizada y reutilizable
const CV_SECTIONS = [
  { 
    id: 'experience', 
    label: 'Experiencia', 
    title: 'Experiencia Profesional',
    icon: Briefcase,
    component: SECTION_COMPONENTS.experience,
    area: 'main',
    priority: 1
  },
  { 
    id: 'education', 
    label: 'Educación', 
    title: 'Educación Formal',
    icon: GraduationCap,
    component: SECTION_COMPONENTS.education,
    area: 'main',
    priority: 2
  },
  { 
    id: 'certifications', 
    label: 'Certificaciones', 
    title: 'Certificaciones Relevantes',
    icon: Award,
    component: SECTION_COMPONENTS.certifications,
    area: 'main',
    priority: 3
  },
  { 
    id: 'continuous-learning', 
    label: 'Aprendizaje', 
    title: 'Aprendizaje Continuo',
    icon: BookOpen,
    component: SECTION_COMPONENTS['continuous-learning'],
    area: 'main',
    priority: 4
  },
  { 
    id: 'contact', 
    label: 'Contacto', 
    title: 'Información de Contacto',
    icon: User,
    component: SECTION_COMPONENTS.contact,
    area: 'sidebar',
    priority: 1
  },
  { 
    id: 'tech', 
    label: 'Tecnologías', 
    title: 'Stack Tecnológico',
    icon: Cpu,
    component: SECTION_COMPONENTS.tech,
    area: 'sidebar',
    priority: 2
  },
  { 
    id: 'languages', 
    label: 'Idiomas', 
    title: 'Idiomas',
    icon: LanguagesIcon,
    component: SECTION_COMPONENTS.languages,
    area: 'sidebar',
    priority: 3
  },
  { 
    id: 'strengths', 
    label: 'Fortalezas', 
    title: 'Fortalezas Clave',
    icon: Zap,
    component: SECTION_COMPONENTS.strengths,
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
  const getSectionData = (sectionId) => {
    const dataMap = {
      experience: cvData.experiences,
      education: cvData.education,
      certifications: cvData.certifications,
      'continuous-learning': cvData.continuousLearning,
      contact: cvData.contact,
      tech: cvData.technologies,
      languages: cvData.languages,
      strengths: cvData.strengths,
    };
    return dataMap[sectionId];
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
  const renderSections = (sections, isSidebar = false) =>
    sections.map((section, index) => {
      const SectionComponent = section.component;
      const sectionData = getSectionData(section.id);
      const animationTypes = ['slideUp', 'fadeIn', 'scaleIn'];
      const animationType = animationTypes[index % animationTypes.length];

      return (
        <Card key={section.id}>
          <ErrorBoundary
            title={`Error en la sección ${section.label}`}
            message="No se pudo cargar esta sección."
          >
            <Suspense fallback={<SectionLoader />}>
              <Section
                icon={section.icon}
                title={section.title}
                variant={isSidebar ? 'sidebar' : 'main'}
                animationType={animationType}
              >
                <SectionComponent data={sectionData} />
              </Section>
            </Suspense>
          </ErrorBoundary>
        </Card>
      );
    });

  const renderActiveSection = () => {
    const section = CV_SECTIONS.find(s => s.id === activeView);
    if (!section) return null;

    const SectionComponent = section.component;
    const sectionData = getSectionData(section.id);

    return (
      <Card>
        <ErrorBoundary
          title={`Error en la sección ${section.label}`}
          message="No se pudo cargar esta sección."
        >
          <Suspense fallback={<SectionLoader />}>
            <Section
              icon={section.icon}
              title={section.title}
              variant="main"
              animationType="fadeIn"
            >
              <SectionComponent data={sectionData} />
            </Section>
          </Suspense>
        </ErrorBoundary>
      </Card>
    );
  };
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
            {renderSections(sidebarSections, true)}
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
          {renderActiveSection()}
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
