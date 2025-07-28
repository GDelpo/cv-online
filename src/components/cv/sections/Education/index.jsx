import React from 'react';
import { GraduationCap } from 'lucide-react';
import Section from '../../../../components/common/layout/Section';

const Education = ({ education, courses }) => {
  return (
    <Section icon={GraduationCap} title="Educación">
      <div className="space-y-6">
        {/* Educación Formal */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {education.title}
              </h4>
              <h5 className="text-gray-600 dark:text-gray-300">
                {education.institution}
              </h5>
            </div>
            <span className="text-blue-600 dark:text-blue-400 
              sm:text-right whitespace-nowrap text-sm 
              sm:bg-blue-50 sm:dark:bg-blue-900/30
              sm:px-3 sm:py-1 sm:rounded-full w-fit">
              {education.period}
            </span>
          </div>
        </div>

        {/* Cursos y Certificaciones */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 
            mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            Cursos y Certificaciones
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.map((course, index) => (
              <li 
                key={index}
                className="flex items-start p-3 
                  rounded-lg 
                  bg-gray-50 dark:bg-gray-700/50
                  hover:bg-gray-100 dark:hover:bg-gray-700 
                  transition-colors group"
              >
                <div className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full 
                    bg-blue-200 dark:bg-blue-500 
                    mt-2 flex-shrink-0 
                    group-hover:bg-blue-300 dark:group-hover:bg-blue-400 
                    transition-colors" />
                  <span className="text-sm 
                    text-gray-600 dark:text-gray-300 
                    group-hover:text-gray-700 dark:group-hover:text-gray-200 
                    transition-colors">
                    {course}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
};

export default Education;