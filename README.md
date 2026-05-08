# FSP case studies

React and Vite app for the FSP Data and AI case study programme.

The current case-study bundle has been split into individual static HTML pages
under `public/legacy-pages`. React owns the app shell, routing, navigation,
search, filters, and document viewer.

The current local design is a standalone app shell: searchable sidebar, library
dashboard, share popover, reader metadata, TL;DR summaries, and embedded legacy
pages.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production build is emitted to `dist`.

## Content model

`src/data/page-catalog.json` is the source of truth for the library. Each entry
defines the route, display labels, category, source bundle filename, generated
asset filename, sector, template, description, summary, tags, owner, audience,
and read-time metadata.

`src/data/pages.ts` derives app-ready values from that catalogue, including:

- `assetPath`
- `fullTitle`
- `summary`
- `sectorKey`
- case-study and campaign collections
- filter options
- template counts

The extraction script also reads `src/data/page-catalog.json`, so the app and
generated static assets stay aligned.

## Add or edit content

For small edits to existing case studies, edit the relevant file in
`public/legacy-pages`.

To add a new case study:

1. Add the HTML asset to `public/legacy-pages`, or add the page to the source
   bundle and run the extraction script.
2. Add one entry to `src/data/page-catalog.json`.
3. Use a stable route such as `/case-studies/example-client`.
4. Set `category` to `case-study`, `campaign`, or `overview`.
5. Add `summary`, `tags`, `readMinutes`, `updated`, `audience`, and `owner`
   metadata so the library card, sidebar, share view, and reader chrome update
   automatically.
6. Run `npm run build` and `npm run lint`.

The shell components live under `src/components`:

- `Sidebar.tsx` for searchable grouped navigation
- `LibraryDashboard.tsx` for dashboard, filters, activity rail, and cards
- `Reader.tsx` for metadata, pager, TL;DR, and embedded HTML page
- `SharePopover.tsx` for copy-link and client-safe sharing controls
- `TopChrome.tsx` for breadcrumbs and page-level sharing

When replacing the whole exported bundle, first add any new page mappings to
`src/data/page-catalog.json`, then run:

```bash
npm run extract:legacy -- "C:\path\to\case_studies_fsp_design.html"
```

## Azure Static Web Apps

This repo includes an Azure Static Web Apps workflow and
`public/staticwebapp.config.json`. Vite copies that config into `dist` during
the production build so Azure Static Web Apps can apply routing rules.

Create an Azure Static Web Apps resource, connect it to this GitHub repo, and
add the deployment token as the repository secret referenced by the workflow.

Recommended build settings:

```text
App location: /
Output location: dist
API location: blank
```

The current static web app config is public-link friendly. For an internal-only
deployment later, configure Microsoft Entra ID so sign-in is restricted to the
intended tenant or group before sharing the URL.
