import React, { useState, useEffect, use } from "react";
import { Link, useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
import { NavLink } from "react-router-dom";

function navbar() {
  const navigate = useNavigate();
  
  const [home, setHome] = useState(true);
  const [transaction, setTransaction] = useState(false);
  const [user, setUser] = useState(false);
  // const [exp, setExp] = useState(100000);

  // const updateStatus = (key, value) => {
  //   setLogin((prev) => ({
  //     ...prev,
  //     [key]: value,
  //   }));
  // };

  
    let token = localStorage.getItem("token");
    useEffect(() => { 
      const interval = setInterval(() => { 
        token = localStorage.getItem("token");
        if (!token) {
           clearInterval(interval);
           navigate("/login"); // redirect to login 
           return;
        }
       
        const decoded = parseJwt(token);

        if (decoded && decoded.exp) {
          const currentTime = Math.floor(Date.now() / 1000);
          // setExp(decoded.exp);
          if (decoded.exp < currentTime) {
            console.log("Token expired. please login again. ");
            localStorage.removeItem("token");
            navigate("/login"); // redirect to login
          } else {
            // console.log("Token valid");
          }
        }
        // console.log(decoded.exp) 
       }, 5000);
       return () => clearInterval(interval); 
    }, [navigate]);

    // function useCountdown(targetTime) {
    //   const target = new Date(targetTime).getTime();
    //   const [timeLeft, setTimeLeft] = useState(target - Date.now());
  
    //   useEffect(() => {
    //     const interval = setInterval(() => {
    //       const diff = target - Date.now();
    //       setTimeLeft(diff > 0 ? diff : 0);
    //     }, 1000);
  
    //     return () => clearInterval(interval);
    //   }, [target]);
  
    //   return timeLeft;
    // }
  
    
    // const timeLeft = useCountdown(exp);
    // useEffect(() => {
    //   if (timeLeft === 0 ) {
    //     console.log("Token expired");
    //         localStorage.removeItem("token");
    //         navigate("/login"); // redirect to login
    //   }
    // });


    function parseJwt(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (e) {
        return null;
      }
    }


  const handleLogout = () => {
    localStorage.removeItem("token"); // clear token
    // flushSync(() => {
    //   updateStatus("login", false)
    // });
    navigate("/login", { replace: true });
    console.log("logout")
  };

  return (
    <>
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="container-fluid  position-relative d-flex align-items-center">
        <Link to="/home" href="index.html" className="logo d-flex align-items-center me-auto">
          <h1 className="sitename"><img src="/images/EthioPay-Logo.png" style={{width: "35px", height: "45px", marginRight: "-1px", marginTop: "-10px"}}></img>  Simulator Bank</h1>
        </Link>

        <nav id="navmenu" className="navmenu">

          {token && <ul>
            <li>
            <NavLink 
              to="/home" 
              className={({ isActive }) => isActive ? "active" : ""}
            >
              Home
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/transactions" 
              className={({ isActive }) => isActive ? "active" : ""}
            >
              Transactions
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/user" 
              className={({ isActive }) => isActive ? "active" : ""}
            >
              Users
            </NavLink>
          </li>
            <li>
              <Link to="/request_token">Configuration</Link>
            </li>
            
            {/* <li className="dropdown">
              <a href="#">
                <span>Users</span>{" "}
                <i className="bi bi-chevron-down toggle-dropdown"></i>
              </a>
              <ul>
                
                <li>
                  <a href="#">Merchant</a>
                </li>
                <li className="dropdown">
                  <a href="#">
                    <span>Operators</span>{" "}
                    <i className="bi bi-chevron-down toggle-dropdown"></i>
                  </a>
                  <ul>
                    <li>
                      <a href="#">Superadmin</a>
                    </li>
                    <li>
                      <a href="#">Admin User</a>
                    </li>
                    <li>
                      <a href="#">Normal User</a>
                    </li>
                  </ul>
                </li>
              </ul>
            </li> */}
            <li>
              <Link to="/tasks">Tasks</Link>
            </li>
            
          </ul>}
          <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
        </nav>

        {token && <a className="btn-getstarted" style={{cursor: "pointer"}}
          onClick={handleLogout}>
          logout
        </a>}
      </div>
    </header>
    </>
  );
}

export function showMenuEx() {
  login1()
}

export default navbar;
