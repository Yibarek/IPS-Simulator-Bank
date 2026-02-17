// import React, { useEffect } from "react";
// import { flushSync } from "react-dom";
// import socket from "../../../Socket.js";

// import { open_Normal_RTP_Popup } from "./NormalRTP";
// import { open_Blank_RTP_Popup } from "./BlankRTP1.jsx";
// import { resetNormalRTPInputs } from "./NormalRTP";
// import { resetBlankRTPInputs } from "./BlankRTP1.jsx";
// import GenerateQR from "./GenerateQR";
// import {close_GenerateQR_Popup} from "./GenerateQR";

// let UETR = ''
// let TxId = ''
// let Status = ''

// // -- P2P RTPReport POPUP  --
// export function open_RTPReport_Popup() {
//   document.getElementById("rtp-report-popup").style.display = "block";
// }

// export function close_RTPReport_Popup() {
//   document.getElementById("rtp-report-popup").style.display = "none";
// }

// // -- Cancel RTP  POPUP  --
// export function open_Cancel_RTP_Popup() {
//   document.getElementById("cancel-rtp-popup").style.display = "block";
// }

// export function close_Cancel_RTP_Popup() {
//   document.getElementById("cancel-rtp-popup").style.display = "none";
// }

// export default function RTPReport({
//   formState,
//   setFormState,
//   resetStates,
// }) {
//   const updateField = (key, value) => {
//     flushSync(() => {
//           setFormState((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//   });
    
//   };

//   useEffect(() => {
//     socket.on("connect", () => {
//       console.log("Connected:", socket.id);
//     });

//     socket.on("connect_error", (err) => {
//       console.log("Connection Error:", err.message);
//     });

//     return () => {
//       socket.off("connect");
//       socket.off("connect_error");
//     };
//   }, []);

//   // payment-update (pain.014)
//   useEffect(() => {
//     socket.on("payment-update", (data) => {
//       console.log("Received from backend:", data.UETR);
//       console.log("Received from backend:", data.txStatus);
//       console.log("Received from frontend:", formState.UETR);
//       close_GenerateQR_Popup

//       if (data.txStatus === "ACSP") {
//         console.log("Paid")
//         updateField("RtpRecieved", false);
//         console.log("RtpReceived:", formState.RtpReceived);
//         updateField("RtpPaid", true);
//         console.log("RtpPaid : " + formState.RtpPaid)
//         updateField("RtpRejected", false);
//         console.log("RtpRejected : " + formState.RtpRejected)
//         updateField("RtpCancelled", false);
//         console.log("RtpCancelled : " + formState.RtpCancelled)
//       }
//       else{
//         console.log("Rejected")
//         updateField("RtpRecieved", false);
//         console.log("RtpReceived:", formState.RtpReceived);
//         updateField("RtpPaid", false);
//         console.log("RtpPaid : " + formState.RtpPaid)
//         updateField("RtpRejected", true);
//         console.log("RtpRejected : " + formState.RtpRejected)
//         updateField("RtpCancelled", false);
//         console.log("RtpCancelled : " + formState.RtpCancelled)
//       }
//     });

//     return () => socket.off("payment-update");
//   }, []);


//   // Completion-notification (pacs.002)
//   useEffect(() => {
//       socket.on("completion-notification", (data) => {
//         console.log("Received from backend:", data.TxId);
//         console.log("Received from backend:", data.txStatus);
//         console.log("Received from frontend:", formState.TxId);
//         close_GenerateQR_Popup
//         TxId = data.TxId;
        
//         if (data.txStatus === "ACSC") {
//           console.log("Paid")
//           updateField("txSuccess", true);
//           updateField("txFail", false);
//           document.getElementById("debitorBank").value = data.debitorBank
//           document.getElementById("debitorName").value = data.debitorName
//           document.getElementById("debitorAccount").value = data.debitorAccount
//           console.log("txSuccess : " + formState.txSuccess)
//           console.log("txFail : " + formState.txFail)
//         }
//         else{
//           console.log("Rejected")
//           updateField("txFail", true);
//           updateField("txSuccess", false);
//           console.log("txSuccess : " + formState.txSuccess)
//           console.log("txFail : " + formState.txFail)
//         }
//       });
  
//       return () => socket.off("completion-notification");
//     }, []);


