import { adaptLinkedInData } from '@data/adapters/linkedinAdapter';
import certifications from '@data/linkedin_certifications.json';
import contact from '@data/linkedin_contact.json';
import courses from '@data/linkedin_courses.json';
import education from '@data/linkedin_education.json';
import experiences from '@data/linkedin_experience.json';
import languages from '@data/linkedin_languages.json';
import personal from '@data/linkedin_personal.json';
import strengths from '@data/linkedin_strengths.json';
import technologies from '@data/linkedin_technologies.json';

/**
 * Hook para cargar y adaptar los datos del CV desde archivos JSON.
 *
 * @returns {{
 *   cvData: ReturnType<typeof adaptLinkedInData>;
 * }}
 */
export function useCVData() {
  const rawData = {
    certifications,
    contact,
    courses,
    education,
    experiences,
    languages,
    personal,
    strengths,
    technologies,
  };

  const adaptedData = adaptLinkedInData(rawData);

  return { cvData: adaptedData };
}
