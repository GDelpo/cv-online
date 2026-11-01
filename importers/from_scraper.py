#!/usr/bin/env python3
"""Map the scraper's JSON files to the same data/base.json shape as linkedin_zip.py.

Usage: python importers/from_scraper.py <dir with linkedin_*.json> --data-date YYYY-MM [--out data/base.json]

Manual alternative only: see scraper/README.md. The fields whitelisted here are the whole
contract, so anything else the scraper emits (such as `verified`) never reaches base.json.
"""

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from linkedin_zip import (  # noqa: E402
    DEFAULT_OUT,
    ImportFailure,
    clean_text,
    normalize_date,
    school_id,
    slug,
    split_about,
    split_bullets,
    validate_base,
    write_base,
)

# LinkedIn's Spanish UI prints this in the company slot of a self-employed position.
SELF_EMPLOYED = "profesional independiente"
PRESENT = {"actualidad", "presente", "present"}


def load(directory, filename, key):
    path = Path(directory) / filename
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise ImportFailure(f"required scraper file missing: {path}") from None
    except json.JSONDecodeError as error:
        raise ImportFailure(f"{path}: invalid JSON ({error})") from None
    if not isinstance(payload, dict) or key not in payload:
        raise ImportFailure(f"{path}: required key {key!r} missing")
    return payload[key]


def field(item, name, where):
    value = clean_text(item.get(name)) if isinstance(item, dict) else None
    if value is None:
        raise ImportFailure(f"{where}: required value {name!r} is empty")
    return value


def first_segment(text):
    """The scraper joins extras with a middle dot: 'Noble Seguros · Jornada completa'."""
    return clean_text((text or "").split("·")[0])


def parse_period(period, where):
    """'dic. 2020 - actualidad · 4 años' into (start, end, current). One date means start == end."""
    text = first_segment(period)
    if text is None:
        return None, None, False
    parts = [part.strip() for part in re.split(r"\s[-–]\s", text)]
    if len(parts) > 2:
        raise ImportFailure(f"{where}: unrecognized period {period!r}")
    try:
        start = normalize_date(parts[0])
        if len(parts) == 1:
            return start, start, False
        if parts[1].lower() in PRESENT:
            return start, None, True
        return start, normalize_date(parts[1]), False
    except ImportFailure as error:
        raise ImportFailure(f"{where}: {error}") from None


def map_position(item, number):
    where = f"experience item {number}"
    company = first_segment(item.get("company"))
    if company and company.lower() == SELF_EMPLOYED:
        company = None
    start, end, current = parse_period(item.get("period"), where)
    if start is None:
        raise ImportFailure(f"{where}: required value 'period' is empty")
    bullets = split_bullets(item.get("description"))
    for section in item.get("sections") or []:
        bullets.extend(text for text in map(clean_text, section.get("items") or []) if text)
    return {
        "id": slug(company) if company else "freelance",
        "title": field(item, "title", where),
        "company": company,
        "location": first_segment(item.get("location")),
        "start": start,
        "end": end,
        "current": current,
        "bullets": bullets,
    }


def map_education(item, number, data_date):
    where = f"education item {number}"
    school = field(item, "institution", where)
    start, end, _ = parse_period(item.get("period"), where)
    return {
        "id": school_id(school),
        "degree": field(item, "title", where),
        "school": school,
        "start": start,
        "end": end,
        "inProgress": end is not None and end[:4] > data_date[:4],
    }


def map_certification(item, number):
    where = f"certifications item {number}"
    title = field(item, "title", where)
    date = clean_text(item.get("date"))
    try:
        date = normalize_date(date)
    except ImportFailure as error:
        raise ImportFailure(f"{where}: {error}") from None
    return {
        "id": slug(title),
        "title": title,
        "issuer": field(item, "institution", where),
        "date": date,
        "credentialId": clean_text(item.get("credentialId")),
        "credentialUrl": clean_text(item.get("credentialUrl")),
    }


def flatten_skills(technologies):
    """Technologies are {category: [str | {name, frameworks: [str]}]}."""
    if not isinstance(technologies, dict):
        raise ImportFailure("technologies must be an object of categories")
    skills = []
    for entries in technologies.values():
        for entry in entries:
            names = [entry] if isinstance(entry, str) else [entry["name"], *entry.get("frameworks", [])]
            skills.extend(name for name in map(clean_text, names) if name and name not in skills)
    return skills


def build_base(directory, data_date):
    personal = load(directory, "linkedin_personal.json", "personal")
    contact = load(directory, "linkedin_contact.json", "contact")
    name = field(personal, "name", "personal").split(" ", 1)
    if len(name) != 2:
        raise ImportFailure("personal: 'name' needs a first and a last name")
    description = re.sub(r"</?b>", "", personal.get("description") or "")
    location = re.sub(r"\([^)]*\)", "", contact.get("location") or "")
    positions = load(directory, "linkedin_experience.json", "experiences")
    education = load(directory, "linkedin_education.json", "education")
    certifications = load(directory, "linkedin_certifications.json", "certifications")
    languages = load(directory, "linkedin_languages.json", "languages")
    base = {
        "source": "linkedin-scraper",
        "dataDate": data_date,
        "profile": {
            "firstName": name[0],
            "lastName": name[1],
            "headline": field(personal, "title", "personal"),
            "about": split_about(description),
            "geoLocation": clean_text(location),
        },
        "positions": [map_position(item, n) for n, item in enumerate(positions, 1)],
        "education": [map_education(item, n, data_date) for n, item in enumerate(education, 1)],
        "certifications": [map_certification(item, n) for n, item in enumerate(certifications, 1)],
        "skills": flatten_skills(load(directory, "linkedin_technologies.json", "technologies")),
        "languages": [
            {"name": field(item, "language", f"languages item {n}"), "proficiency": clean_text(item.get("level"))}
            for n, item in enumerate(languages, 1)
        ],
    }
    validate_base(base)
    return base


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("directory")
    parser.add_argument("--data-date", required=True, help="YYYY-MM the scrape was taken")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args(argv)
    try:
        base = build_base(args.directory, args.data_date)
    except ImportFailure as error:
        print(f"from_scraper: {error}", file=sys.stderr)
        return 1
    write_base(base, args.out)
    print(f"{args.out}: {len(base['positions'])} positions from the scraper output")
    return 0


if __name__ == "__main__":
    sys.exit(main())
