import React from 'react';
import { Briefcase, CircleDot } from 'lucide-react';
import Section from '../../../../components/common/layout/Section';
import ListItem from '../../../../components/common/ui/ListItem';

const ExperienceItem = ({ experience }) => {
  return (
    <div className="mb-8 last:mb-0">
      {/* Encabezado con título, empresa y período */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {experience.title}
            </h4>
            <h5 className="text-gray-600 dark:text-gray-300">
              {experience.company}
            </h5>
          </div>
          <span className="text-blue-600 dark:text-blue-400 
            sm:text-right whitespace-nowrap text-sm 
            sm:bg-blue-50 dark:sm:bg-blue-900/30 
            sm:px-3 sm:py-1 sm:rounded-full w-fit">
            {experience.period}
          </span>
        </div>
        
        {/* Descripción opcional */}
        {experience.description && (
          <p className="text-gray-600 dark:text-gray-300 mt-3">
            {experience.description}
          </p>
        )}
      </div>

      {/* Secciones */}
      {experience.sections?.map((section, idx) => (
        <div key={idx} className="mb-4 last:mb-0">
          <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {section.title}:
          </h6>
          <ul className="space-y-2">
            {section.items.map((item, itemIdx) => (
              <ListItem 
                key={itemIdx}
                icon={CircleDot}
                className="text-gray-600 dark:text-gray-300
                  hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                {item}
              </ListItem>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

const Experience = ({ experiences }) => {
  return (
    <Section 
      icon={Briefcase} 
      title="Experiencia Profesional" 
      className="mb-6"
    >
      {experiences.map((exp, index) => (
        <ExperienceItem key={index} experience={exp} />
      ))}
    </Section>
  );
};

export default Experience;