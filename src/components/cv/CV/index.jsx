import React, { useState } from 'react';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import Header from '../header';
import Contact from '../sections/Contact';
import TechStack from '../sections/TechStack';
import Languages from '../sections/Languages';
import Strengths from '../sections/Strengths';
import Experience from '../sections/Experience';
import Education from '../sections/Education';
import Card from '../../common/ui/Card';
import TabButton from '../../common/ui/TabButton';

const Cv = ({ cvData }) => {
  const isDesktop = useBreakpoint('lg');
  const [activeView, setActiveView] = useState('experience');

  // ==================================================================
  // 1. Definimos nuestro "diccionario" de secciones
  // ==================================================================
  const sections = [
    { id: 'experience', label: 'Experiencia', area: 'main', component: <Experience experiences={cvData.experiences} /> },
    { id: 'education',  label: 'Educación',   area: 'main', component: <Education education={cvData.education} courses={cvData.courses} /> },
    { id: 'contact',    label: 'Contacto',    area: 'sidebar', component: <Contact {...cvData.contact} /> },
    { id: 'tech',       label: 'Tecnologías', area: 'sidebar', component: <TechStack technologies={cvData.technologies} /> },
    { id: 'languages',  label: 'Idiomas',     area: 'sidebar', component: <Languages languages={cvData.languages} /> },
    { id: 'strengths',  label: 'Fortalezas',  area: 'sidebar', component: <Strengths items={cvData.strengths} /> },
  ];

  // ==================================================================
  // 2. Generamos el contenido dinámicamente a partir del diccionario
  // ==================================================================
  const mainContent = sections
    .filter(section => section.area === 'main')
    .map(section => <Card key={section.id}>{section.component}</Card>);

  const sidebarContent = sections
    .filter(section => section.area === 'sidebar')
    .map(section => <Card key={section.id}>{section.component}</Card>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <Header {...cvData.header} />
        
        {isDesktop ? (
          <div className="grid lg:grid-cols-[1fr,2fr] gap-6">
            <aside className="space-y-6">{sidebarContent}</aside>
            <main className="space-y-6">{mainContent}</main>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 3. Los botones también se generan dinámicamente */}
            <div className="flex flex-wrap gap-2 p-2 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl">
              {sections.map(section => (
                <TabButton 
                  key={section.id}
                  label={section.label} 
                  viewName={section.id} 
                  activeView={activeView} 
                  onClick={setActiveView} 
                />
              ))}
            </div>

            {/* 4. Y el contenido se busca en el diccionario */}
            <Card>
              {sections.find(section => section.id === activeView)?.component}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cv;