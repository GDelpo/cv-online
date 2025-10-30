import { useEffect, useState } from 'react';
import { adaptLinkedInData } from '@data/adapters/linkedinAdapter';

/**
 * @typedef {'certifications' | 'contact' | 'courses' | 'education' | 'experience' | 'languages' | 'personal' | 'strengths' | 'technologies'} CVDataKey
 */

/**
 * @type {Record<CVDataKey, string>}
 */
const JSON_FILES = {
  certifications: 'linkedin_certifications.json',
  contact: 'linkedin_contact.json',
  courses: 'linkedin_courses.json',
  education: 'linkedin_education.json',
  experience: 'linkedin_experience.json',
  languages: 'linkedin_languages.json',
  personal: 'linkedin_personal.json',
  strengths: 'linkedin_strengths.json',
  technologies: 'linkedin_technologies.json',
};

/**
 * Carga un archivo JSON de forma segura.
 * @param {string} fileName - El nombre del archivo a cargar.
 * @returns {Promise<any>}
 */
const fetchJson = async (fileName) => {
  const response = await fetch(`/data/${fileName}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudo cargar el archivo ${fileName}`);
  }
  return response.json();
};

/**
 * Hook para cargar y adaptar los datos del CV desde archivos JSON.
 * Gestiona los estados de carga, éxito y error.
 *
 * @returns {{
 *   cvData: ReturnType<typeof adaptLinkedInData> | null;
 *   loading: boolean;
 *   error: string | null;
 * }}
 */
export function useCVData() {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);

        const dataEntries = await Promise.all(
          Object.entries(JSON_FILES).map(async ([key, fileName]) => {
            const data = await fetchJson(fileName);
            // Extrae el contenido del objeto si tiene una clave primaria
            return [key, data[key] || data];
          })
        );

        if (isCancelled) return;

        const rawData = Object.fromEntries(dataEntries);
        const adaptedData = adaptLinkedInData(rawData);

        setCvData(adaptedData);
        setError(null);

      } catch (err) {
        if (!isCancelled) {
          console.error("Error al cargar los datos del CV:", err);
          setError(err.message || 'Ocurrió un error desconocido.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { cvData, loading, error };
}
