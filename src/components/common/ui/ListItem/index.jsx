
import React from 'react';
import PropTypes from 'prop-types';

const ListItem = ({ children, icon: Icon, className = "", hover = true }) => (
  <div className={`
    flex items-start gap-2 p-2
    ${hover ? 'hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors' : ''}
    ${className}
  `}>
    {Icon && (
      <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
    )}
    <span className="text-sm text-gray-600 dark:text-gray-300">{children}</span>
  </div>
);

ListItem.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.elementType,
  className: PropTypes.string,
  hover: PropTypes.bool
};

export default React.memo(ListItem);
