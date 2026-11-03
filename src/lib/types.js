// JSDoc typedefs for the locale JSON written by scripts/build-content.mjs.

/**
 * @typedef {{ locale: 'es' | 'en', dataDate: string, siteUrl: string, path: string, title: string, description: string }} Meta
 * @typedef {{ webp: string, jpg: string, alt: string }} Photo
 * @typedef {{ name: string, headline: string, location: string, email: string, github: string, linkedin: string, photo: Photo, summary: string[] }} Person
 * @typedef {{ id: string, title: string, company: string | null, engagement: string | null, location: string | null, start: string, end: string | null, current: boolean, bullets: string[], moreBullets: string[], print: { summary: string | null, bullets: string[] } | null }} Position
 * @typedef {{ id: string, degree: string, school: string, start: string | null, end: string | null, inProgress: boolean }} EducationItem
 * @typedef {{ id: string, title: string, issuer: string, date: string | null, credentialId: string | null, credentialUrl: string | null, featured: boolean, print: boolean }} Certification
 * @typedef {{ id: string, label: string, items: string[] }} SkillGroup
 * @typedef {{ name: string, level: string | null }} Language
 * @typedef {{ id: string, name: string, url: string, description: string }} Project
 * @typedef {{ sections: Record<'summary' | 'experience' | 'projects' | 'education' | 'certifications' | 'skills' | 'languages', string>, present: string, months: string[], viewCredential: string, credentialId: string, inProgress: string, downloadPdf: string, pdfPath: string, showMore: string, showLess: string, monthsFull: string[], skipLink: string, themeDark: string, themeLight: string, updated: string, viewRepository: string, mapLabel: string }} Ui
 * @typedef {{ meta: Meta, person: Person, positions: Position[], projects: Project[], education: EducationItem[], certifications: Certification[], skillGroups: SkillGroup[], languages: Language[], ui: Ui }} Content
 */

export {}
