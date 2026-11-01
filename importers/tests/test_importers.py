"""Importer tests. Synthetic fixtures only: the real export never gets read here."""

import csv
import io
import json
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import from_scraper  # noqa: E402
import linkedin_zip  # noqa: E402
from linkedin_zip import ImportFailure  # noqa: E402

BOM = "﻿"
PROFILE_HEADER = ["First Name", "Last Name", "Address", "Birth Date", "Headline", "Summary", "Geo Location"]


def to_csv(header, rows, bom=False):
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(header)
    writer.writerows(rows)
    return (BOM if bom else "") + buffer.getvalue()


def members():
    return {
        "Profile.csv": to_csv(
            PROFILE_HEADER,
            [
                [
                    "Ana",
                    "Prueba",
                    "Calle Falsa 123",
                    "1 Jan 1990",
                    "Dev | R&amp;D",
                    "💻 Dev &amp; Analista con experiencia.Me gusta programar. Trabajo mucho."
                    "🚀 Hice:• APIs• Webs🎯 Quiero crecer.",
                    "Provincia, Argentina",
                ]
            ],
            bom=True,
        ),
        "Positions.csv": to_csv(
            ["Company Name", "Title", "Description", "Location", "Started On", "Finished On"],
            [
                ["Empresa &amp; Cía", " Dev ", "✅ Uno,  dos. ✅ Tres &amp; cuatro.", "", "Dec 2020", ""],
                ["", "Consultora", "✅ Solo uno.", "", "Dec 2018", ""],
                ["Vieja", "Soporte", "Sin separador.", "Remoto", "Apr 2015", "Nov 2020"],
            ],
        ),
        "Education.csv": to_csv(
            ["School Name", "Start Date", "End Date", "Notes", "Degree Name", "Activities"],
            [
                ["ABC - Instituto Largo", "2025", "2027", "Actualmente cursando. ", "Software", ""],
                ["Otra Escuela", "2019", "2022", "", "Analista", ""],
            ],
        ),
        "Certifications.csv": to_csv(
            ["Name", "Url", "Authority", "Started On", "Finished On", "License Number"],
            [
                [" Curso Uno ", "", "Plataforma", "", "", ""],
                ["Curso Dos", "https://example.com/c/2", "Instituto", "2024", "", "123 "],
            ],
        ),
        "Skills.csv": to_csv(["Name"], [["Python "], ["Administración de redes"]]),
        "Languages.csv": to_csv(["Name", "Proficiency"], [["Inglés", "Full professional proficiency"]]),
        "messages.csv": "FROM,CONTENT\nsomeone,PRIVATE-MESSAGE\n",
    }


def make_zip(content):
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        for name, text in content.items():
            archive.writestr(name, text.encode("utf-8"))
    buffer.seek(0)
    return zipfile.ZipFile(buffer)


def build(content=None):
    return linkedin_zip.build_base(make_zip(content or members()), "2026-10")


class TextHelpers(unittest.TestCase):
    def test_dates(self):
        self.assertEqual(linkedin_zip.normalize_date("Dec 2020"), "2020-12")
        self.assertEqual(linkedin_zip.normalize_date("dic. 2020"), "2020-12")
        self.assertEqual(linkedin_zip.normalize_date(" 2024 "), "2024")
        self.assertIsNone(linkedin_zip.normalize_date("  "))
        for value, expected in (
            ("Sept 2020", "2020-09"),
            ("setiembre 2020", "2020-09"),
            ("May 2020", "2020-05"),
            ("mayo 2020", "2020-05"),
            ("December 2020", "2020-12"),
        ):
            self.assertEqual(linkedin_zip.normalize_date(value), expected)

    def test_bad_date_fails(self):
        for value in ("Foo 2020", "12/2020", "soon", "Marketing 2020", "Decano 2020", "Junk 2020", "Mayonesa 2020"):
            with self.assertRaises(ImportFailure):
                linkedin_zip.normalize_date(value)

    def test_clean_text(self):
        self.assertEqual(linkedin_zip.clean_text("  a &amp;  b\n"), "a & b")
        self.assertIsNone(linkedin_zip.clean_text("   "))

    def test_slug_drops_accents(self):
        self.assertEqual(linkedin_zip.slug("Maratón de Buenos Aires"), "maraton-de-buenos-aires")


