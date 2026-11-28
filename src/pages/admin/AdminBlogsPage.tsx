import { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { ChevronLeft, ChevronRight, Lock, Plus, Search, Unlock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '../../../convex/_generated/api'
import { useNavigate } from '../../navigation/RouterContext'
import { PATHS } from '../../navigation/paths'
import { CATEGORIES, labelOf } from '../../lib/blog-options'
import { selectBlog } from '../../lib/selected-blogs'

const PAGE_SIZE = 8

type StatusFilter = 'all' | 'published' | 'draft' | 'archived'
type AccessFilter = 'all' | 'free' | 'paid'

const STATUS_STYLES: Record<string, { label: string; badge: string; dot: string }> = {
  published: { label: 'Published', badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  draft: { label: 'Draft', badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  archived: { label: 'Archived', badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.draft
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  )
}

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const selectClass =
  'h-9 rounded-md border border-border bg-background px-3 text-xs text-foreground'

export function AdminBlogsPage() {
  const navigate = useNavigate()
  const blogs = useQuery(api.blogs.list)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [access, setAccess] = useState<AccessFilter>('all')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (blogs ?? []).filter(
      (blog) =>
        (!term ||
          blog.title.toLowerCase().includes(term) ||
          blog.subtitle.toLowerCase().includes(term)) &&
        (category === 'all' || blog.category === category) &&
        (status === 'all' || blog.status === status) &&
        (access === 'all' || blog.subscriptionMode === access),
    )
  }, [blogs, search, category, status, access])

  const countOf = (value: string) =>
    (blogs ?? []).filter((blog) => blog.status === value).length

  const stats = [
    { label: 'Total blogs', value: (blogs ?? []).length },
    { label: 'Published', value: countOf('published') },
    { label: 'Drafts', value: countOf('draft') },
    { label: 'Archived', value: countOf('archived') },
  ]

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const start = currentPage * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)
  const filtersActive =
    search !== '' || category !== 'all' || status !== 'all' || access !== 'all'

  const resetFilters = () => {
    setSearch('')
    setCategory('all')
    setStatus('all')
    setAccess('all')
    setPage(0)
  }

  const openBlog = (slug: string) => {
    selectBlog(slug, true)
    navigate(PATHS.BLOG_DETAILS)
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground">
          Articles &amp; Essays
        </h1>
        <Button
          type="button"
          className="self-start px-4 py-2 text-xs font-medium shadow-2xs sm:self-auto"
          onClick={() => navigate(PATHS.ADMIN_BLOGS_NEW)}
        >
          <Plus aria-hidden="true" className="size-3.5" />
          <span>Create New Blog</span>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 font-serif text-3xl text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
            placeholder="Search blogs by title..."
            className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-xs"
          />
        </div>

        <select
          className={selectClass}
          value={category}
          onChange={(event) => {
            setCategory(event.target.value)
            setPage(0)
          }}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {labelOf(item)}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as StatusFilter)
            setPage(0)
          }}
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <select
          className={selectClass}
          value={access}
          onChange={(event) => {
            setAccess(event.target.value as AccessFilter)
            setPage(0)
          }}
        >
          <option value="all">All access</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>

        {filtersActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="h-9 rounded-md px-3 text-xs text-muted-foreground hover:bg-muted"
          >
            Reset
          </button>
        )}
      </div>

      {blogs === undefined && (
        <p className="py-16 text-sm text-muted-foreground">Loading blogs...</p>
      )}

      {blogs !== undefined && filtered.length === 0 && (
        <p className="py-16 text-sm text-muted-foreground">
          {blogs.length === 0
            ? 'No blogs yet. Click "Create New Blog" to write your first one.'
            : 'No blogs match your filters.'}
        </p>
      )}

      {filtered.length > 0 && (
        <>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Blog</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Access</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {visible.map((blog) => (
                  <tr
                    key={blog._id}
                    tabIndex={0}
                    onClick={() => openBlog(blog.slug)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') openBlog(blog.slug)
                    }}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/40 focus-visible:bg-muted/60 focus-visible:outline-none"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {blog.coverImageUrl ? (
                          <img
                            src={blog.coverImageUrl}
                            alt={blog.title}
                            className="h-10 w-16 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-16 shrink-0 rounded-md bg-muted" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {blog.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {blog.readTime} · {blog.wordCount} words
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {labelOf(blog.category)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={blog.status} />
                    </td>
                    <td className="px-4 py-3">
                      {blog.subscriptionMode === 'paid' ? (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Lock className="size-3.5" />
                          {blog.price.currency} {blog.price.amount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Unlock className="size-3.5" />
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(blog.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <ChevronRight className="size-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {start + 1}-{Math.min(start + PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
                className="inline-flex size-8 items-center justify-center rounded-md border border-border disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span>
                {currentPage + 1} / {pageCount}
              </span>
              <button
                type="button"
                disabled={currentPage >= pageCount - 1}
                onClick={() => setPage(currentPage + 1)}
                className="inline-flex size-8 items-center justify-center rounded-md border border-border disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}