# Updating the CV

## From a new LinkedIn export

This is the normal path. It needs no login and no scraper.

1. **Request the export.** In LinkedIn: Settings & Privacy > Data privacy > Get a copy of your data. Choose the full
   archive, because the importer needs six CSV files and stops if one is missing: `Profile`, `Positions`, `Education`,
   `Certifications`, `Skills` and `Languages`.

2. **Save the ZIP outside the repo.** It contains contacts and messages, and this repo is public. `.gitignore` also
   ignores `*.zip` and `export/` as a safety net.

3. **Import it.** This rewrites `data/base.json`:

   ```bash
   python importers/linkedin_zip.py "<path-to-export>.zip"
   ```

   It reads only those six CSV files and the columns in `COLUMNS` in the script. The CV date comes from the ZIP name
   (`..._MM-DD-YYYY`). If the file has another name, add `--data-date 2026-11`. If the data is incomplete, it stops with
   an error and writes nothing.

4. **See what changed:**

   ```bash
   git diff data/base.json
   ```

5. **Run the guard** until it passes:

   ```bash
   npm run content
   ```

   It lists what it finds and generates nothing until that's resolved. Translations are checked last, so new errors can
   appear after you fix the first ones:

   | Message | What to do |
   |---|---|
   | `skill "X" is neither grouped nor in omit` | Add it to a `skillGroups` group or to `omit` in `data/overlays/profile.json`. |
   | `bullet of "id" is neither tiered nor in omitBullets` | Put it in `bulletTiers.<id>.bullets` (always visible), `moreBullets` (under "see more") or `omitBullets`, in `profile.json`. |
   | `tiered bullet ... is not in the export`, `omitBullets entry is not in the export`, `skill "X" is not in the export` | The text changed or is gone: update or delete the entry in `profile.json`. |
   | `bulletRewrites entry is not in the export` | A bullet changed in LinkedIn. Update its key in `bulletRewrites` in `profile.json` and review the text. |
   | `missing translation: "..."` | Add `{ "source": "<Spanish text>", "en": "..." }` to `data/overlays/en.json`. |
   | `stale translation: "..."` | That Spanish text is no longer used: fix the `source` or delete the entry. |
   | `position "id" has no company and no engagement label` | Add the label to `engagements` in `profile.json`. |
   | `end is null without current: true` | The position has no end date and isn't marked as current: check `data/base.json`. |
   | `end ... is before start`, `... is after the data date` | Impossible date: check `data/base.json` or LinkedIn. Only a degree in progress can end after the export date. |
   | `company must be text or null` | Blank company: use `null` and add the label to `engagements`. |
   | `language name: duplicate` | The language appears twice: in the export and in `extraLanguages` in `profile.json`, or repeated. |
   | `print: position "id" is neither in print.positions nor in print.omitPositions` | A new position: give it a `summary`, `bullets` or both in `print.positions`, or list it in `print.omitPositions`. |
   | `print: bullet of "id" is not one of its tiered bullets` | `print.positions.<id>.bullets` takes the exported text of a bullet in its `bulletTiers`, not the rewritten one. |
   | `pdf --check failed: ... pages, the limit is 1` | The PDF no longer fits on one page: print fewer bullets or a shorter summary in `print`. |

6. **Check it locally:**

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173/` and `http://localhost:5173/en`. To see the build, `npm run preview` serves `dist/` with
   `/en` as in production (a middleware in `vite.config.js` rewrites it to `en/index.html`).

