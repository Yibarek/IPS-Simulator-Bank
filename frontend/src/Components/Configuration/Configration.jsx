import React from 'react'
  
function Configration() {


  return (
    <>
        {/* <!-- Portfolio Section --> */}
        <section id="portfolio" className="portfolio section">
          {/* <!-- Section Title --> */}
          <div className="container section-title" data-aos="fade-up">
            {/* <span className="subtitle">Portfolio</span> */}
            <h2>Configration</h2>
          </div>
          {/* <!-- End Section Title --> */}

          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div
              className="isotope-layout"
              data-default-filter="*"
              data-layout="masonry"
              data-sort="original-order"
            >
              <ul
                className="portfolio-filters isotope-filters"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <li data-filter="*" className="filter-active">
                  All Work
                </li>
                <li data-filter=".filter-web">Web Design</li>
                <li data-filter=".filter-mobile">Mobile App</li>
                {/* <li data-filter=".filter-financial">Financial</li>
                <li data-filter=".filter-educational">Educational</li> */}
              </ul>

              <div
                className="row gy-4 isotope-container"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <div className="col-lg-4 col-md-6 portfolio-item isotope-item filter-web filter-educational">
                  <div className="portfolio-card">
                    <div className="portfolio-image-container">
                      <img
                        src="./src/assets/img/portfolio/portfolio-1.webp"
                        alt="Creative Project"
                        className="img-fluid"
                        loading="lazy"
                      ></img>
                      <div className="portfolio-overlay">
                        <div className="portfolio-info">
                          <span className="project-category">Laravel</span>
                          <h4>Programming Contest Judge System</h4>
                        </div>
                        <div className="portfolio-actions">
                          <a
                            href="./src/assets/img/portfolio/portfolio-1.webp"
                            className="glightbox portfolio-link"
                          >
                            <i className="bi bi-plus-lg"></i>
                          </a>
                          <a href="#" className="portfolio-details">
                            <i className="bi bi-arrow-right"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="portfolio-meta">
                      <div className="project-tags">
                        <span className="tag">Programming Contest Judge System</span>
                      </div>
                      <div className="project-year">2022</div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6 portfolio-item isotope-item filter-digital">
                  <div className="portfolio-card">
                    <div className="portfolio-image-container">
                      <img
                        src="./src/assets/img/portfolio/portfolio-2.webp"
                        alt="Digital Project"
                        className="img-fluid"
                        loading="lazy"
                      ></img>
                      <div className="portfolio-overlay">
                        <div className="portfolio-info">
                          <span className="project-category">
                            Laravel
                          </span>
                          <h4>Cinema Rukiya Online Ticket Reservation</h4>
                        </div>
                        <div className="portfolio-actions">
                          <a
                            href="./src/assets/img/portfolio/portfolio-2.webp"
                            className="glightbox portfolio-link"
                          >
                            <i className="bi bi-plus-lg"></i>
                          </a>
                          <a href="#" className="portfolio-details">
                            <i className="bi bi-arrow-right"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="portfolio-meta">
                      <div className="project-tags">
                        <span className="tag">Cinema Rukiya Online Ticket Reservation</span>
                      </div>
                      <div className="project-year">2022</div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6 portfolio-item isotope-item filter-strategy">
                  <div className="portfolio-card">
                    <div className="portfolio-image-container">
                      <img
                        src="./src/assets/img/portfolio/portfolio-3.webp"
                        alt="Strategy Project"
                        className="img-fluid"
                        loading="lazy"
                      ></img>
                      <div className="portfolio-overlay">
                        <div className="portfolio-info">
                          <span className="project-category">Laravel</span>
                          <h4>DBU Fleet Management System</h4>
                        </div>
                        <div className="portfolio-actions">
                          <a
                            href="./src/assets/img/portfolio/portfolio-3.webp"
                            className="glightbox portfolio-link"
                          >
                            <i className="bi bi-plus-lg"></i>
                          </a>
                          <a href="#" className="portfolio-details">
                            <i className="bi bi-arrow-right"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="portfolio-meta">
                      <div className="project-tags">
                        <span className="tag">DBU Fleet Management System</span>
                      </div>
                      <div className="project-year">2022</div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6 portfolio-item isotope-item filter-development">
                  <div className="portfolio-card">
                    <div className="portfolio-image-container">
                      <img
                        src="./src/assets/img/portfolio/portfolio-4.webp"
                        alt="Development Project"
                        className="img-fluid"
                        loading="lazy"
                      ></img>
                      <div className="portfolio-overlay">
                        <div className="portfolio-info">
                          <span className="project-category">React + Express</span>
                          <h4>Simulator Bank portal</h4>
                        </div>
                        <div className="portfolio-actions">
                          <a
                            href="./src/assets/img/portfolio/portfolio-4.webp"
                            className="glightbox portfolio-link"
                          >
                            <i className="bi bi-plus-lg"></i>
                          </a>
                          <a href="#" className="portfolio-details">
                            <i className="bi bi-arrow-right"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="portfolio-meta">
                      <div className="project-tags">
                        <span className="tag">Simulator Bank portal</span>
                      </div>
                      <div className="project-year">2026</div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6 portfolio-item isotope-item filter-creative">
                  <div className="portfolio-card">
                    <div className="portfolio-image-container">
                      <img
                        src="./src/assets/img/portfolio/portfolio-5.webp"
                        alt="Creative Project"
                        className="img-fluid"
                        loading="lazy"
                      ></img>
                      <div className="portfolio-overlay">
                        <div className="portfolio-info">
                          <span className="project-category">ReactNative + Express</span>
                          <h4>Simulator Bank App</h4>
                        </div>
                        <div className="portfolio-actions">
                          <a
                            href="./src/assets/img/portfolio/portfolio-5.webp"
                            className="glightbox portfolio-link"
                          >
                            <i className="bi bi-plus-lg"></i>
                          </a>
                          <a href="#" className="portfolio-details">
                            <i className="bi bi-arrow-right"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="portfolio-meta">
                      <div className="project-tags">
                        <span className="tag">Simulator Bank App</span>
                      </div>
                      <div className="project-year">2026</div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6 portfolio-item isotope-item filter-digital">
                  <div className="portfolio-card">
                    <div className="portfolio-image-container">
                      <img
                        src="./src/assets/img/portfolio/portfolio-6.webp"
                        alt="Digital Project"
                        className="img-fluid"
                        loading="lazy"
                      ></img>
                      <div className="portfolio-overlay">
                        <div className="portfolio-info">
                          <span className="project-category">Andriod Studio</span>
                          <h4>Dama Mobile Game</h4>
                        </div>
                        <div className="portfolio-actions">
                          <a
                            href="./src/assets/img/portfolio/portfolio-6.webp"
                            className="glightbox portfolio-link"
                          >
                            <i className="bi bi-plus-lg"></i>
                          </a>
                          <a href="#" className="portfolio-details">
                            <i className="bi bi-arrow-right"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="portfolio-meta">
                      <div className="project-tags">
                        <span className="tag">Dama Mobile Game</span>
                      </div>
                      <div className="project-year">2020</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="portfolio-bottom"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <h3>Like what you see?</h3>
                  <p>
                    Donec rutrum congue leo eget malesuada. Vivamus suscipit
                    tortor eget felis porttitor volutpat.
                  </p>
                </div>
                <div className="col-lg-4 text-lg-end">
                  <a href="#contact" className="btn btn-accent">
                    Let's Work Together
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* <!-- /Portfolio Section --> */}
    </>
  )
}

export default Configration