// import React from 'react'

// function About() {
//   return (
//     <>
//         {/* <!-- About Section --> */}
//         <section id="about" className="about section">
//           {/* <!-- Section Title --> */}
//           <div className="container section-title" data-aos="fade-up">
//             {/* <span className="subtitle">About Me</span> */}
//             <h2 className="Section-title">About Me</h2>
//             <p>I am a computer science graduate with excellent academic performance and a passion for
//                 building impactful software. I have two years of professional experience working at Huawei,
//                 where I gained strong technical skills and practical experience in real-world projects. 
//                 In addition to that, I have developed several websites and currently work as a software 
//                 development freelancer, I enjoy solving complex problems, and creating efficient, 
//                 user-friendly applications that make a difference.
//             </p>
//           </div>
//           {/* <!-- End Section Title --> */}

//           <div className="container" data-aos="fade-up" data-aos-delay="100">
//             <div className="row gy-5">
//               <div className="col-lg-4" data-aos="zoom-in" data-aos-delay="150">
//                 <div className="profile-card">
//                   <div className="profile-header">
//                     <div className="profile-avatar">
//                       <img
//                         src="./src/assets/img/profile/profile-square-3.webp"
//                         className="img-fluid"
//                         alt=""
//                       ></img>
//                       <div className="status-indicator"></div>
//                     </div>
//                     <h3>Yitbarek Wondatir</h3>
//                     <span className="role">Full Stack Developer</span>
//                     <div className="rating">
//                       <i className="bi bi-star-fill"></i>
//                       <i className="bi bi-star-fill"></i>
//                       <i className="bi bi-star-fill"></i>
//                       <i className="bi bi-star-fill"></i>
//                       <i className="bi bi-star-half"></i>
//                       <span>4.8</span>
//                     </div>
//                   </div>

//                   <div className="profile-stats">
//                     <div className="stat-item">
//                       <h4>5</h4>
//                       <p>Projects</p>
//                     </div>
//                     <div className="stat-item">
//                       <h4>4+</h4>
//                       <p>Years</p>
//                     </div>
//                     <div className="stat-item">
//                       <h4>4</h4>
//                       <p>Awards</p>
//                     </div>
//                   </div>

//                   <div className="profile-actions">
//                     <a href="#" className="btn-primary">
//                       <i className="bi bi-download"></i> Download CV
//                     </a>
//                     <a href="#" className="btn-secondary">
//                       <i className="bi bi-envelope"></i> Contact
//                     </a>
//                   </div>

//                   <div className="social-connect">
//                     <a href="#">
//                       <i className="bi bi-linkedin"></i>
//                     </a>
//                     <a href="#">
//                       <i className="bi bi-github"></i>
//                     </a>
//                     <a href="#">
//                       <i className="bi bi-twitter"></i>
//                     </a>
//                     <a href="#">
//                       <i className="bi bi-instagram"></i>
//                     </a>
//                   </div>
//                 </div>
//               </div>

//               <div className="col-lg-8" data-aos="fade-left" data-aos-delay="200">
//                 <div className="content-wrapper">
//                   <div className="bio-section">
//                     <div className="section-tag">About Me</div>
//                     <h2>Transforming Ideas into Digital Reality</h2>
//                     <p>For several years, I have been developing websites by carefully interpreting and 
//                         implementing detailed software documentation provided by clients and stakeholders. 
//                         My process involves analyzing requirement specifications, translating them into 
//                         functional and user-centric web solutions, and ensuring that the final product 
//                         aligns with both technical expectations and business goals. 
//                     </p>
//                     <p>
//                       Throughout these projects, I have demonstrated strong analytical skills, attention 
//                       to detail, and the ability to collaborate effectively with designers, to clarify 
//                         requirements and deliver high-quality, responsive websites on time. This experience 
//                         has strengthened my ability to manage competing priorities, solve complex problems, 
//                         and consistently deliver results that contribute to project success.
//                     </p>
//                   </div>

//                   <div className="details-grid">
//                     <div
//                       className="detail-item"
//                       data-aos="fade-up"
//                       data-aos-delay="250"
//                     >
//                       <i className="bi bi-briefcase"></i>
//                       <div className="detail-content">
//                         <span>Experience</span>
//                         <strong>4+ Years</strong>
//                       </div>
//                     </div>

