import React from 'react';
import { BicepsFlexed } from 'lucide-react';
import Section from '../../../../components/common/layout/Section';

const Strengths = ({ items }) => {
  return (
    <Section icon={BicepsFlexed} title="Fortalezas" variant="sidebar">
      <ul className="list-disc list-inside space-y-1 text-sm 
        [&>li]:text-gray-600 dark:[&>li]:text-gray-300
        [&>li]:marker:text-gray-400 dark:[&>li]:marker:text-gray-500">
        {items.map((item, index) => (
          <li key={index}
            className="hover:bg-gray-50 dark:hover:bg-gray-700/50
                        rounded-lg p-2 transition-colors">
            {item}
          </li>
        ))}
      </ul>
    </Section>
  );
};

export default Strengths;