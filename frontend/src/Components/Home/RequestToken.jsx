import React, { useState } from "react";
import axios from "axios";
import ReactJson from "@microlink/react-json-view";

export function open_requestToken(){
  document.getElementById("request_token_page").style.display = "flex"
};
export function close_requestToken (){
  document.getElementById("request_token_page").style.display = "none"
}

function RequestToken( { formState, setFormState} ) {
  const updateField = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendTokenRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    document.getElementById("result").value = "";
    try {
        const response = await axios.post("http://localhost:5000/requestToken", {
        grant_type: "password",
        username,
        password,
        jwt,
      });

      setResult(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data || err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {formState.displayToken && (
      <div className="checkout-container " 
           id="request_token_page"
          //  style={{ display: "none"}}
           >
           {/* style={{marginTop: "-120px", display: "none"}}> */}
            
        <div
          className="form-panel"
          //  style={{maxWidth: "50%"}}
          >
            
          <button
            className="btn close-btn"
            onClick={(e) => {
              close_requestToken();
              updateField("home", true)
              updateField("displayToken", false)
              setUsername(null);
              setPassword(null);
              setJwt(null);
            }}
            style={{ cursor: "pointer", marginRight: "25px" }}
          >
            {" "}
            X{" "}
          </button>
          <h2 className="h3 fw-bold mb-4" style={{ color: "green" }}>
            Get Token
          </h2>

          <form onSubmit={sendTokenRequest}>
            <div className="row g-6">
              <div className="col-md-6">
                <label
                  htmlFor="username"
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginTop: "25px",
                  }}
                  className="form-label"
                >
                  Username <i style={{ color: "red" }}> *</i>
                </label>
                <input
                  id="username"
                  className="form-control"
                  name="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label
                  htmlFor="password"
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginTop: "25px",
                  }}
                  className="form-label"
                >
                  Password <i style={{ color: "red" }}> *</i>
                </label>
                <input
                  id="Password"
                  className="form-control"
                  name="Password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <br />
            <div className="row g-2">
              <label
                htmlFor="jwt"
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginBottom: "-5px",
                  marginTop: "25px",
                }}
                className="form-label"
              >
                JWT <i style={{ color: "red" }}> *</i>
              </label>
              <input
                className="form-control mb-4"
                name="jwt"
                type="text"
                placeholder="eyJ0eXBlIjoiSldUI..."
                value={jwt}
                onChange={(e) => setJwt(e.target.value)}
                required
              />
            </div>

            <br />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              onClick={sendTokenRequest}
            >
              {loading ? "Requesting..." : "Submit"}
            </button>
          </form>
        </div>

        <div className="form-panel d-none d-sm-block" style={{minWidth: "300px" , maxWidth: "720px"}}>
          <h3> Result </h3>
          <br />
          <p id= "result" style={{textAlign: "left"}}>
            
            {result && (
            <pre style={{ marginTop: "20px",color: "green" }}>
              <ReactJson
              src={result}
              // theme="monokai"
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={true}
              name={false}
              iconStyle="triangle"
              collapsed={2}
            />
            </pre>
          )}

          {error && (
            <pre style={{ marginTop: "20px", color: "red" }}>
              <ReactJson
              src={error}
              // theme="monokai"
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={true}
              name={false}
              iconStyle="triangle"
              collapsed={2}
            />
            </pre>
          )}
          
          </p>
        </div>
      </div>)}
    </>
  );
}

export default RequestToken;



// import React, { useState } from "react";
// import axios from "axios";

// function RequestToken() {
//   const [isOpen, setIsOpen] = useState(false);

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [jwt, setJwt] = useState("");

//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const openModal = () => setIsOpen(true);

//   const closeModal = () => {
//     setIsOpen(false);
//     setUsername("");
//     setPassword("");
//     setJwt("");
//     setResult(null);
//     setError(null);
//   };

//   const sendTokenRequest = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const res = await axios.post("http://localhost:5000/token", {
//         grant_type: "password",
//         username,
//         password,
//         jwt,
//       });

//       setResult(res.data);
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data || err.message);
//       setResult(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       {/* Trigger button */}
//       <button className="btn btn-success" onClick={openModal}>
//         Get Token
//       </button>

//       {/* Modal */}
//       {isOpen && (
//         <div className="checkout-container" style={{ marginTop: "-120px" }}>
//           <div
//             className="form-panel"
//             style={{ minWidth: "400px", width: "40%", margin: "auto" }}
//           >
//             <button
//               className="btn close-btn"
//               onClick={closeModal}
//               style={{ cursor: "pointer", marginRight: "35px" }}
//             >
//               X
//             </button>

//             <h2 className="h3 fw-bold mb-4" style={{ color: "green" }}>
//               Get Token
//             </h2>

//             <form onSubmit={sendTokenRequest}>
//               <div className="row g-3">
//                 <div className="col-md-6">
//                   <label className="form-label fw-bold">
//                     Username <span style={{ color: "red" }}>*</span>
//                   </label>
//                   <input
//                     className="form-control"
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
//                     required
//                   />
//                 </div>

//                 <div className="col-md-6">
//                   <label className="form-label fw-bold">
//                     Password <span style={{ color: "red" }}>*</span>
//                   </label>
//                   <input
//                     type="password"
//                     className="form-control"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="mt-3">
//                 <label className="form-label fw-bold">
//                   JWT <span style={{ color: "red" }}>*</span>
//                 </label>
//                 <input
//                   className="form-control"
//                   placeholder="eyJ0eXBlIjoiSldUI..."
//                   value={jwt}
//                   onChange={(e) => setJwt(e.target.value)}
//                   required
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="btn btn-primary mt-4"
//                 disabled={loading}
//               >
//                 {loading ? "Requesting..." : "Submit"}
//               </button>
//             </form>

//             <div className="summary-panel d-none" style={{width: "60%"}}>
//            <h3> Result </h3>
//            <br />
//            {result && (
//             <pre style={{ marginTop: "20px" }}>
//               {JSON.stringify(result, null, 2)}
//             </pre>
//           )}

//           {error && (
//             <pre style={{ marginTop: "20px", color: "red" }}>
//               {JSON.stringify(error, null, 2)}
//             </pre>
//           )}
//         </div>
//           </div>
//         </div> 
//       )}
//     </>
//   );
// }

// export default RequestToken;
