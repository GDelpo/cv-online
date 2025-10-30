
import TechnologyItem from './TechnologyItem';
import AnimatedCard from '@ui/AnimatedCard';
import { TECH_CATEGORY_COLORS } from '@constants/styles';

const TechStack = ({ data = {} }) => {
  // Componente interno reutilizable para cada sección
  const TechSection = ({ title, items }) => (
    <div className="mb-4 last:mb-0">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {items}
      </div>
    </div>
  );

  // Función genérica para renderizar cualquier sección de tecnologías
  const renderTechSection = (title, items, keyPrefix = title.toLowerCase()) => (
    <TechSection
      title={title}
      items={items.map((item, index) => (
        <AnimatedCard
          key={`${keyPrefix}-${item.name || item}-${index}`}
          animationType="scaleIn"
          delay={index * 50}
        >
          <TechnologyItem
            text={item.name || item}
            color={item.color || TECH_CATEGORY_COLORS[title] || 'blue'}
            isMain={item.isMain}
          />
        </AnimatedCard>
      ))}
    />
  );

  // Generar frameworks de forma más limpia
  const frameworks = data.Lenguajes?.flatMap(lang =>
    lang.frameworks?.map(framework => ({
      name: framework,
      color: lang.color
    })) || []
  ) || [];

  // Categorías especiales que requieren tratamiento diferente
  const specialCategories = ['Lenguajes'];
  const otherCategories = Object.keys(data).filter(
    category => !specialCategories.includes(category)
  );

  if (!Object.keys(data).length) {
    console.warn('TechStack component: No data provided');
    return null;
  }

  return (
    <>
      {/* Lenguajes */}
      {data.Lenguajes && renderTechSection(
        "Lenguajes", 
        data.Lenguajes,
        'languages'
      )}
      
      {/* Frameworks/Librerías */}
      {frameworks.length > 0 && renderTechSection(
        "Frameworks/Librerías", 
        frameworks,
        'frameworks'
      )}
      
      {/* Otras categorías */}
      {otherCategories.map(category => (
        <div key={`tech-category-${category}`}>
          {renderTechSection(
            category,
            data[category],
            category.toLowerCase()
          )}
        </div>
      ))}
    </>
  );
};

export default TechStack;
