import './author.css'
import authorImg from './author.jpg'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from '../navigation/RouterContext'
import { PATHS } from '../navigation/paths'

function HeroSection() {
  const navigate = useNavigate()
  return (
    <section className="author-page">
      <div className="photo">
        <div className="photo-frame">
          <img src={authorImg} alt="Portrait of the author" />
          <span className="photo-bar"></span>
        </div>
        <p className="name">Olgah Majorine</p>
        <p className="role">
          Software Engineering Student &amp; Technology enthusiast, Kampala
        </p>
      </div>

      <div className="text">
        <p className="label red">AUTHORIAL FOCUS</p>

        <h1>
         Exploring the architecture of <em>technology</em>, one idea at a time.
       
        </h1>

        <p className="lead">
          Technology is more than the applications we use and the systems we build.
           It is the architecture of ideas, the logic behind innovation, and the continuous
          evolution of how we interact with the world.
        </p>

        <p className="small">
          this publication is built on curiosity, technical exploration, 
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
          <a href="https://wa.me/256740919165" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-whatsapp"></i> WhatsApp
          </a>
          <a href="https://www.linkedin.com/in/YOUR-PROFILE-NAME" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-linkedin"></i> Olgah Majorine
          </a>
          <a href="https://x.com/Olgaholikhorlah" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-x-twitter"></i> @Olgaholikhorlah
          </a>
        </div>

<button
  type="button"
  className="cta-btn"
  onClick={() => navigate(PATHS.BLOG_DETAILS)}
>
  Read my posts
  <ArrowRight size={16} />
</button>        
      </div>
    </section>
  )
}

export default HeroSection