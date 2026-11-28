import { useCallback, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import DOMPurify from 'dompurify'
import { ArrowLeft, ArrowRight, Clock, Eye } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { useNavigate } from '../navigation/RouterContext'
import { PATHS } from '../navigation/paths'
import { getAccess, saveAccess } from '../lib/access'
import { labelOf } from '../lib/blog-options'
import { getSelectedSlug, isPreview, selectBlog } from '../lib/selected-blogs'
import Paywall from '../components/Paywall'
import PaywallDialog from '../components/PaywallDialog'
import './blog-details.css'

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

export function BlogDetailsPage() {
  const navigate = useNavigate()
  const [slug, setSlug] = useState(getSelectedSlug)
  const [preview, setPreview] = useState(isPreview)
  const [access, setAccess] = useState(getAccess)
  const [dialogOpen, setDialogOpen] = useState(true)

  // Readers get published blogs only; the admin preview gets any blog.
  const publicBlog = useQuery(api.blogs.getBySlug, slug && !preview ? { slug } : 'skip')
  const adminBlog = useQuery(api.blogs.getForAdmin, slug && preview ? { slug } : 'skip')
  const blog = preview ? adminBlog : publicBlog
  const published = useQuery(api.blogs.listPublished)

  const transactionId = blog ? access[blog.slug] : undefined
  const isFree = blog?.subscriptionMode === 'free'

  const paidContent = useQuery(
    api.blogs.getPaidContent,
    !preview && blog && blog.subscriptionMode === 'paid' && transactionId
      ? { blogId: blog._id, transactionId: transactionId as Id<'transactions'> }
      : 'skip',
  )

  const checkingAccess =
    !preview &&
    Boolean(transactionId) &&
    blog?.subscriptionMode === 'paid' &&
    paidContent === undefined
  const unlocked = Boolean(blog) && (preview || isFree || typeof paidContent === 'string')
  const fullHtml =
    preview || isFree ? (blog?.fullContentHtml ?? '') : (paidContent ?? '')

  const html = useMemo(
    () =>
      blog
        ? DOMPurify.sanitize(unlocked ? fullHtml : blog.previewContentHtml)
        : '',
    [blog, unlocked, fullHtml],
  )

  const related = (published ?? []).filter((item) => item.slug !== slug).slice(0, 2)

  const closeDialog = useCallback(() => setDialogOpen(false), [])
  const goBack = () => navigate(preview ? PATHS.ADMIN_BLOGS : PATHS.LANDING)
  const backLabel = preview ? 'Back to admin blogs' : 'Back to all blogs'

  const onUnlocked = (newTransactionId: string) => {
    if (blog) setAccess(saveAccess(blog.slug, newTransactionId))
  }

  const openBlog = (nextSlug: string) => {
    selectBlog(nextSlug)
    setSlug(nextSlug)
    setPreview(false)
    setDialogOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!slug || blog === null) {
    return (
      <article className="bd-page">
        <div className="bd-container">
          <p className="bd-state">
            {slug ? 'This blog could not be found.' : 'Choose a blog from the home page.'}
          </p>
          <button type="button" className="bd-back" onClick={goBack}>
            <ArrowLeft size={16} /> {backLabel}
          </button>
        </div>
      </article>
    )
  }

  if (blog === undefined) {
    return (
      <article className="bd-page">
        <div className="bd-container">
          <p className="bd-state">Loading blog...</p>
        </div>
      </article>
    )
  }

  return (
    <article className="bd-page">
      <div className="bd-container">
        <button type="button" className="bd-back" onClick={goBack}>
          <ArrowLeft size={16} /> {backLabel}
        </button>

        {preview && (
          <div className="bd-preview">
            <Eye size={14} /> Admin preview &middot; status: {blog.status}. Readers see
            this page only when the blog is published.
          </div>
        )}

        <div className="bd-topline">
          <div className="bd-tags">
            <span
              className={
                blog.subscriptionMode === 'paid' ? 'bd-tag exclusive' : 'bd-tag free'
              }
            >
              {blog.subscriptionMode === 'paid' ? 'Subscriber exclusive' : 'Free to read'}
            </span>
            <span className="bd-tag topic">{labelOf(blog.category)}</span>
          </div>
          <div className="bd-info">
            <span>
              <Clock size={13} /> {blog.readTime}
            </span>
            <span>{formatDate(blog.updatedAt)}</span>
          </div>
        </div>

        <h1 className="bd-title">{blog.title}</h1>
        <p className="bd-deck">{blog.subtitle}</p>

        {blog.coverImageUrl && (
          <figure className="bd-cover">
            <img src={blog.coverImageUrl} alt={blog.coverImageData.alt} />
            {blog.coverImageData.caption && (
              <figcaption>{blog.coverImageData.caption}</figcaption>
            )}
          </figure>
        )}

        <div className="bd-author-row">
        <img
        src="/author.jpg"
          alt="Portrait of the author"
          width={44}
            height={44}
             style={{
                width: 44,
                 height: 44,
               borderRadius: '50%',
                 objectFit: 'cover',
               objectPosition: 'center 20%',
               flexShrink: 0,
  }}
/>
          <div>
            <p className="bd-author">{blog.author?.name ?? 'The Tech Report'}</p>
            <p className="bd-meta">{blog.author?.role ?? 'Editor'} &middot; The Tech Report</p>
          </div>
        </div>

        <div className="bd-body">
          <div
            className={unlocked ? 'bd-html' : 'bd-html bd-teaser'}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        {!unlocked && !checkingAccess && !dialogOpen && (
          <div className="bd-inline-card">
            <Paywall
              blogId={blog._id}
              amount={blog.price.amount}
              onUnlocked={onUnlocked}
            />
          </div>
        )}

        {!preview && related.length > 0 && (
          <>
            <h2 className="bd-related-title">Keep reading</h2>
            <div className="bd-related">
              {related.map((item) => (
                <div
                  key={item._id}
                  className="bd-related-card"
                  onClick={() => openBlog(item.slug)}
                >
                  {item.coverImageUrl && (
                    <img src={item.coverImageUrl} alt={item.title} loading="lazy" />
                  )}
                  <div>
                    <p className="bd-mini-tag">{labelOf(item.category)}</p>
                    <h3>{item.title}</h3>
                    <span className="bd-more">
                      Read <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {!unlocked && !checkingAccess && dialogOpen && (
        <PaywallDialog
          blogId={blog._id}
          amount={blog.price.amount}
          onUnlocked={onUnlocked}
          onClose={closeDialog}
        />
      )}
    </article>
  )
}