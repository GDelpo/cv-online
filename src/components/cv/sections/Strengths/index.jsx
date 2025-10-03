
import { BicepsFlexed } from 'lucide-react';
import Section from '@layout/Section';
import { generateKey, validateArray } from '@/utils/componentHelpers';

const Strengths = ({ 
  items = [], 
  animationType = "fadeIn",
  className = ""
}) => {
  if (!validateArray(items, 'Strengths')) {
    return null;
  }

  return (
    <Section 
      icon={BicepsFlexed} 
      title="Fortalezas" 
      variant="sidebar" 
      animationType={animationType}
      className={className}
    >
      <ul className="list-disc list-inside space-y-1 text-sm 
        [&>li]:text-gray-600 dark:[&>li]:text-gray-300
        [&>li]:marker:text-gray-400 dark:[&>li]:marker:text-gray-500">
        {items.map((item, index) => (
          <li 
            key={generateKey('strength', index, item)}
            className="hover:bg-gray-50 dark:hover:bg-gray-700/50
                      rounded-lg p-2 transition-colors"
          >
            {item}
          </li>
        ))}
      </ul>
    </Section>
  );
};

export default Strengths;
