# Estructura de Datos Modular del CV

Este directorio contiene la información del CV organizada en módulos separados para mejorar la mantenibilidad y organización del código.

## Estructura

```
src/data/
├── index.js           # Agregador principal - exporta cvData unificado
├── personal.js        # Información personal y de contacto
├── skills.js          # Tecnologías, idiomas y fortalezas
├── experience.js      # Historial laboral detallado
├── education.js       # Educación formal, certificaciones y aprendizaje continuo
└── README.md          # Esta documentación
```

## Uso

### Importación Recomendada (Nueva)
```javascript
import { cvData } from '@data';
// o
import { cvData } from '@/data';
```

### Importación por Compatibilidad (Obsoleta)
```javascript
import { cvData } from '@constants/cv';
```

## Beneficios de la Modularización

✅ **Mejor Organización**: Cada módulo tiene una responsabilidad específica
✅ **Fácil Mantenimiento**: Cambios localizados en archivos pequeños
✅ **Reutilización**: Módulos individuales pueden importarse por separado
✅ **Escalabilidad**: Agregar nuevas secciones es más sencillo
✅ **Legibilidad**: Archivos más pequeños y enfocados

## Migración

El archivo `src/constants/cv.js` ahora es una simple re-exportación que mantiene compatibilidad hacia atrás. Se recomienda actualizar las importaciones para usar la nueva estructura modular.

## Estructura de Datos

### cvData
```javascript
{
  personalInfo: { name, title, description, photo },
  contactInfo: { email, github, location },
  technologies: { "Lenguajes": [...], "Bases de Datos": [...], ... },
  languages: [{ language, level, certifications }, ...],
  strengths: [...],
  experiences: [{ title, company, period, sections: [...] }, ...],
  education: { title, institution, period },
  certifications: [{ title, institution, date, credentialUrl, verified }, ...],
  continuousLearning: [...]
}
```

### Constantes de Estilo
```javascript
{
  TECH_COLORS: { blue: "...", indigo: "...", ... },
  LANGUAGE_LEVELS: ['Básico', 'Intermedio', 'Avanzado', 'Nativo'],
  TECH_CATEGORY_COLORS: { "Bases de Datos": "purple", "DevTools": "yellow" }
}
```