
import { BookOpen, TrendingUp } from 'lucide-react';
import Section from '@layout/Section';
import Badge from '@ui/Badge';

const ContinuousLearning = ({ continuousLearning, animationType = "slideUp" }) => {
  if (!continuousLearning || continuousLearning.length === 0) {
    return null;
  }

  // Función para determinar el color del badge basado en la plataforma/tipo
  const getBadgeColor = (course) => {
    if (course.toLowerCase().includes('udemy')) return 'violet';
    if (course.toLowerCase().includes('autodidacta')) return 'emerald';
    if (course.toLowerCase().includes('coursera')) return 'blue';
    if (course.toLowerCase().includes('platzi')) return 'yellow';
    return 'indigo'; // Color por defecto
  };

  // Función para extraer la plataforma/fuente del curso
  const getPlatform = (course) => {
    const parts = course.split(' - ');
    return parts.length > 1 ? parts[parts.length - 1] : 'Otros';
  };

  // Función para extraer el título del curso
  const getCourseTitle = (course) => {
    const parts = course.split(' - ');
    return parts[0];
  };

  // Agrupar cursos por plataforma para mejor organización
  const groupedCourses = continuousLearning.reduce((acc, course) => {
    const platform = getPlatform(course);
    if (!acc[platform]) {
      acc[platform] = [];
    }
    acc[platform].push(course);
    return acc;
  }, {});

  return (
    <Section 
      icon={BookOpen} 
      title="Aprendizaje Continuo" 
      className="mb-6"
      animationType={animationType}
    >
      <div className="space-y-4">
        {Object.entries(groupedCourses).map(([platform, courses]) => (
          <div key={platform} className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
              <TrendingUp size={16} />
              {platform}
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {courses.map((course, index) => (
                <Badge
                  key={`${platform}-${index}`}
                  color={getBadgeColor(course)}
                  size="sm"
                  className="cursor-default"
                >
                  {getCourseTitle(course)}
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