7. **Generate the PDFs and run the gates.** Each one has to finish without errors:

   ```bash
   npm run lint
   npm test
   npm run pdf
   npm run build
   npm run pdf -- --check
   ```

   `npm run pdf` runs a build, prints both pages with Chrome against a local server and writes
   `public/cv/Guido-Delponte-CV-{es,en}.pdf` and `public/cv/manifest.json`. The second build assembles `dist/` again
   with those PDFs.

   `--check` reads the PDFs with `pdftotext` from [Poppler](https://poppler.freedesktop.org/), which has to be on the
   PATH (Git for Windows ships it in `mingw64/bin`, which PowerShell doesn't have on its PATH by default).

8. **Commit the data and the PDFs:**

   ```bash
   git add data public/cv
   git commit -m "chore(data): update the CV from the MM-YYYY export"
   ```

## Other ways to update it

**Edit `data/base.json` by hand** for a one-off change. It has the same format the importer writes. Continue at step 5.
The next import overwrites this file: anything you change here and not in LinkedIn is lost at that point.

**Scraper, last resort.** `npm run scrape` logs in to LinkedIn with real credentials, and that already got an account
blocked. Run it only by hand, never in CI or on a schedule. See [scraper/README.md](../scraper/README.md). It feeds
`data/base.json` through `importers/from_scraper.py`.

## Text that doesn't come from LinkedIn

| File | Contents |
|---|---|
| `data/overlays/profile.json` | Contact, site URL, photo, `summary`, `headline`, the label of each position without a company, skill groups, `projects`, featured certifications, which bullets show and which are omitted, their rewritten text (`bulletRewrites`), language levels. Also `extraLanguages`: `Español / Nativo` isn't in the export (`Languages.csv` only has English) and no guard ties it to a source. |
| `data/overlays/en.json` | Translations, one `{ source, en }` entry per text. |
| `data/ui.es.json`, `data/ui.en.json` | Interface text. Both must have the same keys. |

`career`, inside `profile.json`, holds what the export doesn't have yet: new positions (`positions`), changes to an
exported position (`positionOverrides`), bullets (`extraBullets`), skills (`extraSkills`) and certifications
(`certifications`). It's merged before the guards, so it goes through the same checks. If a future export brings that
item, the build fails on a duplicate id and you remove it from `career`.

`print` chooses what the one-page PDF shows. `print.positions.<id>` takes a `summary` (a new text, translated in
`en.json`), `bullets` (exported bullets already in `bulletTiers`) or both. Every position is either there or in
`print.omitPositions`, and `print.certifications` lists the certification ids to print. The site still shows everything.

`projects` is a closed list: a repo appears on the site and in the PDF only if it's written there. The guard requires the
URL to be `https://github.com/GDelpo/<id>` and nothing after it. With an empty list, the section isn't shown.

The guard only checks that each translation matches the current Spanish text, not that it's right. The `status` field in
`en.json` records whether the translations have had a human review.

## How the build works

`npm run build` runs, in order: `build-content`, `vite build`, the SSR build of `src/entry-server.jsx`,
`scripts/prerender.mjs` and `scripts/verify-dist.mjs`. The output is `dist/`.

`verify-dist` fails the build if any of this doesn't hold:

- `lang`, a single `h1`, and as many positions, certifications, studies and projects in the HTML as the content has, plus
  the map in its 4 layouts. Canonical and hreflang on each page.
- No Spanish section title in `/en`, and no `dangerouslySetInnerHTML` in `src/`.
- `public/cv/manifest.json` matches the SHA-256 of `src/content/{es,en}.json`. If the content changed and the PDFs
  weren't regenerated, there's no build.
- Gzip budgets: JS 75 KB, CSS 12 KB, each language JSON 10 KB, fonts 91 KB, photo 30 KB.

`SKIP_PDF_CHECK=1` skips the manifest check. `npm run pdf` uses it for its internal build; a build made that way isn't
published.

The printed CV is a separate tree, `src/components/PrintCV.jsx`, that the browser mounts hidden after hydrating and that
only shows when printing. Its styles are at the end of `src/index.css`.

Colors and fonts are the CSS variables in `src/index.css`, mapped in `tailwind.config.js`. Those tokens replace the
Tailwind palette, so any other color has no class.

### The map

`layoutTransitMap` in `src/lib/transitMap.js` follows these rules:

- Years are to scale. The exception is a job that just started, which waits at the edge of the photo so it doesn't cover
  it.
- Two jobs that overlap in time run on parallel lines. One that starts when another ends uses the same line.
- The newest current job is the vermilion line.
- Each skill group is a branch out of the photo. On a phone they fold into a single link.

There are four layouts (`wide`, `mid`, `tablet`, `phone`). The lists below the map repeat all of its text.

## Repo layout

```
data/            base.json, overlays and interface text (the source of the content)
docs/            this page
importers/       export and scraper importers, with their tests
scraper/         isolated, manual only
scripts/         build-content, prerender, verify-dist, pdf
public/          404, robots, favicon, og.jpg, img/, cv/
src/App.jsx      page order
src/components/  one flat file per section
src/lib/         dates, theme, JSDoc types and the map geometry
src/content/     generated, not versioned
tests/           Vitest
```

## Deploy

`vercel.json` configures Vercel: it runs `npm run build` and publishes `dist/` with no SPA rewrite, so an unknown URL
returns `404.html` with status 404. `/assets/*` has immutable caching.

Vercel only needs Node, because `build-content` runs there and the PDFs are already committed. That's why they're
generated before pushing: with stale PDFs, `verify-dist` stops the deploy.

To check a deploy:

```bash
curl -I https://guido.is-a.dev/en      # 200, no redirect loop
curl -I https://guido.is-a.dev/nope    # 404
```

The source of `/en` has to contain the content and `lang="en"`.