class ZipImporter(unittest.TestCase):
    def test_about_gets_its_line_breaks_back(self):
        self.assertEqual(
            build()["profile"]["about"],
            [
                "Dev & Analista con experiencia.",
                "Me gusta programar. Trabajo mucho.",
                "Hice:",
                "• APIs",
                "• Webs",
                "Quiero crecer.",
            ],
        )

    def test_position_edge_cases(self):
        first, freelance, old = build()["positions"]
        self.assertEqual(first["id"], "empresa-cia")
        self.assertEqual(first["company"], "Empresa & Cía")
        self.assertEqual(first["title"], "Dev")
        self.assertEqual(first["bullets"], ["Uno, dos.", "Tres & cuatro."])
        self.assertIsNone(first["location"])
        self.assertTrue(first["current"])
        self.assertEqual(freelance["id"], "freelance")
        self.assertIsNone(freelance["company"])
        self.assertEqual(old["bullets"], ["Sin separador."])
        self.assertEqual((old["end"], old["current"]), ("2020-11", False))

    def test_education_and_certifications(self):
        base = build()
        self.assertEqual(base["education"][0]["id"], "abc")
        self.assertTrue(base["education"][0]["inProgress"])
        self.assertFalse(base["education"][1]["inProgress"])
        self.assertEqual(
            base["certifications"][0],
            {
                "id": "curso-uno",
                "title": "Curso Uno",
                "issuer": "Plataforma",
                "date": None,
                "credentialId": None,
                "credentialUrl": None,
            },
        )
        self.assertEqual(base["certifications"][1]["credentialId"], "123")

    def test_skills_are_trimmed(self):
        self.assertEqual(build()["skills"], ["Python", "Administración de redes"])

    def test_private_data_never_reaches_the_output(self):
        output = json.dumps(build(), ensure_ascii=False)
        for private in ("Calle Falsa", "1990", "PRIVATE-MESSAGE", "Address", "Birth"):
            self.assertNotIn(private, output)

    def test_non_whitelisted_member_is_never_opened(self):
        archive = make_zip(members())
        opened = []
        original = archive.read
        archive.read = lambda info, *rest: opened.append(getattr(info, "filename", info)) or original(info, *rest)
        linkedin_zip.build_base(archive, "2026-10")
        self.assertEqual(sorted(opened), sorted(linkedin_zip.COLUMNS))

    def test_missing_file_fails(self):
        for member in linkedin_zip.COLUMNS:
            content = members()
            del content[member]
            with self.assertRaisesRegex(ImportFailure, member):
                build(content)

    def test_member_in_a_subfolder_does_not_count(self):
        content = members()
        content["copy/Skills.csv"] = content.pop("Skills.csv")
        with self.assertRaisesRegex(ImportFailure, "Skills.csv"):
            build(content)

    def test_missing_column_fails(self):
        content = members()
        content["Positions.csv"] = to_csv(["Company Name", "Title"], [["A", "B"]])
        with self.assertRaisesRegex(ImportFailure, "required columns missing"):
            build(content)

    def test_empty_file_fails(self):
        content = members()
        content["Skills.csv"] = "Name\n"
        with self.assertRaisesRegex(ImportFailure, "no rows"):
            build(content)

    def test_short_row_fails(self):
        content = members()
        content["Languages.csv"] = "Name,Proficiency\nInglés\n"
        with self.assertRaisesRegex(ImportFailure, "wrong number of columns"):
            build(content)

    def test_empty_required_value_fails(self):
        content = members()
        content["Positions.csv"] = to_csv(
            ["Company Name", "Title", "Description", "Location", "Started On", "Finished On"],
            [["Empresa", "", "", "", "2020", ""]],
        )
        with self.assertRaisesRegex(ImportFailure, "Title"):
            build(content)

    def test_two_positions_without_company_collide(self):
        content = members()
        content["Positions.csv"] = to_csv(
            ["Company Name", "Title", "Description", "Location", "Started On", "Finished On"],
            [["", "A", "", "", "2020", ""], ["", "B", "", "", "2021", ""]],
        )
        with self.assertRaisesRegex(ImportFailure, "duplicate"):
            build(content)

    POSITION_HEADER = ("Company Name", "Title", "Description", "Location", "Started On", "Finished On")

    def assert_positions_fail(self, row, message):
        content = members()
        content["Positions.csv"] = to_csv(self.POSITION_HEADER, [row])
        with self.assertRaisesRegex(ImportFailure, message):
            build(content)

    def test_impossible_position_dates_fail(self):
        self.assert_positions_fail(["E", "T", "", "", "Jan 2020", "Jan 2010"], "before start")
        self.assert_positions_fail(["E", "T", "", "", "9999", ""], "after the data date")
        self.assert_positions_fail(["E", "T", "", "", "Jan 2020", "Jan 2027"], "after the data date")

    def test_year_only_end_may_close_a_start_in_the_same_year(self):
        content = members()
        content["Positions.csv"] = to_csv(self.POSITION_HEADER, [["E", "T", "", "", "May 2020", "2020"]])
        self.assertEqual(build(content)["positions"][0]["end"], "2020")

    def test_education_may_end_after_the_data_date_but_not_before_it_starts(self):
        self.assertEqual(build()["education"][0]["end"], "2027")
        content = members()
        content["Education.csv"] = to_csv(
            ["School Name", "Start Date", "End Date", "Notes", "Degree Name"], [["S", "2022", "2019", "", "D"]]
        )
        with self.assertRaisesRegex(ImportFailure, "before start"):
            build(content)

    def test_future_certification_fails(self):
        content = members()
        content["Certifications.csv"] = to_csv(
            ["Name", "Url", "Authority", "Started On", "License Number"], [["C", "", "A", "Nov 2026", ""]]
        )
        with self.assertRaisesRegex(ImportFailure, "after the data date"):
            build(content)

    def test_invalid_data_date_fails(self):
        for value in ("2026-13", "2026-00", "2026"):
            with self.assertRaisesRegex(ImportFailure, "dataDate"):
                linkedin_zip.build_base(make_zip(members()), value)

    def assert_skills_fail(self, text, message):
        content = members()
        content["Skills.csv"] = text
        with self.assertRaisesRegex(ImportFailure, message):
            build(content)

    def test_unterminated_quote_fails(self):
        self.assert_skills_fail('Name\n"Python\nGo\nRust', "malformed CSV")

    def test_duplicate_header_fails(self):
        self.assert_skills_fail("Name,Name\nPython,Evil\n", "duplicate columns")

    def test_control_character_fails(self):
        self.assert_skills_fail("Name\nPy\x00thon\n", "control character|malformed CSV")
        self.assert_skills_fail("Name\nPy\x07thon\n", "control character")

    def test_line_break_in_single_line_field_fails(self):
        self.assert_skills_fail('Name\n"Python\nGo"\n', "line break")

    def test_line_break_in_description_is_fine(self):
        content = members()
        content["Positions.csv"] = to_csv(self.POSITION_HEADER, [["E", "T", "uno\ndos", "", "2020", ""]])
        self.assertEqual(build(content)["positions"][0]["bullets"], ["uno dos"])

    def test_oversized_field_fails_with_a_message(self):
        self.assert_skills_fail("Name\n" + "x" * 200_000 + "\n", "malformed CSV")

    def test_data_date_from_zip_name(self):
        self.assertEqual(linkedin_zip.data_date_from_name("Export_10-20-2026.zip"), "2026-10")
        with self.assertRaises(ImportFailure):
            linkedin_zip.data_date_from_name("export.zip")

    def test_cli_writes_nothing_on_failure(self):
        with tempfile.TemporaryDirectory() as folder:
            zip_path = Path(folder) / "Export_10-20-2026.zip"
            content = members()
            del content["Skills.csv"]
            with zipfile.ZipFile(zip_path, "w") as archive:
                for name, text in content.items():
                    archive.writestr(name, text.encode("utf-8"))
            out = Path(folder) / "base.json"
            self.assertEqual(linkedin_zip.main([str(zip_path), "--out", str(out)]), 1)
            self.assertFalse(out.exists())


