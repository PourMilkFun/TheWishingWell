import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  getAdjacentDocs,
  getDoc,
  getDocNav,
  type DocBlock,
  type DocPage,
} from '../data/docs'

function Block({ block }: { block: DocBlock }) {
  switch (block.type) {
    case 'p':
      return <p className="docs-p">{block.text}</p>
    case 'h2':
      return <h2 className="docs-h2">{block.text}</h2>
    case 'h3':
      return <h3 className="docs-h3">{block.text}</h3>
    case 'ul':
      return (
        <ul className="docs-ul">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol className="docs-ol">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      )
    case 'callout':
      return (
        <aside className={`docs-callout docs-callout-${block.tone}`} role="note">
          {block.title ? <p className="docs-callout-title">{block.title}</p> : null}
          <p>{block.text}</p>
        </aside>
      )
    case 'code':
      return (
        <pre className="docs-code">
          <code>{block.text}</code>
        </pre>
      )
    default:
      return null
  }
}

function Sidebar({
  active,
  onNavigate,
}: {
  active: string
  onNavigate?: () => void
}) {
  const nav = useMemo(() => getDocNav(), [])

  return (
    <nav aria-label="Documentation">
      {nav.map((section) => (
        <div key={section.group} className="mb-6">
          <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-500">
            {section.group}
          </p>
          <ul className="space-y-0.5">
            {section.pages.map((page) => {
              const isActive = page.slug === active
              return (
                <li key={page.slug}>
                  <Link
                    to={`/docs/${page.slug}`}
                    onClick={onNavigate}
                    className={`block rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition ${
                      isActive
                        ? 'bg-rose-100 text-rose-700'
                        : 'text-ink-700 hover:bg-cream-100 hover:text-ink-900'
                    }`}
                  >
                    {page.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function DocArticle({ page }: { page: DocPage }) {
  const { prev, next } = getAdjacentDocs(page.slug)

  return (
    <article className="docs-article">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-400">
        {page.group}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
        {page.title}
      </h1>
      <p className="mt-3 text-base font-semibold text-ink-700 sm:text-lg">{page.description}</p>

      <div className="docs-body mt-8">
        {page.blocks.map((block, i) => (
          <Block key={`${page.slug}-${i}`} block={block} />
        ))}
      </div>

      <div className="mt-12 grid gap-3 border-t border-rose-100 pt-6 sm:grid-cols-2">
        {prev ? (
          <Link
            to={`/docs/${prev.slug}`}
            className="group rounded-2xl border border-rose-100 bg-milk/70 px-4 py-3 transition hover:border-rose-200 hover:bg-rose-50/60"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">Previous</p>
            <p className="mt-1 text-sm font-bold text-ink-800 group-hover:text-rose-600">
              ← {prev.title}
            </p>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            to={`/docs/${next.slug}`}
            className="group rounded-2xl border border-rose-100 bg-milk/70 px-4 py-3 text-right transition hover:border-rose-200 hover:bg-rose-50/60"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">Next</p>
            <p className="mt-1 text-sm font-bold text-ink-800 group-hover:text-rose-600">
              {next.title} →
            </p>
          </Link>
        ) : null}
      </div>
    </article>
  )
}

export function Docs() {
  const { slug } = useParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeSlug = slug || 'introduction'
  const page = getDoc(activeSlug)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeSlug])

  if (!slug || !page) {
    return <Navigate to="/docs/introduction" replace />
  }

  return (
    <div className="docs-shell">
      <div className="container-page">
        <div className="flex items-center justify-between border-b border-rose-100/80 py-3 lg:hidden">
          <button
            type="button"
            className="rounded-full border border-rose-200 bg-milk px-3.5 py-1.5 text-sm font-bold text-ink-700"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? 'Close menu' : 'Docs menu'}
          </button>
          <p className="truncate pl-3 text-sm font-semibold text-ink-700">{page.title}</p>
        </div>

        <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside
            className={`${
              mobileOpen ? 'block' : 'hidden'
            } border-b border-rose-100 py-4 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:border-b-0 lg:py-10`}
          >
            <p className="mb-4 hidden px-2 font-display text-lg font-semibold text-ink-900 lg:block">
              Docs
            </p>
            <Sidebar active={activeSlug} onNavigate={() => setMobileOpen(false)} />
          </aside>

          <div className="min-w-0 py-8 lg:py-10">
            <DocArticle page={page} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function DocsIndexRedirect() {
  return <Navigate to="/docs/introduction" replace />
}
