#!/usr/bin/env python3
"""Copia de prueba: copia los JSON desde `cv-online/scraper/` a `cv-online/src/data/`.
Usar para verificar que la lógica de copia funciona sin ejecutar el scraper.
"""
import shutil
from pathlib import Path
import sys

ROOT = Path(__file__).parent.parent
SRC = ROOT / 'scraper'
DST = ROOT / 'src' / 'data'

json_files = [
    'linkedin_personal.json',
    'linkedin_experience.json',
    'linkedin_education.json',
    'linkedin_certifications.json',
    'linkedin_courses.json',
    'linkedin_technologies.json',
    'linkedin_strengths.json',
    'linkedin_languages.json',
    'linkedin_contact.json',
]

DST.mkdir(parents=True, exist_ok=True)

copied = 0
for jf in json_files:
    s = SRC / jf
    d = DST / jf
    if s.exists():
        shutil.copy2(s, d)
        print('Copied', jf)
        copied += 1
    else:
        print('Missing', jf)

print(f'Finished: {copied}/{len(json_files)} files copied')

sys.exit(0 if copied == len(json_files) else 1)
