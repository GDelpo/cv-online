import { useEffect, useState } from 'react';
import { adaptLinkedInData } from '@data/adapters/linkedinAdapter';

/**
 * Hook para cargar y adaptar datos del CV desde archivos JSON de LinkedIn.
 * Los archivos deben estar en public/data/ con el prefijo linkedin_*.json
 */
export function useCVData() {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCVData() {
      try {
        setLoading(true);

        // Lista de archivos JSON a cargar
        const jsonFiles = [
          'linkedin_certifications.json',
          'linkedin_contact.json',
          'linkedin_courses.json',
          'linkedin_education.json',
          'linkedin_experience.json',
          'linkedin_languages.json',
          'linkedin_personal.json',
          'linkedin_strengths.json',
          'linkedin_technologies.json',
        ];

        // Cargar todos los archivos en paralelo
        const dataPromises = jsonFiles.map(filename =>
          fetch(`/data/${filename}`).then(response => {
            if (!response.ok) throw new Error(`No se pudo cargar ${filename}`);
            return response.json();
          })
        );

        const [certs, contact, courses, edu, exp, langs, personal, strengths, technologies] = await Promise.all(dataPromises);

        if (cancelled) return;

        // Preparar objeto raw con la data sin procesar
        const rawData = {
          personal: personal.personal || personal,
          experiences: exp.experiences || exp,
          education: edu.education || edu,
          certifications: certs.certifications || certs,
          courses: courses.courses || courses,
          strengths: strengths.strengths || strengths,
          technologies: technologies.technologies || technologies,
          contact: contact.contact || contact,
          languages: langs.languages || langs,
        };

        // Adaptar datos usando el adapter
        const adaptedData = adaptLinkedInData(rawData);

        setCvData(adaptedData);

      } catch (err) {
        if (!cancelled) {
          console.error('Error cargando datos del CV:', err);
          setError(String(err));
          setCvData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCVData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { cvData, loading, error };
}
