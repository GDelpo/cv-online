
import { generateKey, validateArray } from '@/utils/componentHelpers';

const Strengths = ({ data = [] }) => {
  if (!validateArray(data, 'Strengths')) {
    return null;
  }

  return (
    <ul className="list-disc list-inside space-y-1 text-sm
      [&>li]:text-gray-600 dark:[&>li]:text-gray-300
      [&>li]:marker:text-gray-400 dark:[&>li]:marker:text-gray-500">
      {data.map((item, index) => (
        <li
          key={generateKey('strength', index, item)}
          className="hover:bg-gray-50 dark:hover:bg-gray-700/50
                    rounded-lg p-2 transition-colors"
        >
          {item}
        </li>
      ))}
    </ul>
  );
};

export default Strengths;
