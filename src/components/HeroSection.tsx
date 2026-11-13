import { ArrowRight } from 'lucide-react'
import { useNavigate } from '../navigation/RouterContext'
import { PATHS } from '../navigation/paths'
import './author.css'
import authorImg from './author.jpg'

const recentPosts = [
  {
    id: 1,
    category: 'Project Notes',
    title: 'Building QueueLess: an appointment booking app from scratch',
    excerpt:
      'Why I chose React, Vite and Convex, and how bookings confirm instantly without double booking.',
    date: 'Nov 2026',
  },
  {
    id: 2,
    category: 'Learning',
    title: 'From classroom code to a live website in one weekend',
    excerpt:
      'What changed when I pushed my first project to GitHub and deployed it on Vercel.',
    date: 'Nov 2026',
  },
  {
    id: 3,
    category: 'Debugging',
    title: 'The one missing semicolon that broke my whole stylesheet',
    excerpt:
      'A beginner-friendly look at typos, error messages and how to read them calmly.',
    date: 'Nov 2026',
  },
  {
    id: 4,
    category: 'Community',
    title: 'What I am learning in the She Builds With ioTec code camp',
    excerpt:
      'Four Saturdays, one production-grade app, and the habits that make learning stick.',
    date: 'Nov 2026',
  },
  {
    id: 5,
    category: 'Databases',
    title: 'SQL tables vs Convex documents: what I noticed switching',
    excerpt:
      'How the way I learned MySQL in class helped me understand a modern backend.',
    date: 'Oct 2026',
  },
  {
    id: 6,
    category: 'Ideas',
    title: 'Tech ideas for Uganda I want to build next',
    excerpt:
      'From a footballers directory to smart farming tools: the problems worth solving.',
    date: 'Oct 2026',
  },
]

function HeroSection() {
  const navigate = useNavigate()

  return (
    <div className="author-wrap">
      <section className="author-page">
        <div className="photo">
          <div className="photo-frame">
            <img src={authorImg} alt="Portrait of the author" />
             <span className="photo-bar"></span>
     </div>
          
          <p className="name">Olgah Majorine</p>
                <p className="role">software Engineer &amp Technology Enthusiast. Founder of the Tech Report</p>
            </div>

            <div className="text">
                <p className="label">Authorial Focus</p>

                <h1>
                   Exploring the architecture of <em>technology</em>, one idea at a time.
                </h1>
                <p className="lead">
                    Technology is more than the applications we use and the systems we build.
                    It is the architecture of ideas, the logic behind innovation, and the continuous
                    evolution of how we interact with the world.
                 </p>
                <p className="small">
                    This publication is built on curiosity, technical exploration, 
                    and the belief that understanding technology is just as important as creating it.
                    No superficial trends. Just technology, examined with depth, clarity, and intention.
          </p>

          <p className="label">DIRECT INQUIRIES &amp; CORROBORATION</p>

          <div className="chips">
            <a href="mailto:olganakafeero@gmail.com">
              <i className="fa-regular fa-envelope"></i> olganakafeero@gmail.com
            </a>
            <a href="tel:+256777297498">
              <i className="fa-solid fa-phone"></i> 0777 297 498
            </a>
            <a
              href="https://wa.me/256740919165"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-whatsapp"></i> WhatsApp
            </a>
            <a
              href="https://www.linkedin.com/in/YOUR-PROFILE-NAME"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-linkedin"></i> Olgah Majorine
            </a>
            <a
              href="https://x.com/Olgaholikhorlah"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-x-twitter"></i> @Olgaholikhorlah
            </a>
          </div>
        </div>
      </section>

      <section className="recent">
        <div className="recent-header">
          <div>
            <p className="label red">RECENT WRITING</p>
            <h2>Recent blogs</h2>
          </div>
          <button
            type="button"
            className="cta-btn"
            onClick={() => navigate(PATHS.BLOG_DETAILS)}
          >
            View all posts
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="post-grid">
          {recentPosts.map((post) => (
            <article
              key={post.id}
              className="post-card"
              onClick={() => navigate(PATHS.BLOG_DETAILS)}
            >
              <p className="post-meta">
                {post.category} &middot; {post.date}
              </p>
              <h3>{post.title}</h3>
              <p className="post-excerpt">{post.excerpt}</p>
              <span className="post-link">
                Read more <ArrowRight size={14} />
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HeroSection