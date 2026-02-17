import React, { useEffect } from "react";
import { flushSync } from "react-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // backend URL

import { open_P2P_Verification_Popup } from "./AccVerification";
import { resetAmountInputs } from "./Amount";

// -- P2P Checkout POPUP  --
export function open_P2P_Checkout_Popup() {
  document.getElementById("p2p-checkout-popup").style.display = "block";
}

export function close_P2P_Checkout_Popup() {
  document.getElementById("p2p-checkout-popup").style.display = "none";
}

function Checkout({
  formState,
  setFormState,
  sendQueryStatusRequest,
  resetStates,
}) {
  const updateField = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    socket.on("completion-notification", (data) => {
      console.log("Received from backend:", data.TxId);
      console.log("Received from backend:", data.txStatus);
      console.log("Received from frontend:", formState.TxId);
      close_GenerateQR_Popup;

      if (data.UETR === TxId && data.txStatus === "ACSC") {
        console.log("Paid");
        updateField("txSuccess", true);
        updateField("txFail", false);
        console.log("txSuccess : " + formState.txSuccess);
        console.log("txFail : " + formState.txFail);
      } else {
        console.log("Rejected");
        updateField("txFail", true);
        updateField("txSuccess", false);
        console.log("txSuccess : " + formState.txSuccess);
        console.log("txFail : " + formState.txFail);
      }
    });

    return () => socket.off("completion-notification");
  }, []);

  return (
    <>
      {/* ---------  P2P Checkout POPUP Content ---------- */}
      <div className="checkout-container">
        <div
          id="p2p-checkout-popup"
          className="form-panel"
          style={{ display: "none", marginTop: "10px" }}>
          <div className="align-self-center " style={{ width: "80%" }}>
            <label htmlFor="txID" className="form-label fw-bold">
              <span style={{ width: "130px", marginTop: "10px" }}>
                Original TxID
              </span>
              <input
                type="text"
                id="txID"
                width="100%"
                className="form-control-input"
                placeholder="Enter Account Number"
                // value={formState.txID}
                onChange={(e) => updateField("txID", e.target.value)}
              />
              <button
                type="button"
                className="btn btn-success w-100"
                style={{
                  fontWeight: "bold",
                  maxWidth: "180px",
                  marginLeft: "20px",
                  height: "50%",
                }}
                onClick={sendQueryStatusRequest}
                disabled={formState.loading}
              >
                {formState.loading ? "Requesting..." : "Send Request"}
              </button>
            </label>
          </div>
          {/* <div className="card p-4 shadow-sm"> */}
          <button
            className="btn close-btn"
            onClick={() => {
              close_P2P_Checkout_Popup();
              flushSync(() => {
                updateField("home", true);
              });
              resetStates();
            }}
            style={{ margin: "5px", marginRight: "85px", cursor: "pointer" }}
          >
            {" "}
            Back{" "}
          </button>

          <button
            className="btn close-btn"
            onClick={() => {
              close_P2P_Checkout_Popup();
              flushSync(() => {
                updateField("home", true);
              });
              resetStates();
            }}
            style={{ margin: "5px", cursor: "pointer", marginRight: "35px" }}
          >
            {" "}
            X{" "}
          </button>

          {/* <h3
          className="mb-4 popup-title "
          style={{
            color: "green",
            fontWeight: "600",
            fontSize: "30px",
            maxWidth: "100%",
            maxHeight: "60px",
            marginBottom: "-30px",
            paddingBottom: "40px",
                }}
            >
            Transaction Status
            </h3> */}
          <div className="report-border" style={{ minWidth: "670px" }}>
            {!formState.txID && (
              <h3
                className="mb-2 popup-title "
                style={{
                  color: "green",
                  fontWeight: "600",
                  fontSize: "30px",
                  maxWidth: "100%",
                  maxHeight: "80px",
                  paddingTop: "20px",
                }}
              >
                (-- Checkout --)
              </h3>
            )}

            {formState.txID && formState.txSuccess && (
              <h3
                className="mb-2 popup-title "
                style={{
                  color: "green",
                  fontWeight: "600",
                  fontSize: "30px",
                  maxWidth: "100%",
                  maxHeight: "80px",
                  paddingTop: "20px",
                }}
              >
                Transaction Status Report
              </h3>
            )}

            {formState.txID && formState.txFail && (
              <h3
                className="mb-2 popup-title "
                style={{
                  color: "orange",
                  fontWeight: "600",
                  fontSize: "30px",
                  maxWidth: "100%",
                  maxHeight: "80px",
                  paddingTop: "0px",
                }}
              >
                Transaction Status Report
              </h3>
            )}
            <hr style={{ marginLeft: "3%", marginRight: "3%" }} />
            <div
              className="p2p-content-checkout "
              style={{ minWidth: "670px", width: "100%" }}
            >
              {formState.creditorName && (
                <table className=" mb-2 " style={{ width: "100%" }}>
                  <tbody className="">
                    <tr>
                      <th
                        className="fw-bold fs-6 rtpreport"
                        colSpan={2}
                        style={{ textAlign: "center" }}
                      >
                        Transaction Info
                      </th>
                    </tr>

                    {formState.txID && (
                      <tr>
                        <th
                          className=""
                          style={{ minWidth: "120px", textAlign: "right" }}
                        >
                          TXN ID :{" "}
                        </th>
                        <td
                          className=""
                          colSpan={2}
                          style={{
                            minWidth: "180px",
                            maxWidth: "250px",
                            textAlign: "left",
                            paddingLeft: "5px",
                          }}
                        >
                          {formState.txID}
                        </td>
                      </tr>
                    )}

                    <tr>
                      <td style={{ height: "20px" }}></td>
                    </tr>
                    <tr
                      className=""
                      style={{ marginRight: "5%", paddingRight: "5%" }}
                    >
                      <th
                        className=" rtpreport"
                        colSpan={2}
                        style={{ textAlign: "center", margin: "100px" }}
                      >
                        Debitor Info
                      </th>
                      {/* <td className="fw-bold fs-6 " style={{textAlign: "left", paddingLeft: "20px"}}></td> */}

                      <th
                        className="rtpreport"
                        colSpan={2}
                        style={{ textAlign: "center", margin: "100px" }}
                      >
                        Creditor Info
                      </th>
                      {/* <td className="fw-bold fs-6" style={{textAlign: "left", paddingLeft: "20px"}}></td> */}
                    </tr>

                    <tr>
                      <th
                        className=""
                        style={{ minWidth: "120px", textAlign: "right" }}
                      >
                        Debitor Bank :{" "}
                      </th>
                      <td
                        className=""
                        style={{
                          minWidth: "180px",
                          maxWidth: "250px",
                          textAlign: "left",
                          marginLeft: "10px",
                        }}
                      >
                        {formState.debitorBank}
                      </td>

                      <th
                        className=""
                        style={{ minWidth: "120px", textAlign: "right" }}
                      >
                        Creditor Bank :{" "}
                      </th>
                      <td
                        className=""
                        style={{
                          minWidth: "180px",
                          maxWidth: "250px",
                          textAlign: "left",
                          marginLeft: "10px",
                        }}
                      >
                        {formState.creditorBank}
                      </td>
                    </tr>

                    <tr>
                      <th
                        className=""
                        style={{ minWidth: "120px", textAlign: "right" }}
                      >
                        Debitor Acc :{" "}
                      </th>
                      <td
                        className=""
                        style={{
                          minWidth: "180px",
                          maxWidth: "250px",
                          textAlign: "left",
                          marginLeft: "10px",
                        }}
                      >
                        {formState.debitorAccount}
                      </td>

                      <th
                        className=""
                        style={{ minWidth: "120px", textAlign: "right" }}
                      >
                        Creditor Acc :{" "}
                      </th>
                      <td
                        className=""
                        style={{
                          minWidth: "180px",
                          maxWidth: "250px",
                          textAlign: "left",
                          marginLeft: "10px",
                        }}
                      >
                        {formState.creditorAccount}
                      </td>
                    </tr>

                    <tr>
                      <th
                        className=""
                        style={{ minWidth: "120px", textAlign: "right" }}
                      >
                        Debitor Name :{" "}
                      </th>
                      <td
                        className=""
                        style={{
                          minWidth: "180px",
                          maxWidth: "250px",
                          textAlign: "left",
                          marginLeft: "10px",
                        }}
                      >
                        Yitbarek Wondatir
                      </td>

                      <th
                        className=""
                        style={{ minWidth: "120px", textAlign: "right" }}
                      >
                        Creditor Name :{" "}
                      </th>
                      <td
                        className=""
                        style={{
                          minWidth: "180px",
                          maxWidth: "250px",
                          textAlign: "left",
                          marginLeft: "10px",
                        }}
                      >
                        {formState.creditorName}
                      </td>
                    </tr>

                    {/* <br/> */}

                    {/* <tr>
                  <th className="fw-bold fs-6" style={{textAlign: "right"}}>Payer : </th>
                  <td className="fw-bold fs-6" style={{textAlign: "left", paddingLeft: "25px"}}>{formState.debitorAccount}</td>
                </tr>

                <tr>
                  <th className="fw-bold fs-6" style={{textAlign: "right"}}>Creditor Bank : </th>
                  <td className="fw-bold fs-6" style={{textAlign: "left", paddingLeft: "25px"}}>{formState.creditorBank}</td>
                </tr>

                <tr>
                  <th className="fw-bold fs-6" style={{textAlign: "right"}}>Creditor Account : </th>
                  <td className="fw-bold fs-6" style={{textAlign: "left", paddingLeft: "25px"}}>{formState.creditorAccount}</td>
                </tr>

                <tr>
                  <th className="fw-bold fs-6" style={{textAlign: "right"}}>Creditor Name : </th>
                  <td className="fw-bold fs-6" style={{textAlign: "left", paddingLeft: "25px"}}>{formState.creditorName}</td>
                </tr> */}

                    <tr>
                      <td style={{ height: "20px" }}></td>
                    </tr>
                    <tr>
                      <th
                        className="fw-bold fs-6 rtpreport"
                        colSpan={2}
                        style={{ textAlign: "center" }}
                      >
                        Payment
                      </th>
                    </tr>

                    <tr>
                      <th
                        className="fw-bold fs-6"
                        style={{ textAlign: "right" }}
                      >
                        Amount :{" "}
                      </th>
                      <td
                        className="fw-bold fs-6"
                        style={{ textAlign: "left", paddingLeft: "25px" }}
                      >
                        {formState.amount}
                      </td>
                    </tr>

                    <tr>
                      <th
                        className=""
                        style={{ minWidth: "120px", textAlign: "right" }}
                      >
                        Currency :
                      </th>
                      <td
                        className="fs-6"
                        style={{ textAlign: "left", paddingLeft: "10px" }}
                      >
                        ETB
                      </td>
                    </tr>

                    {!formState.txID && (
                      <tr>
                        <th
                          className="fw-bold fs-6"
                          style={{ textAlign: "right" }}
                        >
                          Status
                        </th>
                        <td
                          className="fw-bold fs-6 bi bi-check-circle "
                          style={{
                            color: "yellow",
                            marginRight: "10px",
                            fontSize: "20px",
                          }}
                        >
                          {" "}
                          Pending...
                        </td>
                      </tr>
                    )}

                    {formState.txSuccess && (
                      <tr>
                        <th
                          className="fw-bold fs-6"
                          style={{ textAlign: "right" }}
                        >
                          Status
                        </th>
                        <td
                          className="fw-bold fs-6 bi bi-check-circle "
                          style={{
                            color: "green",
                            marginLeft: "10px",
                            marginRight: "10px",
                            fontSize: "20px",
                          }}
                        >
                          {" "}
                          Success
                        </td>
                      </tr>
                    )}

                    {formState.txFail && (
                      <tr>
                        <th
                          className="fw-bold fs-6"
                          style={{ textAlign: "right" }}
                        >
                          Status
                        </th>
                        <td
                          className="fw-bold bi bi-x-circle-fill fs-6 "
                          style={{
                            color: "orange",
                            marginLeft: "10px",
                            marginRight: "10px",
                            fontSize: "20px",
                          }}
                        >
                          {" "}
                          Failed
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
              {!formState.creditorName && (
                <h4 className="danger">Checkout Failed! Unable to procceed.</h4>
              )}

              <hr />
              {/* Submit Button */}
              <div className="d-flex justify-content-center pt-3">
                {formState.creditorName && !formState.txID && (
                  <div className="d-flex justify-content-center pt-4">
                    <button
                      type="button"
                      className="btn btn-success w-100"
                      style={{
                        maxWidth: "200px",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                      // onClick={sendPushPaymentRequest}

                      disabled={formState.loading}
                    >
                      {formState.loading ? "Requesting..." : "Complete"}
                    </button>
                  </div>
                )}
                {!formState.creditorName && (
                  <button
                    type="button"
                    className="btn btn-danger w-100 fw-bold fs-5"
                    style={{ maxWidth: "220px" }}
                    onClick={() => {
                      close_P2P_Checkout_Popup();
                      open_P2P_Verification_Popup();
                      resetAmountInputs();
                    }}
                  >
                    Try Again
                  </button>
                )}
              </div>
              {formState.txSuccess && (
                <div
                  className="success-bg"
                  style={{
                    width: "190px",
                    height: "190px",
                    top: "10px",
                    right: "2px",
                    position: "relative",
                  }}
                ></div>
              )}
              {formState.txFail && (
                <div
                  className="fail-bg "
                  style={{
                    width: "190px",
                    height: "190px",
                    top: "2px",
                    right: "3px",
                    position: "relative",
                  }}
                ></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Checkout;
