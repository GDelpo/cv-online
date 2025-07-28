import React from 'react';
import PropTypes from 'prop-types';

const IconWrapper = ({ 
  icon: Icon, 
  size = "md",
  color = "gray",
  className = "" 
}) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const colors = {
    gray: "text-gray-500",
    blue: "text-blue-600",
    green: "text-green-500"
  };

  return (
    <Icon className={`
      ${sizes[size]} 
      ${colors[color]}
      ${className}
    `} />
  );
};

IconWrapper.propTypes = {
  icon: PropTypes.elementType.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.oneOf(['gray', 'blue', 'green']),
  className: PropTypes.string
};

export default React.memo(IconWrapper);