import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigate } from '../navigation/RouterContext'
import { PATHS } from '../navigation/paths'
import { posts, getSelectedPost, selectPost } from '../lib/posts'
import './blog-details.css'

export function BlogDetailsPage() {
  const navigate = useNavigate()
  const [post, setPost] = useState(getSelectedPost)

  const related = posts.filter((p) => p.id !== post.id).slice(0, 2)

  const openPost = (id: number) => {
    selectPost(id)
    setPost(getSelectedPost())
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

        <div className="bd-tags">
          <span className="bd-tag">{post.category}</span>
          <span
            className={post.access === 'Paid' ? 'bd-badge paid' : 'bd-badge free'}
          >
            {post.access}
          </span>
        </div>

        <h1 className="bd-title">{post.title}</h1>

        <div className="bd-byline">
        <img src="/author.jpg" alt="Portrait of Olgah Majorine" />
          <div>
            <p className="bd-author">Olgah Majorine</p>
            <p className="bd-meta">
              {post.date} &middot; {post.readTime}
            </p>
          </div>
        </div>

        <div className="bd-cover">
          <img src={post.image} alt={post.title} />
        </div>

        <div className="bd-body">
          <p className="bd-lead">{post.excerpt}</p>
          {post.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="bd-authorcard">
          <img src="/author.jpg" alt="Portrait of Olgah Majorine" />
          <div>
            <p className="bd-author">Written by Olgah Majorine</p>
            <p className="bd-meta">
              Software Engineer &amp; Technology Enthusiast. Founder of The Tech
              Report.
            </p>
          </div>
        </div>

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
                <p className="bd-tag">{item.category}</p>
                <h3>{item.title}</h3>
                <span className="bd-more">
                  Read <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}