//                     <div
//                       className="detail-item"
//                       data-aos="fade-up"
//                       data-aos-delay="300"
//                     >
//                       <i className="bi bi-mortarboard"></i>
//                       <div className="detail-content">
//                         <span>Degree</span>
//                         <strong>Computer Science</strong>
//                       </div>
//                     </div>

//                     <div
//                       className="detail-item"
//                       data-aos="fade-up"
//                       data-aos-delay="350"
//                     >
//                       <i className="bi bi-geo-alt"></i>
//                       <div className="detail-content">
//                         <span>Based In</span>
//                         <strong>Ethiopia, Addis Ababa</strong>
//                       </div>
//                     </div>

//                     <div
//                       className="detail-item"
//                       data-aos="fade-up"
//                       data-aos-delay="100"
//                     >
//                       <i className="bi bi-envelope"></i>
//                       <div className="detail-content">
//                         <span>Email</span>
//                         <strong>yitbarekwondatir@gmail.com</strong>
//                       </div>
//                     </div>

//                     <div
//                       className="detail-item"
//                       data-aos="fade-up"
//                       data-aos-delay="150"
//                     >
//                       <i className="bi bi-phone"></i>
//                       <div className="detail-content">
//                         <span>Phone</span>
//                         <strong>+251 (960) 84-40-84</strong>
//                       </div>
//                     </div>

//                     <div
//                       className="detail-item"
//                       data-aos="fade-up"
//                       data-aos-delay="200"
//                     >
//                       <i className="bi bi-calendar-check"></i>
//                       <div className="detail-content">
//                         <span>Availability</span>
//                         <strong>Open to Work</strong>
//                       </div>
//                     </div>
//                   </div>

//                   <div
//                     className="skills-showcase"
//                     data-aos="fade-up"
//                     data-aos-delay="250"
//                   >
//                     <div className="section-tag">Core Skills</div>
//                     <h3>Technical Proficiency</h3>

//                     <div className="skills-list skills-animation">
//                       <div className="skill-item">
//                         <div className="skill-info">
//                           <span className="skill-name">React &amp; Next.js</span>
//                           <span className="skill-percent">95%</span>
//                         </div>
//                         <div className="progress">
//                           <div
//                             className="progress-bar"
//                             role="progressbar"
//                             aria-valuenow="95"
//                             aria-valuemin="0"
//                             aria-valuemax="100"
//                           ></div>
//                         </div>
//                       </div>

//                       <div className="skill-item">
//                         <div className="skill-info">
//                           <span className="skill-name">Node.js &amp; Express</span>
//                           <span className="skill-percent">90%</span>
//                         </div>
//                         <div className="progress">
//                           <div
//                             className="progress-bar"
//                             role="progressbar"
//                             aria-valuenow="90"
//                             aria-valuemin="0"
//                             aria-valuemax="100"
//                           ></div>
//                         </div>
//                       </div>

//                       <div className="skill-item">
//                         <div className="skill-info">
//                           <span className="skill-name">Laravel &amp; PHP</span>
//                           <span className="skill-percent">88%</span>
//                         </div>
//                         <div className="progress">
//                           <div
//                             className="progress-bar"
//                             role="progressbar"
//                             aria-valuenow="88"
//                             aria-valuemin="0"
//                             aria-valuemax="100"
//                           ></div>
//                         </div>
//                       </div>

//                       <div className="skill-item">
//                         <div className="skill-info">
//                           <span className="skill-name">
//                             Mysql &amp; GaussDB
//                           </span>
//                           <span className="skill-percent">85%</span>
//                         </div>
//                         <div className="progress">
//                           <div
//                             className="progress-bar"
//                             role="progressbar"
//                             aria-valuenow="85"
//                             aria-valuemin="0"
//                             aria-valuemax="100"
//                           ></div>
//                         </div>
//                       </div>

//                       <div className="skill-item">
//                         <div className="skill-info">
//                           <span className="skill-name">Java &amp; Javascript</span>
//                           <span className="skill-percent">80%</span>
//                         </div>
//                         <div className="progress">
//                           <div
//                             className="progress-bar"
//                             role="progressbar"
//                             aria-valuenow="80"
//                             aria-valuemin="0"
//                             aria-valuemax="100"
//                           ></div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//         {/* <!-- /About Section --> */}
//     </>
//   )
// }

// export default About