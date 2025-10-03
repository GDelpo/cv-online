import React from 'react';
import { formatPeriod } from '@utils/componentHelpers';

const ATSHeader = ({ name, title, email, github, location }) => (
  <div className="ats-header">
    <div className="ats-name">{name}</div>
    <div className="ats-title">{title}</div>
    <div className="ats-contact">
      {email} | {github} | {location}
    </div>
  </div>
);

const ATSSection = ({ title, children }) => (
  <div className="ats-section">
    <div className="ats-section-title">{title}</div>
    {children}
  </div>
);

const ATSExperience = ({ experiences }) => (
  <ATSSection title="EXPERIENCIA PROFESIONAL">
    {experiences.map((exp, index) => (
      <div key={index} className="ats-experience-item">
        <div className="ats-job-title">{exp.title}</div>
        <div className="ats-company">{exp.company}</div>
        <div className="ats-period">{formatPeriod(exp.period)}</div>
        
        {exp.description && (
          <div className="ats-description">{exp.description}</div>
        )}
        
        {exp.sections?.map((section, sectionIndex) => (
          <div key={sectionIndex} className="ats-description">
            <strong>{section.title}:</strong>
            <ul className="ats-list">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="ats-list-item">{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ))}
  </ATSSection>
);

const ATSEducation = ({ education }) => (
  <ATSSection title="EDUCACIÓN">
    <div className="ats-experience-item">
      <div className="ats-job-title">{education.title}</div>
      <div className="ats-company">{education.institution}</div>
      <div className="ats-period">{education.period}</div>
    </div>
  </ATSSection>
);

const ATSCertifications = ({ certifications }) => {
  if (!certifications?.length) return null;
  
  return (
    <ATSSection title="CERTIFICACIONES">
      {certifications.map((cert, index) => (
        <div key={index} className="ats-experience-item">
          <div className="ats-job-title">{cert.title}</div>
          <div className="ats-company">{cert.institution}</div>
          <div className="ats-period">{cert.date}</div>
          {cert.credentialId && (
            <div className="ats-description">ID: {cert.credentialId}</div>
          )}
        </div>
      ))}
    </ATSSection>
  );
};

const ATSTechnologies = ({ technologies }) => {
  const formatTechSection = (title, items) => {
    if (!items?.length) return '';
    
    const techList = items.map(item => {
      if (typeof item === 'string') return item;
      if (item.name) {
        const frameworks = item.frameworks ? ` (${item.frameworks.join(', ')})` : '';
        return `${item.name}${frameworks}`;
      }
      return '';
    }).filter(Boolean);
    
    return techList.length ? `${title}: ${techList.join(', ')}` : '';
  };

  const sections = [];
  
  if (technologies.Lenguajes) {
    sections.push(formatTechSection('Lenguajes de Programación', technologies.Lenguajes));
  }
  
  Object.keys(technologies).forEach(category => {
    if (category !== 'Lenguajes' && technologies[category]) {
      sections.push(formatTechSection(category, technologies[category].map(item => ({ name: item }))));
    }
  });

  return (
    <ATSSection title="COMPETENCIAS TÉCNICAS">
      <div className="ats-skills">
        {sections.filter(Boolean).join(' • ')}
      </div>
    </ATSSection>
  );
};

const ATSLanguages = ({ languages }) => {
  if (!languages?.length) return null;
  
  const languageList = languages.map(lang => {
    const language = typeof lang === 'string' ? lang : lang.language;
    const level = lang.level || 'Intermedio';
    return `${language} (${level})`;
  }).join(', ');

  return (
    <ATSSection title="IDIOMAS">
      <div className="ats-skills">{languageList}</div>
    </ATSSection>
  );
};

const ATSStrengths = ({ items }) => {
  if (!items?.length) return null;
  
  return (
    <ATSSection title="COMPETENCIAS CLAVE">
      <ul className="ats-list">
        {items.map((item, index) => (
          <li key={index} className="ats-list-item">{item}</li>
        ))}
      </ul>
    </ATSSection>
  );
};

const ATSContinuousLearning = ({ continuousLearning }) => {
  if (!continuousLearning?.length) return null;
  
  return (
    <ATSSection title="FORMACIÓN CONTINUA">
      <div className="ats-skills">
        {continuousLearning.join(' • ')}
      </div>
    </ATSSection>
  );
};

// Componente principal ATS
const ATSCV = ({ cvData }) => (
  <div className="ats-layout print:block hidden">
    <ATSHeader 
      name={cvData.header.name}
      title={cvData.header.title}
      email={cvData.contact.email}
      github={cvData.contact.github}
      location={cvData.contact.location}
    />
    
    <ATSExperience experiences={cvData.experiences} />
    <ATSEducation education={cvData.education} />
    <ATSCertifications certifications={cvData.certifications} />
    <ATSTechnologies technologies={cvData.technologies} />
    <ATSLanguages languages={cvData.languages} />
    <ATSStrengths items={cvData.strengths} />
    <ATSContinuousLearning continuousLearning={cvData.continuousLearning} />
  </div>
);

export default ATSCV;