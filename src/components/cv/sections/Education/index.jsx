
import { GraduationCap, Calendar } from 'lucide-react';

const Education = ({ data }) => {
  if (!data) {
    console.warn('Education component: No data provided');
    return null;
  }

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      {/* Header principal */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {data.title}
          </h3>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <GraduationCap size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="font-medium">{data.institution}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
              <span>{data.period}</span>
            </div>
          </div>
        </div>

        {/* Badge de estado */}
        <div className="flex flex-col items-end gap-2">
          <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            ✓ Completado
          </div>
        </div>
      </div>

      {/* Descripción adicional si es necesaria */}
      <div className="pt-4 border-t border-blue-100 dark:border-blue-800">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Formación integral en análisis, diseño y desarrollo de sistemas de información,
          con énfasis en metodologías de desarrollo y gestión de proyectos tecnológicos.
        </p>
      </div>
    </div>
  );
};

export default Education;
