#!/usr/bin/env python3
"""Turn a LinkedIn data export ZIP into data/base.json.

Usage: python importers/linkedin_zip.py <export.zip> [--data-date YYYY-MM] [--out data/base.json]

Standard library only. It reads the six whitelisted members by exact name and only the
columns listed in COLUMNS, so contacts, messages, birth date and address never get read
into the output. The export stays outside the repo.
"""

import argparse
import csv
import html
import io
import json
import re
import sys
import unicodedata
import zipfile
from pathlib import Path

DEFAULT_OUT = Path(__file__).resolve().parent.parent / "data" / "base.json"

# INTENTIONAL: privacy whitelist. The repo is public and the real export also holds
# Connections, messages, Address and Birth Date. Add a column here only if it is safe to publish.
COLUMNS = {
    "Profile.csv": ("First Name", "Last Name", "Headline", "Summary", "Geo Location"),
    "Positions.csv": ("Company Name", "Title", "Description", "Location", "Started On", "Finished On"),
    "Education.csv": ("School Name", "Start Date", "End Date", "Notes", "Degree Name"),
    "Certifications.csv": ("Name", "Url", "Authority", "Started On", "License Number"),
    "Skills.csv": ("Name",),
    "Languages.csv": ("Name", "Proficiency"),
}
MAX_MEMBER_BYTES = 5_000_000

# Fields that may legitimately span lines. Every other whitelisted field holding a line break means broken quoting.
MULTILINE_FIELDS = {("Profile.csv", "Summary"), ("Positions.csv", "Description"), ("Education.csv", "Notes")}
CONTROL_CHARS = re.compile("[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]")
LINE_BREAK = re.compile("[\r\n]")

# INTENTIONAL: exact names, never a prefix match: "Marketing 2020" must fail, not become March.
MONTH_NAMES = (
    ("january", "jan", "enero", "ene"),
    ("february", "feb", "febrero"),
    ("march", "mar", "marzo"),
    ("april", "apr", "abril", "abr"),
    ("may", "mayo"),
    ("june", "jun", "junio"),
    ("july", "jul", "julio"),
    ("august", "aug", "agosto", "ago"),
    ("september", "sep", "sept", "septiembre", "setiembre", "set"),
    ("october", "oct", "octubre"),
    ("november", "nov", "noviembre"),
    ("december", "dec", "diciembre", "dic"),
)
MONTHS = {name: number for number, names in enumerate(MONTH_NAMES, start=1) for name in names}
YEAR_MONTH = re.compile(r"\d{4}-(0[1-9]|1[0-2])")
DATE = re.compile(r"\d{4}(-(0[1-9]|1[0-2]))?")

BULLET_MARK = re.compile("[✅✔☑]️?")
DECORATION = re.compile("[\U0001f300-\U0001faff☀-➿️‍]+")
# A sentence end glued to the next sentence, as in "negocio.Me especializo".
GLUED_SENTENCE = re.compile(r"(?<=[a-záéíóúñ])\.(?=[A-ZÁÉÍÓÚÑ][a-záéíóúñ])")


class ImportFailure(Exception):
    """The input is incomplete or unreadable. Nothing gets written."""


def clean_text(value):
    """Decode HTML entities and collapse whitespace. Empty becomes None."""
    text = re.sub(r"\s+", " ", html.unescape(value or "")).strip()
    return text or None


def split_bullets(description):
    """Split a position description on the check-mark separators into clean bullets."""
    bullets = (clean_text(part) for part in BULLET_MARK.split(description or ""))
    return [bullet for bullet in bullets if bullet]


def split_about(summary):
    """Restore the line breaks the export lost in About: one string per paragraph or list item."""
    text = html.unescape(summary or "")
    text = DECORATION.sub("\n", text)
    text = text.replace("•", "\n• ")
    text = GLUED_SENTENCE.sub(".\n", text)
    lines = (clean_text(line) for line in text.splitlines())
    return [line for line in lines if line]


def normalize_date(value):
    """Turn 'Dec 2020', 'dic. 2020' or '2024' into YYYY-MM or YYYY. Empty stays None; anything else fails."""
    text = clean_text(value)
    if text is None:
        return None
    if re.fullmatch(r"\d{4}", text):
        return text
    match = re.fullmatch(r"([^\W\d]+)\.? (\d{4})", text)
    month = MONTHS.get(match.group(1).lower()) if match else None
    if month is None:
        raise ImportFailure(f"unrecognized date: {text!r}")
    return f"{match.group(2)}-{month:02d}"


