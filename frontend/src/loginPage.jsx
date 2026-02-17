import React, { useState, useRef, useEffect} from "react";
import Select from "react-select";
import { flushSync } from "react-dom";
import { getUserErrorMessage } from "./errorMessage";
import "./assets/css/InputForm.css";
import api from "./api";
import { useNavigate } from "react-router-dom";

export function open_LoginPage() {
  document.getElementById("checkout-container").style.display = "block";
}

export function close_LoginPage() {
  document.getElementById("checkout-container").style.display = "none";
}


export default function LoginPage() {
  // const updateStatus = (key, value) => {
  //   setLogin((prev) => ({
  //     ...prev,
  //     [key]: value,
  //   }));
  // };

  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [error, setError] = useState("5");
  const [showNotification, setShowNotification] = useState(false);

  const navigate = useNavigate();

  const triggerNotification = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 20000);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    triggerNotification();
    sendPushPaymentRequest();
    setTimeout(() => window.location.reload(), 2000);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.2;
    }
  }, []);

  // -- Login Request to backend  --
    const sendLoginRequest = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        const res = await api.post("/Login", {
          username: username,
          password: password,
        });
        if (res.data.user) {
          
          if (res.data.user.username === username) {
            console.log("User : " + res.data.user.username)
            console.log("Message : " + res.data.message)
            console.log("Token : " + res.data.token)
            // store the token
            localStorage.setItem("token", res.data.token);

            // updateStatus("login", true)
            navigate("/home");
          } else {
            console.log(res.data.message)
            const message = res.data.message;
            setError(message);
            triggerNotification()
          }
        }else {
          console.log(res.data.message)
          const message = res.data.message;
          setError(message);
          triggerNotification()
        }
        
      } catch (err) {
        const message = getUserErrorMessage(err);
        // alert(message); // show to user
        setError(message);
        triggerNotification()
          
        console.error(message);
      } finally {
        setLoading(false);
      }
    };
  

  return (
    <>
      {/* {formState.displayLoginPage && ( */}
        <div className="checkout-container d-flex justify-content-center" style={{height: "450px", marginTop: "100px"}}>
            <video className = "video-panel" src="./video/EthioPay-Brand.mp4" autoplay
        muted
        loop
        playsinline 
        ref={videoRef}
        style={{height: "450px", width: "90%",paddingRight: "1px",paddingLeft: "1px", borderRadius: "18px"}} autoPlay="true"></video>

            <div className="form-panel" style={{width: "30%", maxWidth: "400px", minWidth: "300px"}}>
            <h1 className="h3 fw-bold mb-4" style={{ color: "green", paddingBottom: "10px" }}>
              {/* <i className="bi  bi-bank"> </i> */}
               Login
            </h1>



            {/* Form */}
            <form onSubmit={handleSubmit} >
              
                <div className="form-step active">
                  {/* <h1 className="h3 fw-bold mb-4" style={{ color: "green", paddingBottom: "10px" }}>Login</h1> */}
                  <label
                    htmlFor="debitorBank"
                    style={{ fontWeight: "bold", fontSize: "14px" }}
                    className="form-label"
                  >
                    UserName
                  </label>
                  <input
                    className="form-control col-md-6"
                    name="username"
                    placeholder="username"
                    value= {username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                  />

                 <label
                    htmlFor="debitorBank"
                    style={{ fontWeight: "bold", fontSize: "14px" }}
                    className="form-label"
                  >
                    Password
                  </label>
                  <input
                    className="form-control col-md-6"
                    name="password"
                    type="password"
                    placeholder="Password"
                    value= {password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />
                    
                  <div
                    className={`login-error-message ${showNotification ? "show" : ""}`}
                  >
                    {error}
                  </div>

                  <div className="d-flex justify-content-end mt-1" >
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={sendLoginRequest}
                      disabled={loading}
                    >
                      {loading ? "Logging..." : "Login"} 
                    </button>
                  </div>
                </div>

            </form>
          </div>
        
          {/* Notification */}
          {/* <div
            className={`notification-message ${showNotification ? "show" : ""}`}
          >
            {currentStep === 0
              ? "Please fill out all required information."
              : "Verification Completed!"}
          </div> */}

          {/* <div
            className={`notification-message ${showErrorNotification ? "show" : ""}`}
          >
          </div> */}

        </div>
      {/* )} */}
    </>
  );
}
