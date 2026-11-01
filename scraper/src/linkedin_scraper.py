from dataclasses import asdict
import os
import subprocess
try:
    from playwright.sync_api import sync_playwright  # noqa: F401 (only used indirectly when orchestrating)
except ImportError:
    subprocess.run(["pip", "install", "playwright"])
    from playwright.sync_api import sync_playwright  # noqa: F401
# Only install browsers if explicitly requested via env
if os.getenv('PLAYWRIGHT_INSTALL', 'false').strip().lower() in ('1', 'true', 'yes'):
    subprocess.run(["playwright", "install"])

from dotenv import load_dotenv
# Import shared models and parsing helpers from local modules
from models import (
    ExperienceEntry,
    EducationEntry,
    CertificationEntry,
    CoursesEntry,
    LanguageEntry,
)
from parsing import (
    parse_experience_blocks as parse_experience_blocks_impl,
    parse_education_blocks as parse_education_blocks_impl,
    parse_certifications_blocks as parse_certifications_blocks_impl,
    parse_courses_blocks as parse_courses_blocks_impl,
    parse_languages_blocks as parse_languages_blocks_impl,
    segment_by_aptitudes,
    parse_about_extras,
    parse_contact_info,
)
from scraping import orchestrate_scrape

# Cargar credenciales desde .env
load_dotenv()
EMAIL = os.getenv('LINKEDIN_EMAIL')
PASSWORD = os.getenv('LINKEDIN_PASSWORD')
# Config adicionales
PROFILE_SLUG = os.getenv('LINKEDIN_PROFILE_SLUG', 'me')
HEADLESS = os.getenv('HEADLESS', 'false').strip().lower() in ('1', 'true', 'yes')
BASE_URL = os.getenv('LINKEDIN_BASE_URL', 'https://www.linkedin.com')
OUTPUT_DIR = os.getenv('OUTPUT_DIR', '.')
# Coma-separado: experience,education,certifications,courses,projects,volunteering,skills
DETAILS_SECTIONS = [s.strip() for s in os.getenv('DETAILS_SECTIONS', 'experience,education,certifications,courses').split(',') if s.strip()]
STORAGE_STATE = os.getenv('STORAGE_STATE', 'state.json')
DEBUG_DIR = os.getenv('DEBUG_DIR', '')
DEBUG_SAVE_HTML = os.getenv('DEBUG_SAVE_HTML', 'false').strip().lower() in ('1','true','yes')

if not EMAIL or not PASSWORD:
    raise Exception('Faltan credenciales en el archivo .env')

def scrape_linkedin_all():
    from playwright.sync_api import sync_playwright as _sp
    config = {
        'EMAIL': EMAIL,
        'PASSWORD': PASSWORD,
        'PROFILE_SLUG': PROFILE_SLUG,
        'HEADLESS': HEADLESS,
        'BASE_URL': BASE_URL,
        'DETAILS_SECTIONS': DETAILS_SECTIONS,
        'STORAGE_STATE': STORAGE_STATE,
        'DEBUG_DIR': DEBUG_DIR,
        'DEBUG_SAVE_HTML': DEBUG_SAVE_HTML,
    }
    with _sp() as p:
        return orchestrate_scrape(p, config)

def save_json(filename: str, data):
    """Guarda un dict como JSON en OUTPUT_DIR creando la carpeta si hace falta."""
    import os as _os
    import json as _json
    path = _os.path.join(OUTPUT_DIR, filename)
    dirpath = _os.path.dirname(path)
    if dirpath and not _os.path.exists(dirpath):
        _os.makedirs(dirpath, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        _json.dump(data, f, ensure_ascii=False, indent=2)


# -------------------- Parsing adapters (delegate to parsing.py) --------------------

def parse_experience_blocks(blocks: list[list[str]]) -> list[ExperienceEntry]:
    return parse_experience_blocks_impl(segment_by_aptitudes, blocks)


def parse_education_blocks(blocks: list[list[str]]) -> list[EducationEntry]:
    return parse_education_blocks_impl(blocks)


def parse_certifications_blocks(blocks: list[list[str]]) -> list[CertificationEntry]:
    return parse_certifications_blocks_impl(segment_by_aptitudes, blocks)


def parse_courses_blocks(blocks: list[list[str]]) -> list[CoursesEntry]:
    return parse_courses_blocks_impl(blocks)


def parse_languages_blocks(blocks: list[list[str]]) -> list[LanguageEntry]:
    return parse_languages_blocks_impl(blocks)

# -------------------- JS exports writer --------------------

def save_js_exports(filename: str, exports: dict):
    import json as _json
    import os as _os
    path = _os.path.join(OUTPUT_DIR, filename)
    _os.makedirs(_os.path.dirname(path) or '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        for name, value in exports.items():
            f.write(f"export const {name} = {_json.dumps(value, ensure_ascii=False, indent=2)};\n\n")

def main():
    data_all = scrape_linkedin_all()

    experiences_struct_dc = parse_experience_blocks(data_all.get('experience', []))
    experiences_struct = [asdict(x) for x in experiences_struct_dc]

    edu_struct_dc = parse_education_blocks(data_all.get('education', []))
    edu_struct = [asdict(x) for x in edu_struct_dc]

    certs_struct_dc = parse_certifications_blocks(data_all.get('certifications', []))
    certs_struct = [asdict(x) for x in certs_struct_dc]

    courses_struct_dc = parse_courses_blocks(data_all.get('courses', []))
    courses_struct = [asdict(x) for x in courses_struct_dc]

    languages_struct_dc = parse_languages_blocks(data_all.get('languages', []))
    languages_struct = [asdict(x) for x in languages_struct_dc]

    technologies, strengths, availability, hobbies, contact_raw = parse_about_extras(data_all.get('about_raw', []) or [])
    contact = parse_contact_info(contact_raw, data_all.get('profile_url'))

    outputs = {
        'linkedin_personal.json': {'personal': data_all.get('personal', {})},
        'linkedin_experience.json': {'experiences': experiences_struct},
        'linkedin_education.json': {'education': edu_struct},
        'linkedin_certifications.json': {'certifications': certs_struct},
        'linkedin_courses.json': {'courses': courses_struct},
        'linkedin_technologies.json': {'technologies': technologies},
        'linkedin_strengths.json': {'strengths': strengths},
        'linkedin_availability.json': {'availability': availability},
        'linkedin_hobbies.json': {'hobbies': hobbies},
        'linkedin_contact.json': {'contact': contact},
        'linkedin_languages.json': {'languages': languages_struct},
    }

    for fname, payload in outputs.items():
        save_json(fname, payload)

    print(f"Datos guardados en {OUTPUT_DIR}: " + ", ".join(outputs.keys()))
    
if __name__ == '__main__':
    main()