def slug(text):
    ascii_text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")


def school_id(school):
    # "ISTEA - Instituto Superior ..." is identified by the part before the dash.
    return slug(school.split(" - ")[0])


def require(row, field, where):
    value = clean_text(row.get(field))
    if value is None:
        raise ImportFailure(f"{where}: required value {field!r} is empty")
    return value


def read_rows(archive, member):
    """Read one whitelisted member by exact name; fail on a missing file, column or short row."""
    try:
        info = archive.getinfo(member)
    except KeyError:
        raise ImportFailure(f"required file missing from the ZIP: {member}") from None
    if info.file_size > MAX_MEMBER_BYTES:
        raise ImportFailure(f"{member}: {info.file_size} bytes, too large for this file")
    try:
        # utf-8-sig drops the BOM the real export starts some files with.
        text = archive.read(info).decode("utf-8-sig")
    except UnicodeDecodeError as error:
        raise ImportFailure(f"{member}: not valid UTF-8 ({error})") from None
    try:
        rows = parse_rows(member, text)
    except csv.Error as error:
        raise ImportFailure(f"{member}: malformed CSV ({error})") from None
    if not rows:
        raise ImportFailure(f"{member}: no rows")
    return rows


def parse_rows(member, text):
    # INTENTIONAL: strict, because a lenient reader turns an unterminated quote into one plausible wrong value.
    reader = csv.DictReader(io.StringIO(text, newline=""), strict=True)
    columns = COLUMNS[member]
    header = reader.fieldnames or []
    missing = [column for column in columns if column not in header]
    if missing:
        raise ImportFailure(f"{member}: required columns missing: {missing}")
    duplicates = sorted({name for name in header if header.count(name) > 1})
    if duplicates:
        raise ImportFailure(f"{member}: duplicate columns: {duplicates}")
    rows = []
    for row in reader:
        if None in row or any(row[column] is None for column in columns):
            raise ImportFailure(f"{member} line {reader.line_num}: wrong number of columns")
        for column in columns:
            check_field(member, column, row[column], reader.line_num)
        rows.append({column: row[column] for column in columns})
    return rows


def check_field(member, column, value, line):
    if CONTROL_CHARS.search(value):
        raise ImportFailure(f"{member} line {line}: control character in {column!r}")
    if (member, column) not in MULTILINE_FIELDS and LINE_BREAK.search(value):
        raise ImportFailure(f"{member} line {line}: line break in single-line field {column!r}")


def read_profile(rows):
    if len(rows) != 1:
        raise ImportFailure(f"Profile.csv: expected 1 row, found {len(rows)}")
    row = rows[0]
    about = split_about(require(row, "Summary", "Profile.csv"))
    return {
        "firstName": require(row, "First Name", "Profile.csv"),
        "lastName": require(row, "Last Name", "Profile.csv"),
        "headline": require(row, "Headline", "Profile.csv"),
        "about": about,
        "geoLocation": clean_text(row["Geo Location"]),
    }


def read_position(row, number):
    where = f"Positions.csv row {number}"
    company = clean_text(row["Company Name"])
    end = normalize_date(row["Finished On"])
    return {
        # INTENTIONAL: the export leaves the company empty only on the freelance position.
        # A second one would collide on this id and fail in validate_base.
        "id": slug(company) if company else "freelance",
        "title": require(row, "Title", where),
        "company": company,
        "location": clean_text(row["Location"]),
        "start": normalize_date(require(row, "Started On", where)),
        "end": end,
        "current": end is None,
        "bullets": split_bullets(row["Description"]),
    }


def read_education(row, number, data_date):
    where = f"Education.csv row {number}"
    school = require(row, "School Name", where)
    end = normalize_date(row["End Date"])
    notes = clean_text(row["Notes"]) or ""
    return {
        "id": school_id(school),
        "degree": require(row, "Degree Name", where),
        "school": school,
        "start": normalize_date(row["Start Date"]),
        "end": end,
        "inProgress": "cursando" in notes.lower() or (end is not None and end[:4] > data_date[:4]),
    }


def read_certification(row, number):
    where = f"Certifications.csv row {number}"
    title = require(row, "Name", where)
    return {
        "id": slug(title),
        "title": title,
        "issuer": require(row, "Authority", where),
        "date": normalize_date(row["Started On"]),
        "credentialId": clean_text(row["License Number"]),
        "credentialUrl": clean_text(row["Url"]),
    }