//   return (
//     <>
//       {/* RTP POPUP Content */}
//       <div
//         id="cancel-rtp-popup"
//         className="cancel-rtp-popup"
//         style={{
//           display: "none",
//           height: "35%",
//           width: "25%",
//           minWidth: "250px",
//           minHeight: "25%",
//         }}
//       >
//         <button
//           className="btn cancel-close-btn"
//           onClick={close_Cancel_RTP_Popup}
//           style={{ marginRight: "-15px", marginTop: "5px" }}
//         >
//           {" "}
//           X{" "}
//         </button>
//         <div
//           className="rtp-popup-content"
//           style={{
//             paddingTop: "10px",
//             paddingleft: "10px",
//             paddingRight: "10px",
//           }}
//         >
//           <div
//             className="popup-content"
//             style={{ height: "50px", width: "200px", background: "orange" }}
//             onClick={(e) =>
//               sendRTPCancelRequest(e, "WrongAmount", "Invalid amount")
              
//             }
//           >
//             Wrong Amount
//           </div>
//           <div
//             className="popup-content"
//             style={{
//               height: "50px",
//               width: "200px",
//               marginTop: "-5%",
//               background: "orange",
//             }}
//             onClick={(e) =>
//               sendRTPCancelRequest(
//                 e,
//                 "invalidreceiverBIC",
//                 "Receiver BIC is not defined or invalid",
//               )
//             }
//           >
//             Invalid Debitor Info
//           </div>
//         </div>
//       </div>

//       {/* ---------  RTP Report POPUP Content ---------- */}
//       <div
//         id="rtp-report-popup"
//         className="service content"
//         style={{ display: "none", marginTop: "50px" }}
//       >
//         {/* <div className="card p-4 shadow-sm"> */}
//         <button
//           className="btn close-btn"
//           onClick={() => {
//             close_RTPReport_Popup();
//             resetNormalRTPInputs();
//             resetBlankRTPInputs();
//             resetStates();
//             flushSync(() => {
//               updateField("home", true);
//             });
//           }}
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
//             maxWidth: "100%",
//             maxHeight: "60px",
//             marginBottom: "-30px",
//             paddingBottom: "10px",
//           }}
//         >
//           Request To Pay
//         </h3>
//         <div className="report-border " style={{ minWidth: "670px" }}>
//           {/* {formState.UETR && <h3
//           className="mb-4 popup-title "
//           style={{
//             color: "orange",
//             fontWeight: "600",
//             fontSize: "30px",
//             maxWidth: "100%",
//             maxHeight: "80px",
//             // marginTop: "-30px",
//           }}
//         >
//           (-- Report --)
//         </h3>} */}

//           {/* <hr style={{marginLeft: "3%", marginRight: "3%"}}/> */}

//           <div className="p2p-content-checkout" style={{ marginTop: "-10px" }}>
//             <table>
//               <tbody className="m-2">
//                 <tr>
                  
//                     {formState.UETR && (
//                       <td style={{ width: "100%"}}>
//                       <table
//                         className=" mb-2"
//                         style={{ width: "100%"}}
//                         // style={{ width: "100%", marginRight: "5%" }}
//                       >
//                         <tbody
//                           className=""
//                           style={
//                             formState.normalrtp ||
//                             !formState.RtpCancelled ||
//                             !formState.RtpPaid ||
//                             !formState.RtpRejected
//                               ? { minWidth: "670px", width: "100%" }
//                               : { minWidth: "250px", width: "50%" }
//                           }
//                         >
//                           <tr>
//                             <th
//                               className="fw-bold fs-6 rtpreport"
//                               colspan={2}
//                               style={{ textAlign: "center" }}
//                             >
//                               Transaction Info
//                             </th>
//                           </tr>

//                           {formState.UETR && (
//                             <tr>
//                               <th
//                                 className=""
//                                 style={{
//                                   minWidth: "120px",
//                                   textAlign: "right",
//                                 }}
//                               >
//                                 UETR :{" "}
//                               </th>
//                               <td
//                                 className=""
//                                 colspan={2}
//                                 style={{
//                                   minWidth: "180px",
//                                   maxWidth: "250px",
//                                   textAlign: "left",
//                                   paddingLeft: "5px",
//                                 }}
//                               >
//                                 {/* {formState.UETR} */}
//                                 {UETR = formState.UETR}
//                               </td>
//                             </tr>
//                           )}

