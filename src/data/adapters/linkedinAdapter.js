// Adaptador para transformar los JSON provenientes del scraper de LinkedIn
// a la estructura interna que usa la app.

import { TECH_COLORS, TECH_CATEGORY_COLORS } from '@constants/styles';

export function adaptLinkedInData(raw = {}) {
  const personal = raw.personal || {};
  const experiences = Array.isArray(raw.experiences) ? raw.experiences : [];
  const educationArr = Array.isArray(raw.education) ? raw.education : [];
  const certificationsArr = Array.isArray(raw.certifications) ? raw.certifications : [];
  const coursesArr = Array.isArray(raw.courses) ? raw.courses : [];
  const contactRaw = raw.contact || {};
  const languagesArr = Array.isArray(raw.languages) ? raw.languages : [];

  // Colores disponibles para asignar por posición a lenguajes
  const TECH_COLOR_KEYS = Object.keys(TECH_COLORS);

  // Header
  const header = {
    name: personal.name || '',
    title: personal.title || personal.headline || '',
    description: normalizeDescription(personal.description || personal.summary || ''),
    photo: personal.photo || personal.photoUrl || ''
  };

  // Contact: normalizar formato de URLs
  const contact = {
    email: contactRaw.email || '',
    github: cleanGithubUrl(contactRaw.github || ''),
    linkedin: cleanLinkedInUrl(contactRaw.linkedin || ''),
    location: contactRaw.location || ''
  };

  // Experiencias
  const normalizedExperiences = experiences.map(exp => ({
    title: exp.title || '',
    company: cleanCompany(exp.company || ''),
    period: exp.period || '',
    description: exp.description || '',
    sections: Array.isArray(exp.sections) ? exp.sections : [],
    location: exp.location || ''
  }));

  // Educación: tomar primera como principal
  let normalizedEducation = null;
  if (educationArr.length) {
    const main = educationArr[0];
    normalizedEducation = {
      title: main.title || main.degree || 'Formación',
      institution: main.institution || main.school || '',
      period: main.period || ''
    };
  }

  // Certificaciones
  const normalizedCerts = certificationsArr.map(c => ({
    title: c.title || c.name || '',
    institution: c.institution || c.issuer || '',
    date: c.date || '',
    credentialUrl: c.credentialUrl || c.url || '',
    credentialId: c.credentialId || '',
    verified: c.verified ?? true
  }));

  // Cursos -> continuousLearning: agrupar por plataforma y asignar colores por posición
  const continuousLearning = {};
  const platformKeys = []; // Para trackear el orden de aparición de plataformas
  
  coursesArr.forEach(course => {
    const platform = course.platform || 'Otros';
    const cleanPlatform = platform.split(',')[0].trim(); // Limpiar "Udemy, Plataforma online" -> "Udemy"
    
    if (!continuousLearning[cleanPlatform]) {
      platformKeys.push(cleanPlatform);
      const colorIdx = (platformKeys.length - 1) % TECH_COLOR_KEYS.length;
      
      continuousLearning[cleanPlatform] = {
        platform: cleanPlatform,
        color: TECH_COLOR_KEYS[colorIdx],
        courses: []
      };
    }
    
    continuousLearning[cleanPlatform].courses.push({
      title: course.title || course.name || '',
      platform: cleanPlatform
    });
  });

  // Normalizar tecnologías: asignar colores a lenguajes por posición y a otras categorías por tipo
  const normalizedTechnologies = {};
  let programmingLanguages = []; // Renombrado de normalizedLanguages para evitar conflicto

  if (raw.technologies && raw.technologies.technologies) {
    Object.entries(raw.technologies.technologies).forEach(([category, items]) => {
      if (category === 'Lenguajes') {
        // Asignar color por posición
        programmingLanguages = items.map((lang, idx) => ({
          ...lang,
          color: TECH_COLOR_KEYS[idx % TECH_COLOR_KEYS.length]
        }));
        normalizedTechnologies[category] = programmingLanguages;
      } else {
        // Asignar color por categoría
        normalizedTechnologies[category] = items.map(item =>
          typeof item === 'string'
            ? { name: item, color: TECH_CATEGORY_COLORS[category] || 'blue' }
            : { ...item, color: TECH_CATEGORY_COLORS[category] || 'blue' }
        );
      }
    });
  }

  // Idiomas (spoken languages): normalizar estructura y ordenar por expertise
  const LANGUAGE_LEVEL_ORDER = {
    'Nativo': 1,
    'Bilingüe': 2,
    'Avanzado': 3,
    'Intermedio alto': 4,
    'Intermedio': 5,
    'Básico': 6,
    'Elemental': 7
  };

  const normalizedLanguages = languagesArr
    .map(lang => ({
      language: lang.language || '',
      level: lang.level || 'Intermedio',
      certifications: lang.certifications || ''
    }))
    .sort((a, b) => {
      const orderA = LANGUAGE_LEVEL_ORDER[a.level] || 999;
      const orderB = LANGUAGE_LEVEL_ORDER[b.level] || 999;
      return orderA - orderB;
    });

  return {
    header,
    contact,
    technologies: normalizedTechnologies,
    programmingLanguages, // Lenguajes de programación para TechStack
    languages: normalizedLanguages, // Idiomas hablados para Languages
    strengths: raw.strengths || [],
    experiences: normalizedExperiences,
    education: normalizedEducation,
    certifications: normalizedCerts,
    continuousLearning
  };
}

// Helpers --------------------------------------------------
function cleanCompany(company = '') {
  return company.replace(/·.*$/, '').trim();
}

function normalizeDescription(desc = '') {
  // Reemplazar nuevas líneas por <br> para mantener formato existente
  return desc.includes('<br>') ? desc : desc.replace(/\n+/g, '<br>');
}

function cleanGithubUrl(url = '') {
  // Convertir de URL completa a formato "github.com/user"
  if (!url) return '';
  return url.replace(/https?:\/\//, '').replace(/\/$/, '');
}

function cleanLinkedInUrl(url = '') {
  // Mantener URL completa pero limpiar trailing slash
  if (!url) return '';
  return url.replace(/\/$/, '');
}