def scraper_files():
    return {
        "linkedin_personal.json": {
            "personal": {
                "name": "Ana Prueba",
                "title": "Dev",
                "photo": "https://example.com/p.jpg",
                "description": "<b>Dev</b> con experiencia.\nMe gusta programar.",
            }
        },
        "linkedin_contact.json": {"contact": {"location": "Ciudad, AR (X1234)", "email": "a@example.com"}},
        "linkedin_experience.json": {
            "experiences": [
                {
                    "title": "Dev",
                    "company": "Empresa · Jornada completa",
                    "period": "dic. 2020 - actualidad · 4 años 11 meses",
                    "location": "Ciudad · Híbrido",
                    "description": "Resumen del rol.",
                    "sections": [{"title": "Logros", "items": ["Uno", " Dos "]}],
                },
                {
                    "title": "Consultora",
                    "company": "Profesional independiente",
                    "period": "ene. 2018 - nov. 2019 · 1 año",
                    "location": "",
                    "description": "",
                    "sections": [],
                },
            ]
        },
        "linkedin_education.json": {
            "education": [
                {"title": "Analista", "institution": "Escuela", "period": "2019 - 2022"},
                {"title": "Curso", "institution": "Otra - Larga", "period": "2018"},
            ]
        },
        "linkedin_certifications.json": {
            "certifications": [
                {
                    "title": "Curso Uno",
                    "institution": "Plataforma",
                    "date": "nov. 2024",
                    "credentialUrl": "https://example.com/c",
                    "credentialId": "abc",
                    "verified": True,
                }
            ]
        },
        "linkedin_technologies.json": {
            "technologies": {
                "Lenguajes": [{"name": "Python", "frameworks": ["FastAPI"]}],
                "Herramientas": ["Git", "Python"],
            }
        },
        "linkedin_languages.json": {"languages": [{"language": "Inglés", "level": "Intermedio", "certifications": ""}]},
    }


