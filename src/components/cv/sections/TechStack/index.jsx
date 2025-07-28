import React from 'react';
import { Zap } from 'lucide-react';
import Section from '../../../../components/common/layout/Section';
import TechnologyItem from './TechnologyItem';

const TechStack = ({ technologies }) => {
  // Renombramos este componente a TechSection para evitar la colisión
  const TechSection = ({ title, items }) => (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items}
      </div>
    </div>
  );

  const renderLanguages = () => (
    <TechSection
      title="Lenguajes"
      items={technologies.Lenguajes.map((lang, index) => (
        <TechnologyItem
          key={`lang-${lang.name}-${index}`}
          text={lang.name}
          color={lang.color}
          isMain={lang.isMain}
        />
      ))}
    />
  );

  const renderFrameworks = () => (
    <TechSection
      title="Frameworks/Librerías"
      items={technologies.Lenguajes.flatMap((lang, langIndex) =>
        lang.frameworks.map((framework, frameworkIndex) => (
          <TechnologyItem
            key={`framework-${lang.name}-${framework}-${langIndex}-${frameworkIndex}`}
            text={framework}
            color={lang.color}
          />
        ))
      )}
    />
  );

  const renderOtherSection = (category) => (
    <TechSection
      title={category}
      items={technologies[category].map((item, index) => (
        <TechnologyItem
          key={`${category}-${item}-${index}`}
          text={item}
          color={category}
        />
      ))}
    />
  );

  return (
    <Section icon={Zap} title="Tecnologías" variant="sidebar">
      {renderLanguages()}
      {renderFrameworks()}
      {Object.keys(technologies)
        .filter(category => category !== "Lenguajes")
        .map(category => (
          <React.Fragment key={category}>
            {renderOtherSection(category)}
          </React.Fragment>
        ))}
    </Section>
  );
};

export default TechStack;