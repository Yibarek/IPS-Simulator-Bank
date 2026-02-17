import React from 'react'
import { useNavigate } from "react-router-dom";
  

function Resume () {

  return (
    <>
        {/* <!-- Resume Section --> */}
        <section id="resume" class="resume section">
          {/* <!-- Section Title --> */}
          <div class="container section-title" data-aos="fade-up">
            {/* <span class="subtitle">Resume</span> */}
            <h2>Tasks</h2>
          </div>
          {/* <!-- End Section Title --> */}

          <div class="container" data-aos="fade-up" data-aos-delay="100">
            <div class="row gy-5">
              <div class="col-lg-6">
                <div class="experience-section">
                  <div
                    class="section-header"
                    data-aos="fade-right"
                    data-aos-delay="200"
                  >
                    <div class="header-content">
                      <span class="section-badge">Experience</span>
                      <h2>Professional Journey</h2>
                      <p>
                        I build meaningful digital experiences by combining creativity with strategy and 
                        technical expertise. Every project I take on deepens my skills and drives real results.
                      </p>
                    </div>
                  </div>

                  <div class="experience-cards">
                    <div
                      class="exp-card featured"
                      data-aos="zoom-in"
                      data-aos-delay="300"
                    >
                      <div class="card-header">
                        <div class="company-logo">
                          <i class="bi bi-buildings"></i>
                        </div>
                        <div class="period-badge">Current</div>
                      </div>
                      <div class="card-body">
                        <h3>Digital Payment Officer II</h3>
                        <p class="company-name">Ethswitch S.C</p>
                        <span class="duration">2025 - Present</span>
                        <p class="description">
                          Led RTP and P2P integration of the EthSwitch IPS with banking systems, and supported bank 
                          and microfinance software developers in integrating their systems with the IPS.
                        </p>
                        <div class="skills-tags">
                          <span class="skill-tag">Integration</span>
                          <span class="skill-tag">Finance</span>
                          <span class="skill-tag">Software development</span>
                        </div>
                      </div>
                    </div>

                    <div
                      class="exp-card"
                      data-aos="zoom-in"
                      data-aos-delay="350"
                    >
                      <div class="card-header">
                        <div class="company-logo">
                          <i class="bi bi-laptop"></i>
                        </div>
                      </div>
                      <div class="card-body">
                        <h3>Software Engineer</h3>
                        <p class="company-name">Huawei Technologies Co,.Ltd</p>
                        <span class="duration">2023 - 2025</span>
                        <p class="description">
                          I played a leading role in several operations involved CBE MM system, including software upgrades,
                          database and application switchover, third party integration, storage and server security patch upgrades,
                          and provides support for any incidents by coordinating with Huawei Engineers and CBE team.
                        </p>
                      </div>
                    </div>

                    <div
                      class="exp-card"
                      data-aos="zoom-in"
                      data-aos-delay="400"
                    >
                      <div class="card-header">
                        <div class="company-logo">
                          <i class="bi bi-palette"></i>
                        </div>
                      </div>
                      <div class="card-body">
                        <h3>Web Developer</h3>
                        <p class="company-name">Debre Birhan University</p>
                        <span class="duration">2022 - 2023</span>
                        <p class="description">
                          I have developed multiple web applications, including a Programming Contest Management System, 
                          a Fleet Management System for Debre Birhan University, and Online Cinema Ticket Reservation System 
                          for Cinema Rukiya, and a Fleet Management System for Kombolcha University.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-6">
                <div class="education-section">
                  <div
                    class="section-header"
                    data-aos="fade-left"
                    data-aos-delay="200"
                  >
                    <div class="header-content">
                      <span class="section-badge">Education</span>
                      <h2>Academic Background</h2>
                      <p>
                        I have a strong academic foundation focused on building analytical thinking, 
                        problem-solving skills, and technical knowledge.
                      </p>
                    </div>
                  </div>

                  <div
                    class="education-timeline"
                    data-aos="fade-left"
                    data-aos-delay="300"
                  >
                    <div class="timeline-track">
                      <div class="timeline-item">
                        <div class="timeline-marker">
                          <i class="bi bi-mortarboard-fill"></i>
                        </div>
                        <div class="timeline-content">
                          <div class="education-meta">
                            <span class="year-range">2018 - 2022</span>
                            <span class="degree-level">Bachelor</span>
                          </div>
                          <h4>Bachelor of Computer Science</h4>
                          <p class="institution">Debre Birhan University</p>
                          <p class="description">
                            I have completed a degree from Debre Birhan University in 
                            Computer Science with CGPA 3.95 in sep-3-2022.
                          </p>
                          <div class="achievement">
                            <i class="bi bi-award"></i>
                            <span>Graduated with honers</span>
                          </div>
                        </div>
                      </div>

                      {/* <div class="timeline-item">
                        <div class="timeline-marker">
                          <i class="bi bi-book"></i>
                        </div>
                        <div class="timeline-content">
                          <div class="education-meta">
                            <span class="year-range">2011 - 2015</span>
                            <span class="degree-level">Bachelor</span>
                          </div>
                          <h4>Bachelor of Fine Arts</h4>
                          <p class="institution">Creative Arts University</p>
                          <p class="description">
                            Duis aute irure dolor in reprehenderit in voluptate
                            velit esse cillum dolore eu fugiat nulla pariatur.
                          </p>
                        </div>
                      </div> */}

                      <div class="timeline-item">
                        <div class="timeline-marker">
                          <i class="bi bi-patch-check-fill"></i>
                        </div>
                        <div class="timeline-content">
                          <div class="education-meta">
                            <span class="year-range">2021 - 2024</span>
                            <span class="degree-level">Certificates</span>
                          </div>
                          <h4>Professional Certifications</h4>
                          <div class="certifications-list">
                            <div class="cert-item">
                              <span class="cert-name">
                                ICPC Ethiopian Collegiate Programing Contest 
                              </span>
                              <span class="cert-year">2021</span>
                            </div>
                            <div class="cert-item">
                              <span class="cert-name">HCIA-Storage</span>
                              <span class="cert-year">2024</span>
                            </div>
                            <div class="cert-item">
                              <span class="cert-name">North African Region Enterprise Service Partner Bootcamp 2024</span>
                              <span class="cert-year">2024</span>
                            </div>
                            <div class="cert-item">
                              <span class="cert-name">
                                Huawei Certificate of H1 Star 
                              </span>
                              <span class="cert-year">2024</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* <!-- /Resume Section --> */}
    </>
  )
}

export default Resume