
import Badge from '@ui/Badge';
import { COMMON_STYLES } from '@constants/styles';

const TechnologyItem = ({ text, color = 'blue', isMain = false }) => (
  <Badge
    color={color}
    size="md"
    className={`
      ${COMMON_STYLES.hoverScale} 
      ${COMMON_STYLES.cardShadow}
      ${isMain ? 'ring-2 ring-offset-1 ring-blue-400 dark:ring-blue-500 font-bold' : ''}
    `}
  >
    {text}
  </Badge>
);

export default TechnologyItem;
