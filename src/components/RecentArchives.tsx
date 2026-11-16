import { useState } from 'react'
import { Archive, ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigate } from '../navigation/RouterContext'
import { PATHS } from '../navigation/paths'
import { posts, selectPost } from '../lib/posts'
import './archive.css'

const FILTERS = ['All', 'Architecture', 'Technology'] as const
type Filter = (typeof FILTERS)[number]

const PAGE_SIZE = 3

const pad = (n: number) => String(n).padStart(2, '0')

export default function RecentArchive() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('All')
  const [page, setPage] = useState(0)

  const filtered =
    filter === 'All' ? posts : posts.filter((post) => post.category === filter)

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

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
                  {item}
                </button>
              ))}
            </div>

            <div className="archive-pager">
              <span className="archive-count">
                {pad(page + 1)} / {pad(pageCount)}
              </span>
              <button
                type="button"
                aria-label="Previous page"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next page"
                disabled={page >= pageCount - 1}
                onClick={() => setPage(page + 1)}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="archive-grid">
          {visible.map((post) => (
            <article
              key={post.id}
              className="archive-card"
              onClick={() => {
                selectPost(post.id)
                navigate(PATHS.BLOG_DETAILS)
              }}
            >
              <div className="archive-image">
                <img src={post.image} alt={post.title} loading="lazy" />
              </div>

              <div className="archive-body">
                <div className="archive-tags">
                  <span className="archive-tag">{post.category}</span>
                  <span
                    className={
                      post.access === 'Paid'
                        ? 'archive-badge paid'
                        : 'archive-badge free'
                    }
                  >
                    {post.access}
                  </span>
                </div>

                <p className="archive-meta">
                  {post.date} &middot; {post.readTime}
                </p>

                <h3>{post.title}</h3>
                <p className="archive-excerpt">{post.excerpt}</p>

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