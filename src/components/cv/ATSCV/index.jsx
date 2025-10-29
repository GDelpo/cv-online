import { formatPeriod } from '@utils/componentHelpers';

// Header ATS simplificado
const ATSHeader = ({ name, title, contact }) => {
  const cleanTitle = title ? title.replace(/<[^>]*>/g, '').replace(/\|/g, '•') : '';
  
  return (
    <div className="ats-header">
      <div className="ats-name">{name}</div>
      <div className="ats-title">{cleanTitle}</div>
      <div className="ats-contact">
        {contact?.email && `${contact.email}`}
        {contact?.github && ` | ${contact.github}`}
        {contact?.linkedin && ` | ${contact.linkedin}`}
        {contact?.location && ` | ${contact.location}`}
      </div>
    </div>
  );
};

const ATSSection = ({ title, children }) => (
  <div className="ats-section">
    <div className="ats-section-title">{title}</div>
    {children}
  </div>
);

// Resumen profesional completo
const ATSSummary = ({ description }) => {
  if (!description) return null;
  
  const cleanDescription = description
    .replace(/<b>/g, '')
    .replace(/<\/b>/g, '')
    .replace(/<br>/g, '\n\n')
    .replace(/\\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
  
  return (
    <ATSSection title="RESUMEN PROFESIONAL">
      <div className="ats-description">{cleanDescription}</div>
    </ATSSection>
  );
};

// Experiencia (solo las 2 más recientes)
const ATSExperience = ({ experiences }) => {
  if (!experiences?.length) return null;
  
  const recentExperiences = experiences.slice(0, 2);
  const hasMore = experiences.length > 2;
  const moreCount = experiences.length - 2;
  
  return (
    <ATSSection title="EXPERIENCIA PROFESIONAL">
      {recentExperiences.map((exp, index) => (
        <div key={index} className="ats-experience-item">
          <div className="ats-job-title">{exp.title}</div>
          <div className="ats-company">{exp.company}</div>
          <div className="ats-period">{exp.period || formatPeriod(exp)}</div>
          
          {exp.sections?.map((section, sectionIndex) => (
            <div key={sectionIndex} className="ats-subsection">
              <strong>{section.title}:</strong>
              <ul className="ats-list">
                {section.items.slice(0, 3).map((item, itemIndex) => (
                  <li key={itemIndex} className="ats-list-item">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
      
      {hasMore && (
        <div className="ats-more-info">
          Ver anexo con {moreCount} experiencia{moreCount > 1 ? 's' : ''} adicional{moreCount > 1 ? 'es' : ''}
        </div>
      )}
    </ATSSection>
  );
};

const ATSEducation = ({ education }) => {
  if (!education) return null;
  
  return (
    <ATSSection title="EDUCACIÓN">
      <div className="ats-experience-item">
        <div className="ats-job-title">{education.title}</div>
        <div className="ats-company">{education.institution}</div>
        {education.period && <div className="ats-period">{education.period}</div>}
      </div>
    </ATSSection>
  );
};

// Certificaciones (solo las 2 más recientes)
const ATSCertifications = ({ certifications }) => {
  if (!certifications?.length) return null;
  
  const recentCertifications = certifications.slice(0, 2);
  const hasMore = certifications.length > 2;
  const moreCount = certifications.length - 2;
  
  return (
    <ATSSection title="CERTIFICACIONES MÁS RECIENTES">
      {recentCertifications.map((cert, index) => (
        <div key={index} className="ats-cert-item">
          <div className="ats-job-title">{cert.name || cert.title}</div>
          <div className="ats-company">{cert.institution} • {cert.date}</div>
          {cert.credentialId && (
            <div className="ats-credential">ID: {cert.credentialId} {cert.url && cert.url !== '#' && `• ${cert.url}`}</div>
          )}
        </div>
      ))}
      
      {hasMore && (
        <div className="ats-more-info">
          Ver anexo completo con {moreCount} certificación{moreCount > 1 ? 'es' : ''} adicional{moreCount > 1 ? 'es' : ''}
        </div>
      )}
    </ATSSection>
  );
};

// Tecnologías en formato compacto
const ATSTechnologies = ({ technologies }) => {
  if (!technologies || Object.keys(technologies).length === 0) return null;
  
  const formatTechSection = (category, items) => {
    if (!items?.length) return '';
    
    const techList = items.map(item => {
      if (typeof item === 'string') return item;
      if (item.name) return item.name;
      return '';
    }).filter(Boolean);
    
    return techList.length ? `${category}: ${techList.join(', ')}` : '';
  };

  const sections = [];
  Object.keys(technologies).forEach(category => {
    if (technologies[category]?.length) {
      sections.push(formatTechSection(category, technologies[category]));
    }
  });

  if (sections.length === 0) return null;

  return (
    <ATSSection title="COMPETENCIAS TÉCNICAS">
      <div className="ats-tech-list">
        {sections.filter(Boolean).join(' • ')}
      </div>
    </ATSSection>
  );
};

const ATSLanguages = ({ languages }) => {
  if (!languages?.length) return null;
  
  const languageList = languages.map(lang => {
    const language = typeof lang === 'string' ? lang : lang.language;
    const level = lang.level || '';
    return level ? `${language} (${level})` : language;
  }).join(', ');

  return (
    <ATSSection title="IDIOMAS">
      <div className="ats-languages">{languageList}</div>
    </ATSSection>
  );
};

const ATSStrengths = ({ strengths }) => {
  if (!strengths?.length) return null;
  
  const topStrengths = strengths.slice(0, 5);
  
  return (
    <ATSSection title="COMPETENCIAS CLAVE">
      <div className="ats-tech-list">
        {topStrengths.join(' • ')}
      </div>
    </ATSSection>
  );
};

// ANEXO: Experiencias completas
const ATSExperienceAnnex = ({ experiences, name }) => {
  if (!experiences?.length || experiences.length <= 2) return null;
  
  const additionalExperiences = experiences.slice(2);
  
  return (
    <div className="ats-annex">
      <div className="ats-annex-header">
        <div className="ats-annex-name">{name}</div>
        <div className="ats-annex-title">ANEXO - HISTORIAL LABORAL COMPLETO</div>
        <div className="ats-annex-subtitle">Detalle de experiencias profesionales adicionales</div>
      </div>
      
      <div className="ats-annex-content">
        {additionalExperiences.map((exp, index) => (
          <div key={index} className="ats-annex-item">
            <div className="ats-job-title">{exp.title}</div>
            <div className="ats-company">{exp.company}</div>
            <div className="ats-period">{exp.period || formatPeriod(exp)}</div>
            
            {exp.description && (
              <div className="ats-description">{exp.description}</div>
            )}
            
            {exp.sections?.map((section, sectionIndex) => (
              <div key={sectionIndex} className="ats-subsection">
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
      </div>
    </div>
  );
};

// ANEXO: Certificaciones completas
const ATSCertificationsAnnex = ({ certifications, name }) => {
  if (!certifications?.length || certifications.length <= 2) return null;
  
  const additionalCertifications = certifications.slice(2);
  
  return (
    <div className="ats-annex">
      <div className="ats-annex-header">
        <div className="ats-annex-name">{name}</div>
        <div className="ats-annex-title">ANEXO - CERTIFICACIONES COMPLETAS</div>
        <div className="ats-annex-subtitle">Listado completo de certificaciones profesionales verificables</div>
      </div>
      
      <div className="ats-annex-content">
        {additionalCertifications.map((cert, index) => (
          <div key={index} className="ats-annex-item">
            <div className="ats-job-title">{cert.name || cert.title}</div>
            <div className="ats-company">{cert.institution}</div>
            <div className="ats-period">{cert.date}</div>
            {cert.credentialId && (
              <div className="ats-credential">ID de Credencial: {cert.credentialId}</div>
            )}
            {cert.url && cert.url !== '#' && (
              <div className="ats-url">Verificar en: {cert.url}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente principal ATSCV
const ATSCV = ({ cvData }) => {
  if (!cvData) return null;
  
  return (
    <>
      {/* CV Principal - 1-2 páginas */}
      <div className="ats-layout print:block hidden">
        <ATSHeader 
          name={cvData.header?.name}
          title={cvData.header?.title}
          contact={cvData.contact}
        />
        
        {cvData.header?.description && (
          <ATSSummary description={cvData.header.description} />
        )}
        
        {cvData.experiences?.length > 0 && (
          <ATSExperience experiences={cvData.experiences} />
        )}
        
        {cvData.technologies && Object.keys(cvData.technologies).length > 0 && (
          <ATSTechnologies technologies={cvData.technologies} />
        )}
        
        {cvData.education && (
          <ATSEducation education={cvData.education} />
        )}
        
        {cvData.certifications?.length > 0 && (
          <ATSCertifications certifications={cvData.certifications} />
        )}
        
        {cvData.languages?.length > 0 && (
          <ATSLanguages languages={cvData.languages} />
        )}
        
        {cvData.strengths?.length > 0 && (
          <ATSStrengths strengths={cvData.strengths} />
        )}
        
        <div className="ats-footer-note">
          Referencias y documentación adicional disponibles bajo solicitud
        </div>
      </div>

      {/* Anexos - Hojas separadas */}
      {cvData.experiences?.length > 2 && (
        <ATSExperienceAnnex 
          experiences={cvData.experiences}
          name={cvData.header?.name}
        />
      )}
      
      {cvData.certifications?.length > 2 && (
        <ATSCertificationsAnnex 
          certifications={cvData.certifications}
          name={cvData.header?.name}
        />
      )}
    </>
  );
};

export default ATSCV;