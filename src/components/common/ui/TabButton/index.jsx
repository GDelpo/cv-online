
import Button from '../Button';

const TabButton = ({ label, viewName, activeView, onClick }) => {
  const isActive = activeView === viewName;
  const variant = isActive ? 'tab-active' : 'tab';

  return (
    <Button
      variant={variant}
      onClick={() => onClick(viewName)}
      className="rounded-lg"
    >
      {label}
    </Button>
  );
};

export default TabButton;
