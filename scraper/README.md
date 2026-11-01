# LinkedIn scraper (manual, last resort)

**This can get your LinkedIn account banned. It already got one blocked.** It logs in with real credentials
and drives a browser against LinkedIn, which its terms forbid.

- Use the export first: request the data archive from LinkedIn and run `importers/linkedin_zip.py` on it.
  If a field changed, editing `data/base.json` by hand is the next option.
- Run this only by hand, as the last resort.
- It must never run in CI, on a schedule or on a server. There is no workflow for it on purpose.
- `.env` and `state.json` are secrets: `state.json` is a browser session, equivalent to a login. Both are gitignored.

## Run

```
pip install -r scraper/requirements.txt
cp scraper/.env.example scraper/.env    # then fill in the values
npm run scrape
```

`npm run scrape` runs `scrape_and_copy.py`: it writes the `linkedin_*.json` files to `scraper/`, then maps them to
`data/base.json` through `importers/from_scraper.py`. Then run `npm run content`: the guard fails on every string that
changed until the overlays in `data/overlays/` match again.
