
import { BookOpen, TrendingUp } from 'lucide-react';
import Section from '@layout/Section';
import Badge from '@ui/Badge';

const ContinuousLearning = ({ continuousLearning, animationType = "slideUp" }) => {
  if (!continuousLearning || Object.keys(continuousLearning).length === 0) {
    return null;
  }

  return (
    <Section 
      icon={BookOpen} 
      title="Aprendizaje Continuo" 
      className="mb-6"
      animationType={animationType}
    >
      <div className="space-y-4">
        {Object.values(continuousLearning).map((platformData) => (
          <div key={platformData.platform} className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <TrendingUp size={16} />
              {platformData.platform}
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {platformData.courses.map((course, index) => (
                <Badge
                  key={`${platformData.platform}-${index}`}
                  color={platformData.color}
                  size="sm"
                  className="cursor-default"
                >
                  {course.title}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Mensaje inspiracional */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-3">
          <BookOpen className="text-green-600 dark:text-green-400 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
              Compromiso con el Crecimiento Profesional
            </p>
            <p className="text-xs text-green-600 dark:text-green-300">
              La tecnología evoluciona constantemente, y yo evoluciono con ella. 
              Estos cursos reflejan mi dedicación por mantenerme actualizado y 
              explorar nuevas herramientas que puedan agregar valor a mis proyectos.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ContinuousLearning;