class ScraperMapping(unittest.TestCase):
    def build(self, files=None):
        with tempfile.TemporaryDirectory() as folder:
            for name, payload in (scraper_files() if files is None else files).items():
                (Path(folder) / name).write_text(json.dumps(payload), encoding="utf-8")
            return from_scraper.build_base(folder, "2026-10")

    def test_same_shape_as_the_zip_importer(self):
        scraped, exported = self.build(), build()
        self.assertEqual(set(scraped), set(exported))
        for section in ("positions", "education", "certifications"):
            self.assertEqual(set(scraped[section][0]), set(exported[section][0]), section)
        self.assertEqual(set(scraped["profile"]), set(exported["profile"]))
        self.assertEqual(set(scraped["languages"][0]), set(exported["languages"][0]))

    def test_position_mapping(self):
        current, freelance = self.build()["positions"]
        self.assertEqual(current["company"], "Empresa")
        self.assertEqual(current["location"], "Ciudad")
        self.assertEqual((current["start"], current["end"], current["current"]), ("2020-12", None, True))
        self.assertEqual(current["bullets"], ["Resumen del rol.", "Uno", "Dos"])
        self.assertEqual(freelance["id"], "freelance")
        self.assertIsNone(freelance["company"])
        self.assertEqual((freelance["start"], freelance["end"]), ("2018-01", "2019-11"))

    def test_verified_and_markup_do_not_survive(self):
        base = self.build()
        self.assertNotIn("verified", json.dumps(base))
        self.assertNotIn("<b>", json.dumps(base))
        self.assertEqual(base["profile"]["geoLocation"], "Ciudad, AR")

    def test_skills_are_flattened_without_duplicates(self):
        self.assertEqual(self.build()["skills"], ["Python", "FastAPI", "Git"])

    def test_single_year_period(self):
        self.assertEqual(self.build()["education"][1]["start"], "2018")
        self.assertEqual(self.build()["education"][1]["id"], "otra")

    def test_missing_file_fails(self):
        files = scraper_files()
        del files["linkedin_experience.json"]
        with self.assertRaisesRegex(ImportFailure, "linkedin_experience.json"):
            self.build(files)

    def test_missing_key_fails(self):
        files = scraper_files()
        files["linkedin_education.json"] = {}
        with self.assertRaisesRegex(ImportFailure, "education"):
            self.build(files)

    def test_empty_section_fails(self):
        files = scraper_files()
        files["linkedin_certifications.json"] = {"certifications": []}
        with self.assertRaisesRegex(ImportFailure, "certifications is empty"):
            self.build(files)

    def test_unparsable_period_fails(self):
        files = scraper_files()
        files["linkedin_experience.json"]["experiences"][0]["period"] = "hace mucho"
        with self.assertRaisesRegex(ImportFailure, "experience item 1"):
            self.build(files)


if __name__ == "__main__":
    unittest.main()
