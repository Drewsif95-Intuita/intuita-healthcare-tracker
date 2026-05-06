export type PageCategory = 'overview' | 'case-study' | 'campaign'

export type LegacyPage = {
  sourceFile: string
  slug: string
  routePath: string
  assetPath: string
  label: string
  title: string
  shortTitle: string
  category: PageCategory
  template?: string
  sector?: string
  description: string
  order: number
}

export const pages = [
  {
    sourceFile: '00_Index.html',
    slug: 'bundle',
    routePath: '/bundle',
    assetPath: '/legacy-pages/bundle-index.html',
    label: 'Bundle index',
    title: 'FSP Data and AI Case Study Programme Bundle',
    shortTitle: 'Bundle',
    category: 'overview',
    description:
      'The original review bundle with the complete case study programme and launch checklist.',
    order: 0,
  },
  {
    sourceFile: '04_OneView_FSP_CaseStudy.html',
    slug: 'oneview',
    routePath: '/case-studies/oneview',
    assetPath: '/legacy-pages/oneview.html',
    label: 'OneView case study',
    title: 'From fragmented data to trusted, reusable data products',
    shortTitle: 'OneView',
    category: 'case-study',
    template: 'Strategic Platform',
    sector: 'Telco',
    description:
      'A flagship platform case study about reusable data products and pragmatic delivery decisions.',
    order: 1,
  },
  {
    sourceFile: '05_HyperOptic_FSP_CaseStudy.html',
    slug: 'hyperoptic',
    routePath: '/case-studies/hyperoptic',
    assetPath: '/legacy-pages/hyperoptic.html',
    label: 'Hyperoptic case study',
    title: 'From fragmented systems to AI-ready data',
    shortTitle: 'Hyperoptic',
    category: 'case-study',
    template: 'Strategic Platform',
    sector: 'Telco',
    description:
      'A low-cost data hub foundation for customer operations AI and governed downstream products.',
    order: 2,
  },
  {
    sourceFile: '08_OhPolly_FSP_CaseStudy.html',
    slug: 'oh-polly',
    routePath: '/case-studies/oh-polly',
    assetPath: '/legacy-pages/oh-polly.html',
    label: 'Oh Polly case study',
    title: 'From data-aware to data-driven',
    shortTitle: 'Oh Polly',
    category: 'case-study',
    template: 'Strategic Platform',
    sector: 'Retail',
    description:
      'A retail data ecosystem across multiple brands, websites, and operational source systems.',
    order: 3,
  },
  {
    sourceFile: '06_AJW_FSP_CaseStudy.html',
    slug: 'ajw-stock-optimisation',
    routePath: '/case-studies/ajw-stock-optimisation',
    assetPath: '/legacy-pages/ajw-stock-optimisation.html',
    label: 'AJW case study',
    title: 'From gut-feel to data-driven inventory decisions',
    shortTitle: 'AJW',
    category: 'case-study',
    template: 'Analytics and Modelling',
    sector: 'Aviation',
    description:
      'Probabilistic forecasting and scenario simulation for complex inventory decisions.',
    order: 4,
  },
  {
    sourceFile: '09_Sovereign_FSP_CaseStudy.html',
    slug: 'sovereign-community-model',
    routePath: '/case-studies/sovereign-community-model',
    assetPath: '/legacy-pages/sovereign-community-model.html',
    label: 'Sovereign case study',
    title: 'A scoring model for communities',
    shortTitle: 'Sovereign',
    category: 'case-study',
    template: 'Analytics and Modelling',
    sector: 'Public sector',
    description:
      'An explainable composite scoring model to support community investment decisions.',
    order: 5,
  },
  {
    sourceFile: '07_CoOp_FSP_CaseStudy.html',
    slug: 'coop-managed-service',
    routePath: '/case-studies/coop-managed-service',
    assetPath: '/legacy-pages/coop-managed-service.html',
    label: 'Co-op case study',
    title: 'The data team behind 4,000 stores',
    shortTitle: 'Co-op',
    category: 'case-study',
    template: 'Managed Service',
    sector: 'Retail',
    description:
      'A dual-tier managed service model for continuous data operations and specialist capacity.',
    order: 6,
  },
  {
    sourceFile: '10_Campaign_Overview.html',
    slug: 'overview',
    routePath: '/campaign/overview',
    assetPath: '/legacy-pages/campaign-overview.html',
    label: 'Campaign overview',
    title: 'LinkedIn Campaign Overview',
    shortTitle: 'Campaign overview',
    category: 'campaign',
    description:
      'The week-by-week launch plan, posting roles, hooks, and campaign rationale.',
    order: 7,
  },
  {
    sourceFile: 'LinkedIn_Posts_Full_Campaign.md',
    slug: 'linkedin-posts',
    routePath: '/campaign/linkedin-posts',
    assetPath: '/legacy-pages/linkedin-posts.html',
    label: 'LinkedIn posts',
    title: 'LinkedIn Campaign Posts',
    shortTitle: 'LinkedIn posts',
    category: 'campaign',
    description:
      'The full copy bank for the 13-post LinkedIn campaign and posting mechanics.',
    order: 8,
  },
] satisfies LegacyPage[]

export const caseStudies = pages.filter((page) => page.category === 'case-study')
export const campaignPages = pages.filter((page) => page.category === 'campaign')

export function findPageBySlug(slug: string | undefined) {
  return pages.find((page) => page.slug === slug)
}

export function findPageBySourceFile(sourceFile: string) {
  return pages.find((page) => page.sourceFile === sourceFile)
}
