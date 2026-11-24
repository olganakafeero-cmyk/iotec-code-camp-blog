import { useState } from 'react'
import { useQuery } from 'convex/react'
import { Archive, ArrowLeft, ArrowRight } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { useNavigate } from '../navigation/RouterContext'
import { PATHS } from '../navigation/paths'
import { CATEGORIES, labelOf } from '../lib/blog-options'
import { selectBlog } from '../lib/selected-blogs'
import './archive.css'

const FILTERS = ['all', ...CATEGORIES] as const
type Filter = (typeof FILTERS)[number]

const PAGE_SIZE = 3

const pad = (n: number) => String(n).padStart(2, '0')

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

export default function RecentArchive() {
  const navigate = useNavigate()
  const blogs = useQuery(api.blogs.listPublished)
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage] = useState(0)

  const all = blogs ?? []
  const filtered =
    filter === 'all' ? all : all.filter((blog) => blog.category === filter)

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const visible = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  )

  const changeFilter = (next: Filter) => {
    setFilter(next)
    setPage(0)
  }

  return (
    <section className="archive-band">
      <div className="archive-inner">
        <p className="archive-label">
          <Archive size={14} /> THE TECH REPORT ARCHIVE
        </p>

        <div className="archive-header">
          <h2 className="archive-title">Recent Blogs</h2>

          <div className="archive-controls">
            <div className="archive-filters">
              {FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    item === filter
                      ? 'archive-filter active'
                      : 'archive-filter'
                  }
                  onClick={() => changeFilter(item)}
                >
                  {labelOf(item)}
                </button>
              ))}
            </div>

            <div className="archive-pager">
              <span className="archive-count">
                {pad(currentPage + 1)} / {pad(pageCount)}
              </span>
              <button
                type="button"
                aria-label="Previous page"
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next page"
                disabled={currentPage >= pageCount - 1}
                onClick={() => setPage(currentPage + 1)}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {blogs === undefined && <p className="archive-empty">Loading blogs...</p>}

        {blogs !== undefined && visible.length === 0 && (
          <p className="archive-empty">
            {all.length === 0
              ? 'No published blogs yet. Check back soon.'
              : 'No blogs in this category yet.'}
          </p>
        )}

        <div className="archive-grid">
          {visible.map((blog) => (
            <article
              key={blog._id}
              className="archive-card"
              onClick={() => {
                selectBlog(blog.slug)
                navigate(PATHS.BLOG_DETAILS)
              }}
            >
              <div className="archive-image">
                {blog.coverImageUrl && (
                  <img src={blog.coverImageUrl} alt={blog.title} loading="lazy" />
                )}
              </div>

              <div className="archive-body">
                <div className="archive-tags">
                  <span className="archive-tag">{labelOf(blog.category)}</span>
                  <span
                    className={
                      blog.subscriptionMode === 'paid'
                        ? 'archive-badge paid'
                        : 'archive-badge free'
                    }
                  >
                    {blog.subscriptionMode === 'paid' ? 'Paid' : 'Free'}
                  </span>
                </div>

                <p className="archive-meta">
                  {formatDate(blog.updatedAt)} &middot; {blog.readTime}
                </p>

                <h3>{blog.title}</h3>
                <p className="archive-excerpt">{blog.excerpt}</p>

                <span className="archive-link">
                  Read <ArrowRight size={14} />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}