def read_language(row, number):
    return {
        "name": require(row, "Name", f"Languages.csv row {number}"),
        "proficiency": clean_text(row["Proficiency"]),
    }


def build_base(archive, data_date):
    rows = {member: read_rows(archive, member) for member in COLUMNS}
    base = {
        "source": "linkedin-export",
        "dataDate": data_date,
        "profile": read_profile(rows["Profile.csv"]),
        "positions": [read_position(r, n) for n, r in enumerate(rows["Positions.csv"], 1)],
        "education": [read_education(r, n, data_date) for n, r in enumerate(rows["Education.csv"], 1)],
        "certifications": [read_certification(r, n) for n, r in enumerate(rows["Certifications.csv"], 1)],
        "skills": [require(r, "Name", f"Skills.csv row {n}") for n, r in enumerate(rows["Skills.csv"], 1)],
        "languages": [read_language(r, n) for n, r in enumerate(rows["Languages.csv"], 1)],
    }
    validate_base(base)
    return base


def validate_base(base):
    """Shared by both importers: same shape, unique ids, no half-built sections."""
    data_date = base.get("dataDate") or ""
    if not YEAR_MONTH.fullmatch(data_date):
        raise ImportFailure(f"dataDate must be a valid YYYY-MM, found {data_date!r}")
    if not base["profile"]["about"]:
        raise ImportFailure("profile.about is empty")
    for section in ("positions", "education", "certifications", "skills", "languages"):
        if not base[section]:
            raise ImportFailure(f"{section} is empty")
    for section in ("positions", "education", "certifications"):
        ids = [item["id"] for item in base[section]]
        duplicates = sorted({i for i in ids if ids.count(i) > 1})
        if duplicates or not all(ids):
            raise ImportFailure(f"{section}: empty or duplicate ids: {duplicates}")
    duplicates = sorted({s for s in base["skills"] if base["skills"].count(s) > 1})
    if duplicates:
        raise ImportFailure(f"skills: duplicates: {duplicates}")
    for position in base["positions"]:
        check_chronology(f"position {position['id']!r}", position["start"], position["end"], data_date)
        check_not_future(f"position {position['id']!r} end", position["end"], data_date)
    for item in base["education"]:
        # An end after the data date is fine here: a degree in progress has an expected end.
        check_chronology(f"education {item['id']!r}", item["start"], item["end"], data_date)
    for item in base["certifications"]:
        check_not_future(f"certification {item['id']!r} date", item["date"], data_date)


def check_date(value, where):
    if value is not None and not DATE.fullmatch(value):
        raise ImportFailure(f"{where}: invalid date {value!r}")


def earliest(date):
    return date if len(date) > 4 else f"{date}-01"


def latest(date):
    return date if len(date) > 4 else f"{date}-12"


def check_not_future(where, value, data_date):
    check_date(value, where)
    if value is not None and earliest(value) > data_date:
        raise ImportFailure(f"{where}: {value} is after the data date {data_date}")


def check_chronology(where, start, end, data_date):
    """YYYY-MM compares correctly as text; a bare year spans its whole year, so '2020' can end a '2020-05' start."""
    check_not_future(f"{where} start", start, data_date)
    check_date(end, f"{where} end")
    if start is not None and end is not None and latest(end) < earliest(start):
        raise ImportFailure(f"{where}: end {end} is before start {start}")


def write_base(base, out):
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(base, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def data_date_from_name(zip_path):
    """The export is named <...>_MM-DD-YYYY.zip; that is the date of the data."""
    match = re.search(r"(\d{2})-\d{2}-(\d{4})", Path(zip_path).name)
    if not match:
        raise ImportFailure("cannot read the date from the ZIP name; pass --data-date YYYY-MM")
    return f"{match.group(2)}-{match.group(1)}"


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("zip_path")
    parser.add_argument("--data-date", help="YYYY-MM; defaults to the date in the ZIP name")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args(argv)
    try:
        data_date = args.data_date or data_date_from_name(args.zip_path)
        with zipfile.ZipFile(args.zip_path) as archive:
            base = build_base(archive, data_date)
    except (ImportFailure, OSError, zipfile.BadZipFile) as error:
        print(f"linkedin_zip: {error}", file=sys.stderr)
        return 1
    write_base(base, args.out)
    print(
        f"{args.out}: {len(base['positions'])} positions, {len(base['education'])} education, "
        f"{len(base['certifications'])} certifications, {len(base['skills'])} skills, "
        f"{len(base['languages'])} languages"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