//                           {TxId && (
//                             <tr>
//                               <th
//                                 className=""
//                                 style={{
//                                   minWidth: "120px",
//                                   textAlign: "right",
//                                 }}
//                               >
//                                 TxId :{" "}
//                               </th>
//                               <td
//                                 className=""
//                                 colspan={2}
//                                 style={{
//                                   minWidth: "180px",
//                                   maxWidth: "250px",
//                                   textAlign: "left",
//                                   paddingLeft: "5px",
//                                 }}
//                               >
//                                 {TxId}
//                               </td>
//                             </tr>
//                           )}

//                           <br />
//                           <tr
//                             className=""
//                             style={{ marginRight: "5%", paddingRight: "5%" }}
//                           >
//                             {(formState.normalrtp || formState.RtpPaid || formState.RtpRejected) && (
//                               <th
//                                 className=" rtpreport"
//                                 colspan={2}
//                                 style={{ textAlign: "center", margin: "100px" }}
//                               >
//                                 Debitor Info
//                               </th>
//                             )}

//                             <th
//                               className="rtpreport"
//                               colspan={2}
//                               style={{ textAlign: "center", margin: "100px" }}
//                             >
//                               Creditor Info
//                             </th>
//                             {/* <td className="fw-bold fs-6" style={{textAlign: "left", paddingLeft: "20px"}}></td> */}
//                           </tr>

//                           <tr>
//                             {(formState.normalrtp || formState.RtpPaid || formState.RtpRejected) && (
//                               <>
//                                 <th
//                                   className=""
//                                   style={{
//                                     minWidth: "120px",
//                                     textAlign: "right",
//                                   }}
//                                 >
//                                   Debitor Bank :{" "}
//                                 </th>
//                                 <td
//                                   className=""
//                                   id="debitorBank"
//                                   style={{
//                                     minWidth: "180px",
//                                     textAlign: "left",
//                                     paddingLeft: "10px",
//                                   }}
//                                 >
//                                   {formState.debitorBank}
//                                 </td>
//                               </>
//                             )}
//                             <th
//                               className=""
//                               style={{ minWidth: "120px", textAlign: "right" }}
//                             >
//                               Creditor Bank :{" "}
//                             </th>
//                             <td
//                               className=""
//                               id="creditorBank"
//                               style={{
//                                 minWidth: "180px",
//                                 textAlign: "left",
//                                 paddingLeft: "10px",
//                               }}
//                             >
//                               {formState.creditorBank}
//                             </td>
//                           </tr>

//                           <tr>
//                             {(formState.normalrtp || formState.RtpPaid || formState.RtpRejected) && (
//                               <>
//                                 <th
//                                   className=""
//                                   style={{
//                                     minWidth: "120px",
//                                     textAlign: "right",
//                                   }}
//                                 >
//                                   Debitor Acc :{" "}
//                                 </th>
//                                 <td
//                                   className=""
//                                   id="debitorAccount"
//                                   style={{
//                                     minWidth: "180px",
//                                     textAlign: "left",
//                                     paddingLeft: "10px",
//                                   }}
//                                 >
//                                   {formState.debitorAccount}
//                                 </td>
//                               </>
//                             )}
//                             <th
//                               className=""
//                               style={{ minWidth: "120px", textAlign: "right" }}
//                             >
//                               Creditor Acc :{" "}
//                             </th>
//                             <td
//                               className=""
//                               style={{
//                                 minWidth: "180px",
//                                 textAlign: "left",
//                                 paddingLeft: "10px",
//                               }}
//                             >
//                               {formState.creditorAccount}
//                             </td>
//                           </tr>

//                           <tr>
//                             {(formState.normalrtp || formState.RtpPaid || formState.RtpRejected) && (
//                               <>
//                                 <th
//                                   className=""
//                                   style={{
//                                     minWidth: "120px",
//                                     textAlign: "right",
//                                   }}
//                                 >
//                                   Debitor Name :{" "}
//                                 </th>
//                                 <td
//                                   className=""
//                                   id="debitorName"
//                                   style={{
//                                     minWidth: "180px",
//                                     textAlign: "left",
//                                     paddingLeft: "10px",
//                                   }}
//                                 >
//                                   {formState.debitorName}
//                                 </td>
//                               </>
//                             )}
//                             <th
//                               className=""
//                               style={{ minWidth: "120px", textAlign: "right" }}
//                             >
//                               Creditor Name :{" "}
//                             </th>
//                             <td
//                               className=""
//                               style={{
//                                 minWidth: "180px",
//                                 textAlign: "left",
//                                 paddingLeft: "10px",
//                               }}
//                             >
//                               Merchant Name
//                             </td>
//                           </tr>

