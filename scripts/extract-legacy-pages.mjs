import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const defaultInput = 'case_studies_fsp_design.html'
const inputPath = process.argv[2] ?? defaultInput
const outputDir = path.resolve('public', 'legacy-pages')

const assetNames = new Map([
  ['00_Index.html', 'bundle-index.html'],
  ['04_OneView_FSP_CaseStudy.html', 'oneview.html'],
  ['05_HyperOptic_FSP_CaseStudy.html', 'hyperoptic.html'],
  ['08_OhPolly_FSP_CaseStudy.html', 'oh-polly.html'],
  ['06_AJW_FSP_CaseStudy.html', 'ajw-stock-optimisation.html'],
  ['09_Sovereign_FSP_CaseStudy.html', 'sovereign-community-model.html'],
  ['07_CoOp_FSP_CaseStudy.html', 'coop-managed-service.html'],
  ['10_Campaign_Overview.html', 'campaign-overview.html'],
  ['LinkedIn_Posts_Full_Campaign.md', 'linkedin-posts.html'],
])

const source = await readFile(inputPath, 'utf8')
const match = source.match(
  /<script id="page-data" type="application\/json">([\s\S]*?)<\/script>/,
)

if (!match) {
  throw new Error(`Could not find the page-data script in ${inputPath}`)
}

const pages = JSON.parse(match[1])
await mkdir(outputDir, { recursive: true })

const manifest = []

for (const page of pages) {
  const assetName = assetNames.get(page.file)

  if (!assetName) {
    throw new Error(`No output filename mapped for ${page.file}`)
  }

  const outputPath = path.join(outputDir, assetName)
  await writeFile(outputPath, page.html, 'utf8')
  manifest.push({
    sourceFile: page.file,
    label: page.label,
    title: page.title,
    assetPath: `/legacy-pages/${assetName}`,
  })
}

await writeFile(
  path.join(outputDir, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
)

console.log(`Extracted ${manifest.length} pages to ${outputDir}`)
