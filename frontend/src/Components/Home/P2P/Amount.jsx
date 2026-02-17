// import React from "react";
// // import Services from "./Services";
// // import Checkout from "./Checkout";
// import { open_P2P_Checkout_Popup } from "./Checkout";
// import { open_P2P_Verification_Popup } from "./AccVerification";
// import { resetVerificationInputs } from "./AccVerification";
// import { flushSync } from "react-dom";

// // -- P2P amount POPUP  --
// export function open_P2P_Amount_Popup() {
//   document.getElementById("p2p-amount-popup").style.display= "block"
  
// }

// export function close_P2P_Amount_Popup() {
//   document.getElementById("p2p-amount-popup").style.display= "none"
// }

// export function resetAmountInputs (){
//   document.getElementById("amount").value = ''
// }

// function Amount({formState, setFormState}) {
//   const updateField = (key, value) => {
//     setFormState(prev => ({
//       ...prev,
//       [key]: value,
//     }));
//   };

//   return (
//     <>
//       {/* ---------  P2P Amount POPUP Content ---------- */}
//       <div
//         id="p2p-amount-popup"
//         className="section content"
//         style={{ display: "none" }}
//       >
//         {/* <div className=""> */}
//         {/* <div className="card p-4 shadow-sm"> */}
//         <button
//           className="btn close-btn"
//           onClick={() => {
//                     close_P2P_Amount_Popup();
//                     flushSync(() => {
//                       updateField("home", true);
//                     });
//                     resetStates();
//                   }}
//           style={{ margin: "5px", cursor: "pointer" }}
//         >
//           {" "}
//           X{" "}
//         </button>
//         <h3
//           className="mb-4 popup-title "
//           style={{
//             color: "green",
//             fontWeight: "600",
//             fontSize: "30px",
//             maxWidth: "90%",
//             maxHeight: "60px",
//             paddingBottom: "80px",
//           }}
//         >
//           Transfer to Other Bank
//         </h3>

//         <div className="p2p-content ">
//           {/* Participant Bank */}
//           <div className="mb-3">
//             <label
//               htmlFor="bankInput"
//               style={{ fontWeight: "400", fontSize: "18px" }}
//               className="form-label"
//             >
//               Bank: {formState.creditorBank}
//             </label>
//             <label
//               htmlFor="bankInput"
//               style={{ fontWeight: "400", fontSize: "18px" }}
//               className="form-label"
//             >
//               Account: {formState.creditorAccount}
//             </label>
//             <label
//               htmlFor="bankInput"
//               style={{ fontWeight: "bold", fontSize: "18px" , color:"orange"}}
//               className="form-label"
//             >
//               {formState.creditorName && "Name: "} {formState.creditorName}
//             </label>

//             {!formState.creditorName && <label
//               htmlFor="bankInput"
//               style={{ fontWeight: "bold", fontSize: "18px" , color:"orange"}}
//               className="form-label"
//             >
//               {formState.errorcode && "Reason: "} {formState.errorcode}
//             </label>}
            
//             {formState.creditorName && (
//               <label
//                 className="bi bi-check-circle "
//                 style={{ color: "green", marginTop: "-250px", fontSize: "20px" }}
//               >
//                 <i style={{ fontSize: "10px" }}> Account verified</i>
//               </label>
//             )}

//             {!formState.creditorName && (
//               <label
//                 className="bi bi-check-circle danger"
//                 style={{ color: "red", fontSize: "20px" }}
//               >
//                 <i style={{ fontSize: "10px" }}>
//                   {" "}
//                   Account verification failed !
//                 </i>
//               </label>
//             )}
//           </div>

//           {/* Amount */}
//           {formState.creditorName && (
//             <div className="mb-4">
//               <label
//                 htmlFor="amount"
//                 style={{ fontWeight: "bold", fontSize: "18px" }}
//                 className="form-label"
//               >
//                 Amount
//               </label>
//               <input
//                 type="text"
//                 id="amount"
//                 className="form-control"
//                 placeholder="Enter Amount"
//                 value={formState.amount}
//                 onChange={(e) => updateField("amount", e.target.value)}
//                 required
//               />
//             </div>
//           )}

//           {/* Submit Button */}
//           {formState.creditorName && (
//             <div className="d-flex justify-content-center pt-4">
//               <button
//                 type="button"
//                 className="btn btn-success w-100"
//                 style={{
//                   maxWidth: "200px",
//                   fontWeight: "bold",
//                   fontSize: "18px",
//                 }}
//                 onClick={(e) => {
//                   close_P2P_Amount_Popup();
//                   open_P2P_Checkout_Popup();
//                   resetVerificationInputs();
//                 }}
//               >
//                 Continue
//               </button>
//             </div>
//           )}

//           {/* TryAgain Button */}
//           {!formState.creditorName && (
//             <div className="d-flex justify-content-center pt-4">
//               <button
//                 type="button"
//                 className="btn btn-danger w-100"
//                 style={{
//                   maxWidth: "200px",
//                   fontWeight: "bold",
//                   fontSize: "18px",
//                 }}
//                 onClick={(e) => {
//                   close_P2P_Amount_Popup();
//                   open_P2P_Verification_Popup();
//                   resetVerificationInputs();
//                 }}
//               >
//                 Try Again
//               </button>
//             </div>
//           )}
//           {/* </div> */}
//           {/* </div> */}
//         </div>
//       </div>
//     </>
//   );
// }

// export default Amount