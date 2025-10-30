
import LanguageLevel from './LanguageLevel';
import { generateKey, validateArray } from '@/utils/componentHelpers';

const LanguageItem = ({ language, level, certifications }) => (
  <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{language}</p>
      {certifications && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{certifications}</p>
      )}
    </div>
    <LanguageLevel level={level} />
  </div>
);

const Languages = ({ data = [] }) => {
  if (!validateArray(data, 'Languages')) {
    return null;
  }

  return (
    <div className="space-y-2">
      {data.map((lang, index) => (
        <LanguageItem
          key={generateKey('language', index, lang)}
          language={typeof lang === 'string' ? lang : lang.language}
          level={lang.level || 'Intermedio'}
          certifications={lang.certifications}
        />
      ))}
    </div>
  );
};

export default Languages;