//                           <br />

//                           <tr className="" style={{ width: "100%" }}>
//                             <th
//                               className="fw-bold fs-6 rtpreport"
//                               colspan="2"
//                               style={{ textAlign: "center" }}
//                             >
//                               Payment
//                             </th>
//                           </tr>

//                           <tr>
//                             <th
//                               className=""
//                               style={{ minWidth: "120px", textAlign: "right" }}
//                             >
//                               Amount :
//                             </th>
//                             <td
//                               className="fs-6"
//                               style={{ textAlign: "left", paddingLeft: "10px" }}
//                             >
//                               {formState.amount}
//                             </td>
//                           </tr>

//                           <tr>
//                             <th
//                               className=""
//                               style={{ minWidth: "120px", textAlign: "right" }}
//                             >
//                               Currency :
//                             </th>
//                             <td
//                               className="fs-6"
//                               style={{ textAlign: "left", paddingLeft: "10px" }}
//                             >
//                               ETB
//                             </td>
//                           </tr>

//                           {!formState.RtpPaid && !formState.RtpRejected && !formState.RtpCancelled && (
//                             <tr>
//                               <th
//                                 className="fs-6"
//                                 style={{ textAlign: "right" }}
//                               >
//                                 Status :{" "}
//                               </th>
//                               <td
//                                 className="fw-bold fs-6 bi bi-check-circle "
//                                 colspan={3}
//                                 style={{
//                                   color: "orange",
//                                   marginRight: "10px",
//                                   fontSize: "20px",
//                                   marginLeft: "30px",
//                                   paddingLeft: "20px",
//                                   textAlign: "left",
//                                 }}
//                               >
//                                 {" "}
//                                 Request Received - Awaiting Payment ...
//                               </td>
//                             </tr>
//                           )}

//                           {!formState.RtpRejected && !formState.RtpCancelled && !formState.RtpPaid && (
//                             <tr>
//                               <th
//                                 className="fs-6"
//                                 style={{ textAlign: "right" }}
//                               >
//                                 Status :{" "}
//                               </th>
//                               <td
//                                 className="fw-bold fs-6 bi bi-x-circle-fill"
//                                 style={{
//                                   paddingLeft: "10px",
//                                   color: "orange",
//                                   fontSize: "20px",
//                                   textAlign: "left",
//                                 }}
//                               >
//                                 {" "}
//                                 Request Rejected
//                               </td>
//                             </tr>
//                           )}

//                           {formState.RtpRejected && (
//                             <tr>
//                               <th
//                                 className="fs-6"
//                                 style={{ textAlign: "right" }}
//                               >
//                                 Reason :{" "}
//                               </th>
//                               <td
//                                 className=""
//                                 colspan={3}
//                                 style={{
//                                   paddingLeft: "10px",
//                                   marginRight: "10px",
//                                   textAlign: "left",
//                                 }}
//                               >
//                                 {formState.AddtlInf
//                                   ? formState.AddtlInf
//                                   : "Receiver Bank Failed to receive the request"}
//                               </td>
//                             </tr>
//                           )}

//                           {formState.RtpCancelled && (
//                             <tr>
//                               <th
//                                 className="fs-6"
//                                 style={{ textAlign: "right" }}
//                               >
//                                 Status :{" "}
//                               </th>
//                               <td
//                                 className="fw-bold fs-6 bi bi-x-circle-fill"
//                                 colspan={2}
//                                 style={{
//                                   paddingLeft: "10px",
//                                   color: "orange",
//                                   fontSize: "20px",
//                                   textAlign: "left",
//                                 }}
//                               >
//                                 {" "}
//                                 RTP Cancelled Successfuly
//                               </td>
//                             </tr>
//                           )}

