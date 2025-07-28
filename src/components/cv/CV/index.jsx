import React from 'react';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import Header from '../header';
import Contact from '../sections/Contact';
import TechStack from '../sections/TechStack';
import Languages from '../sections/Languages';
import Strengths from '../sections/Strengths';
import Experience from '../sections/Experience';
import Education from '../sections/Education';
import Card from '../../common/ui/Card';

const Cv = ({ cvData }) => {
  const isDesktop = useBreakpoint('lg');

  // Si estamos en móvil, podríamos reorganizar las secciones
  const mainContent = (
    <main className="space-y-6">
      <Card>
        <Experience experiences={cvData.experiences} />
      </Card>
      
      <Card>
        <Education 
          education={cvData.education}
          courses={cvData.courses}
        />
      </Card>
    </main>
  );

  const sidebarContent = (
    <aside className="space-y-6">
      <Card>
        <Contact {...cvData.contact} />
      </Card>
      
      <Card>
        <TechStack technologies={cvData.technologies} />
      </Card>
      
      <Card>
        <Languages languages={cvData.languages} />
      </Card>
      
      <Card>
        <Strengths items={cvData.strengths} />
      </Card>
    </aside>
  );

  return (
    <div className="min-h-screen 
      bg-gradient-to-br from-gray-50 to-gray-100 
      dark:from-gray-900 dark:to-gray-950
      transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <Header {...cvData.header} />
        
        <div className={`grid gap-6 ${
          isDesktop ? 'lg:grid-cols-[1fr,2fr]' : ''
        }`}>
          {isDesktop ? (
            <>
              {sidebarContent}
              {mainContent}
            </>
          ) : (
            <>
              {mainContent}
              {sidebarContent}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cv;