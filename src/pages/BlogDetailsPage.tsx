import { useCallback, useState } from 'react'
import { ArrowLeft, ArrowRight, Clock, Lock } from 'lucide-react'
import { useNavigate } from '../navigation/RouterContext'
import { PATHS } from '../navigation/paths'
import { posts, getSelectedPost, selectPost } from '../lib/posts'
import { getUnlocked } from '../lib/access'
import PaywallDialog from '../components/PaywallDialog'
import './blog-details.css'

export function BlogDetailsPage() {
  const navigate = useNavigate()
  const [post, setPost] = useState(getSelectedPost)
  const [unlockedIds, setUnlockedIds] = useState(getUnlocked)
  const [dialogOpen, setDialogOpen] = useState(true)

  const unlocked = post.access === 'Free' || unlockedIds.includes(post.id)
  const intro = post.body.slice(0, 2)
  const rest = post.body.slice(2)
  const related = posts.filter((p) => p.id !== post.id).slice(0, 2)

  const closeDialog = useCallback(() => setDialogOpen(false), [])

  const openPost = (id: number) => {
    selectPost(id)
    setPost(getSelectedPost())
    setDialogOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <article className="bd-page">
      <div className="bd-container">
        <button
          type="button"
          className="bd-back"
          onClick={() => navigate(PATHS.LANDING)}
        >
          <ArrowLeft size={16} /> Back to all blogs
        </button>

        <div className="bd-topline">
          <div className="bd-tags">
            <span
              className={post.access === 'Paid' ? 'bd-tag exclusive' : 'bd-tag free'}
            >
              {post.access === 'Paid' ? 'Subscriber exclusive' : 'Free to read'}
            </span>
            <span className="bd-tag topic">{post.topic}</span>
          </div>
          <div className="bd-info">
            <span>
              <Clock size={13} /> {post.readTime}
            </span>
            <span>{post.date}</span>
          </div>
        </div>

        <h1 className="bd-title">{post.title}</h1>
        <p className="bd-deck">{post.excerpt}</p>

        <figure className="bd-cover">
          <img src={post.image} alt={post.title} />
          <figcaption>{post.caption}</figcaption>
        </figure>

        <div className="bd-author-row">
          <img
            src="/author.jpg"
             alt="Portrait of Olgah Majorine"
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
            <p className="bd-author">Olgah Majorine</p>
            <p className="bd-meta">Software Engineer &middot; The Tech Report</p>
          </div>
        </div>

        <div className="bd-body">
          {intro.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}

          <blockquote className="bd-quote">
            <p>&ldquo;{post.quote.text}&rdquo;</p>
            <cite>&mdash; {post.quote.source}</cite>
          </blockquote>

          {unlocked ? (
            rest.map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p className="bd-fade">{rest[0]}</p>
          )}
        </div>

        {!unlocked && !dialogOpen && (
          <div className="bd-lockbar">
            <Lock size={16} />
            <p>This essay is for supporters. Unlock it to keep reading.</p>
            <button type="button" onClick={() => setDialogOpen(true)}>
              Unlock full essay
            </button>
          </div>
        )}

        <h2 className="bd-related-title">Keep reading</h2>
        <div className="bd-related">
          {related.map((item) => (
            <div
              key={item.id}
              className="bd-related-card"
              onClick={() => openPost(item.id)}
            >
              <img src={item.image} alt={item.title} loading="lazy" />
              <div>
                <p className="bd-mini-tag">{item.topic}</p>
                <h3>{item.title}</h3>
                <span className="bd-more">
                  Read <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!unlocked && dialogOpen && (
        <PaywallDialog
          postId={post.id}
          onUnlocked={() => setUnlockedIds(getUnlocked())}
          onClose={closeDialog}
        />
      )}
    </article>
  )
}