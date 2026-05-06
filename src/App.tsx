import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  FileText,
  Home,
  Layers3,
  LockKeyhole,
  Printer,
} from 'lucide-react'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  campaignPages,
  caseStudies,
  findPageBySlug,
  findPageBySourceFile,
  pages,
  type LegacyPage,
} from './data/pages'

declare global {
  interface Window {
    FSPShareableApp?: {
      loadPage: (sourceFile: string) => void
      currentPage: () => string
    }
  }
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

function AppRoutes() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPage = useMemo(() => {
    return pages.find((page) => page.routePath === location.pathname)
  }, [location.pathname])

  useEffect(() => {
    window.FSPShareableApp = {
      loadPage: (sourceFile: string) => {
        const page = findPageBySourceFile(sourceFile)
        navigate(page?.routePath ?? '/')
      },
      currentPage: () => currentPage?.sourceFile ?? 'home',
    }

    return () => {
      delete window.FSPShareableApp
    }
  }, [currentPage, navigate])

  return (
    <div className="app-shell">
      <Header currentPage={currentPage} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bundle" element={<PageRoute />} />
        <Route path="/case-studies/:slug" element={<PageRoute />} />
        <Route path="/campaign/:slug" element={<PageRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function Header({ currentPage }: { currentPage?: LegacyPage }) {
  const navigate = useNavigate()

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="FSP case studies home">
        <span className="brand__mark" aria-hidden="true">
          FSP
        </span>
        <span>
          <strong>Data and AI</strong>
          <small>Case study programme</small>
        </span>
      </Link>

      <nav className="primary-nav" aria-label="Primary navigation">
        <NavLink to="/" end>
          <Home size={17} aria-hidden="true" />
          Home
        </NavLink>
        <NavLink to="/bundle">
          <BookOpen size={17} aria-hidden="true" />
          Bundle
        </NavLink>
        <NavLink to="/campaign/overview">
          <CalendarDays size={17} aria-hidden="true" />
          Campaign
        </NavLink>
      </nav>

      <label className="page-picker">
        <span>Open page</span>
        <select
          value={currentPage?.routePath ?? ''}
          onChange={(event) => navigate(event.target.value || '/')}
        >
          <option value="">Programme home</option>
          {pages.map((page) => (
            <option key={page.sourceFile} value={page.routePath}>
              {page.label}
            </option>
          ))}
        </select>
      </label>
    </header>
  )
}

function HomePage() {
  useEffect(() => {
    document.title = 'FSP Data and AI Case Studies'
  }, [])

  return (
    <main>
      <section className="hero-section">
        <div className="hero-section__copy">
          <p className="eyebrow">Internal review library</p>
          <h1>FSP Data and AI case studies, ready to share and extend.</h1>
          <p>
            A React-hosted case study programme with the current review pages,
            campaign assets, and a structure that can grow into richer filters,
            search, approvals, or CMS-backed content later.
          </p>
          <div className="hero-actions">
            <Link className="button button--primary" to="/bundle">
              <BookOpen size={18} aria-hidden="true" />
              Open bundle
            </Link>
            <Link className="button" to="/campaign/overview">
              <CalendarDays size={18} aria-hidden="true" />
              Campaign plan
            </Link>
          </div>
        </div>
        <div className="signal-panel" aria-label="Programme summary">
          <div>
            <span>6</span>
            <small>case studies</small>
          </div>
          <div>
            <span>3</span>
            <small>templates</small>
          </div>
          <div>
            <span>13</span>
            <small>campaign posts</small>
          </div>
        </div>
      </section>

      <section className="content-section">
        <SectionHeader
          icon={<Layers3 size={20} aria-hidden="true" />}
          title="Case studies"
          deck="The first set of pages is preserved from the current bundle and now sits behind stable routes."
        />
        <div className="card-grid">
          {caseStudies.map((page) => (
            <PageCard key={page.sourceFile} page={page} />
          ))}
        </div>
      </section>

      <section className="content-section content-section--warm">
        <SectionHeader
          icon={<FileText size={20} aria-hidden="true" />}
          title="Campaign assets"
          deck="The supporting overview and post bank live alongside the case studies so the launch material stays together."
        />
        <div className="card-grid card-grid--compact">
          {campaignPages.map((page) => (
            <PageCard key={page.sourceFile} page={page} />
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="ops-strip">
          <LockKeyhole size={22} aria-hidden="true" />
          <div>
            <h2>Deploy privately on Azure Static Web Apps</h2>
            <p>
              The repo includes an Azure Static Web Apps workflow and route
              config so the hosted site can require authentication once the
              Azure resource and deployment secret are in place.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

function SectionHeader({
  icon,
  title,
  deck,
}: {
  icon: ReactNode
  title: string
  deck: string
}) {
  return (
    <header className="section-header">
      <div className="section-header__icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{deck}</p>
      </div>
    </header>
  )
}

function PageCard({ page }: { page: LegacyPage }) {
  return (
    <article className="page-card">
      <div className="page-card__meta">
        <span>{page.template ?? page.category}</span>
        {page.sector ? <span>{page.sector}</span> : null}
      </div>
      <h3>{page.shortTitle}</h3>
      <p>{page.description}</p>
      <Link to={page.routePath} aria-label={`Open ${page.label}`}>
        Open page
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </article>
  )
}

function PageRoute() {
  const { slug } = useParams()
  const location = useLocation()
  const page =
    location.pathname === '/bundle'
      ? findPageBySlug('bundle')
      : findPageBySlug(slug)

  if (!page) {
    return <Navigate to="/" replace />
  }

  return <PageViewer page={page} />
}

function PageViewer({ page }: { page: LegacyPage }) {
  const frameRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    document.title = `${page.shortTitle} | FSP Data and AI Case Studies`
  }, [page.shortTitle])

  function printPage() {
    frameRef.current?.contentWindow?.focus()
    frameRef.current?.contentWindow?.print()
  }

  return (
    <main className="viewer-page">
      <section className="viewer-toolbar" aria-label="Page tools">
        <div>
          <p className="eyebrow">{page.category}</p>
          <h1>{page.title}</h1>
        </div>
        <div className="viewer-toolbar__actions">
          <a
            className="icon-button"
            href={page.assetPath}
            rel="noreferrer"
            target="_blank"
          >
            <ArrowUpRight size={17} aria-hidden="true" />
            <span>Open raw page</span>
          </a>
          <button className="icon-button" type="button" onClick={printPage}>
            <Printer size={17} aria-hidden="true" />
            <span>Print</span>
          </button>
        </div>
      </section>
      <section className="viewer-frame-wrap">
        <iframe
          ref={frameRef}
          className="viewer-frame"
          src={page.assetPath}
          title={page.title}
        />
      </section>
    </main>
  )
}

export default App
