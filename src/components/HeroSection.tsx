import './author.css'
import RecentArchive from './RecentArchives'

function HeroSection() {
  return (
    <>
      <div className="author-wrap">
        <section className="author-page">
          <div className="photo">
            <div className="photo-frame">
              <img src="/author.jpg" alt="Portrait of Olgah Majorine" />
              <span className="photo-bar"></span>
            </div>
            <p className="name">Olgah Majorine</p>
            <p className="role">
              Software Engineer &amp; Technology Enthusiast. Founder of The Tech
              Report
            </p>
          </div>

          <div className="text">
            <p className="label red">AUTHORIAL FOCUS</p>

            <h1>
              Exploring the architecture of <em>technology</em>, one idea at a
              time.
            </h1>

            <p className="lead">
              Technology is more than the applications we use and the systems we
              build. It is the architecture of ideas, the logic behind
              innovation, and the continuous evolution of how we interact with
              the world.
            </p>

            <p className="small">
              This publication is built on curiosity, technical exploration, and
              the belief that understanding technology is just as important as
              creating it. No superficial trends. Just technology, examined with
              depth, clarity, and intention.
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
      </div>

      <RecentArchive />
    </>
  )
}

export default HeroSection