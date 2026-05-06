# FSP case studies

React and Vite static site for the FSP Data and AI case study programme.

The current case-study bundle has been split into individual static HTML pages
under `public/legacy-pages`. React owns the shell, routing, navigation, and
metadata in `src/data/pages.ts`, which gives us a clean place to add search,
filters, approvals, or a CMS-backed content model later.

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

## Add or edit content

For small edits to existing case studies, edit the relevant file in
`public/legacy-pages`.

When replacing the whole exported bundle, run:

```bash
npm run extract:legacy -- "C:\path\to\case_studies_fsp_design.html"
```

Then update `src/data/pages.ts` if you add, remove, rename, or re-route pages.

## Azure Static Web Apps

This repo includes `.github/workflows/azure-static-web-apps.yml` and
`public/staticwebapp.config.json`. Vite copies that config into `dist` during
the production build so Azure Static Web Apps can apply the routing and auth
rules.

Create an Azure Static Web Apps resource, connect it to this GitHub repo, and
add the deployment token as a repository secret named:

```text
AZURE_STATIC_WEB_APPS_API_TOKEN
```

Recommended build settings:

```text
App location: /
Output location: dist
API location: blank
```

The static web app config currently requires authenticated access for all
routes. For a truly internal-only deployment, configure Microsoft Entra ID so
sign-in is restricted to the intended tenant or group before sharing the URL.
