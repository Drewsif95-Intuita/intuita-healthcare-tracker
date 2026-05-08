import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const defaultInput = 'case_studies_fsp_design.html'
const inputPath = process.argv[2] ?? defaultInput
const outputDir = path.resolve('public', 'legacy-pages')
const catalogPath = path.resolve('src', 'data', 'page-catalog.json')

const typekitLink =
  '<link rel="stylesheet" href="https://use.typekit.net/eal8wec.css"/>'

const documentModeCss = `

/* FSP Case Study Hub document mode
   The React app owns navigation and sharing chrome, so exported pages render
   as standalone case-study documents instead of full website pages. */
.utility-bar,
.main-nav,
.breadcrumb,
.hero__ctas,
.anchor-strip,
.site-footer,
section#contact,
section#related,
section.related,
.cta-panel,
.related-grid,
section:has(.cta-panel),
section:has(.related-grid) {
  display: none !important;
}

.hero {
  padding-block: clamp(3rem, 6vw, 5rem) !important;
}

.hero__deck {
  margin-bottom: 0 !important;
}

body {
  min-height: 100vh;
}
`

const brandReplacements = [
  [/#0D2A2E/gi, '#022E34'],
  [/#08201F/gi, '#001414'],
  [/#143638/gi, '#023F47'],
  [/#F5F5F1/gi, '#F8F8F8'],
  [/#9FE5BD/gi, '#64D5B3'],
  [/#B8E0C9/gi, '#7FF0CE'],
  [/#B6EFCD/gi, '#7FF0CE'],
  [/#0D4528/gi, '#023F47'],
  [/rgba\(159,\s*229,\s*189,/gi, 'rgba(100, 213, 179,'],
  [/'Inter', -apple-system/gi, '"neue-haas-unica", -apple-system'],
  [/font-family="Inter,\s*sans-serif"/gi, 'font-family="neue-haas-unica, sans-serif"'],
]

function normaliseBrand(html) {
  let normalised = html

  for (const [pattern, replacement] of brandReplacements) {
    normalised = normalised.replace(pattern, replacement)
  }

  if (!normalised.includes('https://use.typekit.net/eal8wec.css')) {
    normalised = normalised.replace(
      /(<meta[^>]+viewport[^>]*>\s*)/i,
      `$1\n${typekitLink}\n`,
    )
  }

  if (!normalised.includes('FSP Case Study Hub document mode')) {
    normalised = normalised.replace('</style>', `${documentModeCss}\n</style>`)
  }

  return normalised
}

const source = await readFile(inputPath, 'utf8')
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
const catalogBySourceFile = new Map(
  catalog.map((page) => [page.sourceFile, page]),
)
const match = source.match(
  /<script id="page-data" type="application\/json">([\s\S]*?)<\/script>/,
)

if (!match) {
  throw new Error(`Could not find the page-data script in ${inputPath}`)
}

const pages = JSON.parse(match[1])
await mkdir(outputDir, { recursive: true })

const manifest = []
const extractedSourceFiles = new Set()

for (const page of pages) {
  const catalogItem = catalogBySourceFile.get(page.file)

  if (!catalogItem) {
    throw new Error(
      `No catalogue entry found for ${page.file}. Add it to ${catalogPath} before extracting.`,
    )
  }

  extractedSourceFiles.add(page.file)

  const outputPath = path.join(outputDir, catalogItem.assetFile)
  await writeFile(outputPath, normaliseBrand(page.html), 'utf8')
  manifest.push({
    ...catalogItem,
    extractedTitle: page.title,
    assetPath: `/legacy-pages/${catalogItem.assetFile}`,
  })
}

const missingFromBundle = catalog.filter(
  (page) => !extractedSourceFiles.has(page.sourceFile),
)

if (missingFromBundle.length > 0) {
  console.warn(
    `Catalogue entries not found in source bundle: ${missingFromBundle
      .map((page) => page.sourceFile)
      .join(', ')}`,
  )
}

await writeFile(
  path.join(outputDir, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
)

console.log(`Extracted ${manifest.length} pages to ${outputDir}`)
