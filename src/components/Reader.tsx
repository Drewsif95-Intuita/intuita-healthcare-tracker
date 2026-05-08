import { useEffect } from 'react'
import type { LegacyPage } from '../data/pages'

type ReaderProps = {
  page: LegacyPage
}

export function Reader({ page }: ReaderProps) {
  useEffect(() => {
    document.title = `${page.shortTitle} | FSP Case Study Hub`
  }, [page.shortTitle])

  return (
    <main className="reader">
      <section className="embedded">
        <div className="embedded-frame">
          <iframe
            className="reader-frame"
            src={page.assetPath}
            title={page.title}
          />
        </div>
      </section>
    </main>
  )
}