//                           {formState.RtpCancelled && (
//                             <tr>
//                               <th
//                                 className="fs-6"
//                                 style={{ textAlign: "right" }}
//                               >
//                                 Reason :{" "}
//                               </th>
//                               <td
//                                 className=""
//                                 style={{
//                                   paddingLeft: "10px",
//                                   marginRight: "10px",
//                                   textAlign: "left",
//                                 }}
//                               >
//                                 {formState.ReasonAddtlInf}
//                               </td>
//                             </tr>
//                           )}

//                           {formState.RtpPaid && (
//                             <tr>
//                               <th
//                                 className="fs-6"
//                                 style={{ textAlign: "right" }}
//                               >
//                                 Reason :{" "}
//                               </th>
//                               <td
//                                 className=""
//                                 style={{
//                                   paddingLeft: "10px",
//                                   marginRight: "10px",
//                                   textAlign: "left",
//                                 }}
//                               >
//                                 {formState.AddtlInf
//                                   ? formState.AddtlInf
//                                   : "Request is Accepted. Payment Completed!"}
//                               </td>
//                             </tr>
//                           )}

//                           <tr>
//                             <td colSpan={2}>
//                               <hr />
//                               {/* Submit Button */}
//                               <div className="d-flex justify-content-center pt-3">
//                                 {!formState.RtpPaid && !formState.RtpRejected&& !formState.RtpCancelled && (
//                                     <div className="d-flex justify-content-center pt-4">
//                                       <button
//                                         type="button"
//                                         className="btn btn-warning w-100"
//                                         style={{
//                                           maxWidth: "200px",
//                                           fontWeight: "bold",
//                                           fontSize: "18px",
//                                           color: "white",
//                                         }}
//                                         onClick={open_Cancel_RTP_Popup}
//                                         disabled={formState.loading}
//                                       >
//                                         {formState.loading
//                                           ? "Requesting..."
//                                           : "Cancel Request"}
//                                       </button>
//                                     </div>
//                                   )}
//                                 {formState.RtpRejected && (
//                                   <button
//                                     type="button"
//                                     className="btn btn-danger w-100 fw-bold fs-5"
//                                     style={{ maxWidth: "220px" }}
//                                     onClick={() => {
//                                       close_RTPReport_Popup();
//                                       resetStates();
//                                       resetNormalRTPInputs();
//                                       resetBlankRTPInputs();
//                                       open_Normal_RTP_Popup();
//                                     }}
//                                   >
//                                     Try Again
//                                   </button>
//                                 )}
//                               </div>
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>
//                       </td>
//                     )}
                  

//                   {!formState.normalrtp &&
//                     !formState.RtpCancelled &&
//                     !formState.RtpPaid &&
//                     !formState.RtpRejected && (
//                       <td className="pb-3">
//                         <div
//                           className="p2p-content-checkout"
//                           style={{
//                             position: "relative",
//                             alignContent: "right",
//                             minWidth: "350px",
//                             width: "60%",
//                             height: "450px",
//                             marginTop: "-60px",
//                           }}
//                         >
//                           <GenerateQR
//                             formState={formState}
//                             setFormState={setFormState}
//                             resetStates={resetStates}
//                           />
//                         </div>
//                       </td>
//                     )}
//                 </tr>
//               </tbody>
//             </table>

//             {formState.RtpPaid && (
//               <div
//                 className="success-bg RtpPaid"
//                 style={{
//                   width: "190px",
//                   height: "190px",
//                   top: "10px",
//                   right: "2px",
//                   position: "relative",
//                 }}
//               ></div>
//             )}
//             {(formState.RtpCancelled || formState.RtpRejected) && !formState.RtpReceived && !formState.RtpPaid && (
//               <div
//                 className="fail-bg RtpCancelled"
//                 style={{
//                   width: "190px",
//                   height: "190px",
//                   top: "2px",
//                   right: "3px",
//                   position: "relative",
//                 }}
//               ></div>
//             )}
//             {!formState.RtpPaid && !formState.RtpRejected && !formState.RtpCancelled && (
//               <div
//                 className="received-bg RtpRecieved"
//                 style={{
//                   width: "190px",
//                   height: "190px",
//                   top: "2px",
//                   right: "3px",
//                   position: "relative",
//                 }}
//               ></div>
//             )}
//             {/* {formState.RtpRejected && <div className="fail-bg " style={{width: "190px", height: "190px", top: "2px", right: "3px",position: "relative"}}></div>} */}
//           </div>
//         </div>
//       </div>
//     </>
//   ); 
// }
