
import { LANGUAGE_LEVELS } from '@constants/styles';

const LanguageLevel = ({ level }) => {
  const currentLevelIndex = LANGUAGE_LEVELS.indexOf(level);
 
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex space-x-1">
        {LANGUAGE_LEVELS.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-4 rounded-sm transition-all duration-300 
              ${index <= currentLevelIndex 
                ? 'bg-blue-500 dark:bg-blue-400' 
                : 'bg-gray-200 dark:bg-gray-600'
              }`
            }
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">{level}</span>
    </div>
  );
};

export default LanguageLevel;
