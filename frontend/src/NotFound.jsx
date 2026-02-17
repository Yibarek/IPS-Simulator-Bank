import React from 'react'

import { useNavigate } from "react-router-dom";
  
  const NotFound = () => {
  const navigate = useNavigate();
  
  function backToHome() {
    navigate("/home");
  }
  return (
    <>
   
    <section id="error-404" class="error-404 section checkout-container">

      <div class="container" >

        <div class="row justify-content-center">
          <div class="col-lg-6 col-md-8">
            <div class="error-box text-center">
              <div class="error-icon" >
                <i class="bi bi-exclamation-triangle"></i>
              </div>
              <div class="error-code" >
                <span>4</span>
                <span>0</span>
                <span>4</span>
              </div>
              <h2>Page Not Found</h2>
              <p >You are requesting invalid page or Page development is not yet completed please contact system administrator.</p>
              <div class="error-actions" >
                <button class="btn-home btn btn-primary" onClick={backToHome}>
                  <i class="bi bi-house-door"></i>
                  <span > Back to Home</span>
                </button>
                {/* <a href="/contact" class="btn-support">
                  <i class="bi bi-headset"></i>
                  <span>Get Support</span>
                </a> */}
              </div>
            </div>
          </div>
        </div>

      </div>

    </section>

    </>
  )
}

export default NotFound