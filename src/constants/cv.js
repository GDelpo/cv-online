export const TECH_COLORS = {
  blue: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100",
  indigo: "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100",
  violet: "bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-100",
  emerald: "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100",
  "Bases de Datos": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  "DevTools": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
};

export const LANGUAGE_LEVELS = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];

export const cvData = {
    header: {
      name: "Guido Delponte",
      title: "Python Developer & Systems Analyst",
      description: "𝐏𝐲𝐭𝐡𝐨𝐧 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 y 𝐀𝐧𝐚𝐥𝐢𝐬𝐭𝐚 𝐝𝐞 𝐒𝐢𝐬𝐭𝐞𝐦𝐚𝐬 con más de 3 años de experiencia en 𝐝𝐞𝐬𝐚𝐫𝐫𝐨𝐥𝐥𝐨 𝐝𝐞 𝐬𝐨𝐟𝐭𝐰𝐚𝐫𝐞 y 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐳𝐚𝐜𝐢𝐨𝐧𝐞𝐬. Especializado en crear soluciones eficientes utilizando 𝐏𝐲𝐭𝐡𝐨𝐧, desde automatizaciones y procesamiento de datos hasta desarrollo de 𝐀𝐏𝐈𝐬 y 𝐚𝐩𝐥𝐢𝐜𝐚𝐜𝐢𝐨𝐧𝐞𝐬 𝐰𝐞𝐛.<br> Combino sólidos 𝐜𝐨𝐧𝐨𝐜𝐢𝐦𝐢𝐞𝐧𝐭𝐨𝐬 𝐭é𝐜𝐧𝐢𝐜𝐨𝐬 con excelentes 𝐡𝐚𝐛𝐢𝐥𝐢𝐝𝐚𝐝𝐞𝐬 𝐝𝐞 𝐜𝐨𝐦𝐮𝐧𝐢𝐜𝐚𝐜𝐢ó𝐧 y relacionamiento interpersonal, lo que me permite colaborar efectivamente tanto con equipos técnicos como con clientes y stakeholders. De perfil 𝐩𝐫𝐨𝐚𝐜𝐭𝐢𝐯𝐨 y 𝐨𝐫𝐢𝐞𝐧𝐭𝐚𝐝𝐨 𝐚 𝐫𝐞𝐬𝐮𝐥𝐭𝐚𝐝𝐨𝐬, disfruto resolver problemas complejos y aportar mejoras continuas a los sistemas.",
      photo: "/src/assets/images/profile_picture.jpg"
    },
    contact: {
      email: "guido_delponte@hotmail.com",
      github: "github.com/GDelpo",
      location: "CABA, Argentina"
    },
    technologies: {
      "Lenguajes": [
        {
          name: "Python",
          isMain: true,
          frameworks: ["FastAPI", "Django", "Flask"],
          color: "blue"
        },
        {
          name: "PHP",
          frameworks: ["Laravel"],
          color: "indigo"
        },
        {
          name: "Java",
          frameworks: ["Spring"],
          color: "violet"
        },
        {
          name: "JavaScript",
          frameworks: ["React", "Astro"],
          color: "emerald"
        }
      ],
      "Bases de Datos": ["SQL (varios motores)"],
      "DevTools": ["Git", "Jira", "Docusaurus"]
    },
    
    languages: [
      { language: "Español", level: "Nativo" },
      { language: "Inglés", level: "Intermedio", certifications: "B2" },
      { language: "Chino", level: "Básico", certifications: "HSK 1 y 2" }
    ],
    strengths: [
      "Excelentes habilidades de comunicación y relacionamiento",
      "Liderazgo natural y trabajo en equipo (forjados en rugby competitivo)",
      "Actitud positiva y proactiva ante desafíos",
      "Capacidad de análisis y resolución de problemas",
      "Facilidad para construir relaciones profesionales",
      "Compromiso y mejora continua",
    ],
    experiences: [
      {
        title: "Python Developer & Systems Analyst",
        company: "Noble Seguros",
        period: "2020 - Presente",
        description: "Responsable del desarrollo, análisis y mejora continua de sistemas críticos del negocio.",
        sections: [
          {
            title: "Desarrollo y Automatización",
            items: [
              "Diseño e implementación de soluciones utilizando Python para automatizar procesos de gran y menor escala",
              "Desarrollo de APIs y microservicios para integración de sistemas",
              "Mantenimiento y mejora de sistemas legacy en PHP",
              "Implementación de documentación técnica con Docusaurus"
            ]
          },
          {
            title: "Análisis y Gestión",
            items: [
              "Análisis funcional y técnico de sistemas internos",
              "Auditoría y optimización de servicios con proveedores externos",
              "Coordinación con equipos técnicos y stakeholders del negocio",
              "Implementación de mejoras en procesos y sistemas existentes"
            ]
          },
          {
            title: "Logros Destacados",
            items: [
              "Lideré la implementación y puesta en producción de NobleOnline",
              "Desarrollo de automatizaciones que optimizaron procesos críticos",
              "Simplificación de procesos y resolución de problemas complejos",
              "Mejora significativa en la documentación y mantenibilidad"
            ]
          },
        ]
      },
      {
        title: "Software Developer & Tech Consultant",
        company: "Freelance",
        period: "2018 - Presente",
        sections:[{
          title: "Desarrollo de Software",
          items: [
            "Implementación de soluciones a medida (web, escritorio, automatizaciones)",
            "Desarrollo de APIs y sistemas de integración",
            "Procesamiento y análisis de datos",
            "Modernización de sistemas legacy"
          ]
        },
        {
          title: "Proyectos Destacados",
          items: [
            "Sistema de turnos para cooperativa municipal",
            "Automatizaciones para procesamiento de datos a gran escala",
            "Plataforma e-commerce completa para fundación",
            "Sistema de gestión de contenidos para editorial"
          ]
        },
      ]
      },
      {
        title: "Soporte Técnico de Sistemas & Administrativo",
        company: "Laboratorio Dr. Enrique Lovine",
        period: "2015 - 2020",
        sections:[{
          title: "Gestión Técnica de Sistemas",
          items: [
            "Administración y mantenimiento integral del parque informático",
            "Implementación y mantenimiento de redes e infraestructura",
            "Instalación y configuración de sistemas de seguridad",
            "Soporte técnico a usuarios y resolución de incidencias"
          ]
        },
      ]
      }
    ],
    education: {
      title: "Analista de Sistemas",
      institution: "ORT Argentina",
      period: "2019 - 2022"
    },
    courses: [
      "JAVA - Educación IT (2022)",
      "Análisis Funcional – Educación IT (2020)",
      "FrontEnd – Plataforma5 (2020)",
      "WebMaster – UTN (2018)"
    ]
  };