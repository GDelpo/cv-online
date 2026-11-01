#!/usr/bin/env python3
"""Run the LinkedIn scraper by hand and map its output to data/base.json.

Manual only and last resort: it can get the account banned. See scraper/README.md.

Usage: npm run scrape
"""

import datetime
import os
import sys
from pathlib import Path

SCRAPER_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRAPER_DIR.parent


def main():
    # INTENTIONAL: forced, not a default. from_scraper reads this folder, so a different
    # OUTPUT_DIR would silently map the JSON of an older run.
    os.environ["OUTPUT_DIR"] = str(SCRAPER_DIR)
    sys.path[:0] = [str(SCRAPER_DIR / "src"), str(REPO_ROOT / "importers")]

    from linkedin_scraper import main as scrape_main
    import from_scraper

    scrape_main()
    data_date = datetime.date.today().strftime("%Y-%m")
    return from_scraper.main([str(SCRAPER_DIR), "--data-date", data_date])


if __name__ == "__main__":
    sys.exit(main())
