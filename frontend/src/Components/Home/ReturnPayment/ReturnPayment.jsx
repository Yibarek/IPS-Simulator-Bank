import React, { useState, useEffect } from "react";
// import Services from "./Components/Home/P2P/Services";
import { flushSync } from "react-dom";
import { getUserErrorMessage } from "../../../errorMessage";
import api from "../../../api";
import SuccessPopup from "./popupMessage";
import FailedPopup from "./popupMessageFailed";

// -- Return Payment POPUP  --
export function open_ReturnPayment_Popup() {
  document.getElementById("return-payment-popup").style.display = "block";
}

export function close_ReturnPayment_Popup() {
  document.getElementById("return-payment-popup").style.display = "none";
}

function ReturnPayment({ formState, setFormState }) {
  const updateField = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const [showPopup, setShowPopup] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);

  const triggerNotification = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const triggerErrorNotification = () => {
    setShowErrorNotification(true);
    setTimeout(() => setShowErrorNotification(false), 6000);
  };

  // -- Return Payment Request to backend  --
  const sendReturnPaymentRequest = async (e) => {
      e.preventDefault();

      if (!formState.txID) {
      triggerNotification();
      return;
    }
    updateField("loading", true);

    console.log("TxId: " + formState.txID);

    try {
      const res = await api.post("http://localhost:5000/returnPayment", {
        Id: formState.txID,
      });

      const txStatus = res.data.txStatus;
      const txReason = res.data.AddtlInf;
      const RtrId = res.data.RtrId;
      
      flushSync(() => {
        updateField("txStatus", txStatus);
        updateField("txReason", txReason);
        updateField("RtrId", RtrId);
      });

      // useEffect(() => {
      //   console.log("TxStatus: " + formState.txStatus);
      // }, [formState.txStatus]);

      console.log("TxStatus: " + txStatus + "\n Reason: " + txReason);

      if (res.data.txStatus == "ACSC") {
        setShowPopup(true);
      } else {
        setShowPopup(true);
        updateField("txID", null)
        document.getElementById("txIDReturn").value = "";
        console.log("txStatus : " + res.data.txStatus);
        console.log("txReason : " + res.data.txReason);
      }

      updateField("error", null);
    } catch (err) {
      const message = getUserErrorMessage(err);
      // alert(message); // show to user
      updateField("error", message);
      triggerErrorNotification();
      console.error(message);
      updateField("result", null);
    } finally {
      updateField("loading", false);
    }
  };

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);

        console.log("Popup closed after 10 seconds");
        // open_Customer_Table();
        // navigate("/customers");
        // resetForm();
        // fetchData();
      }, 20000);

      // cleanup (important!)
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  return (
    <>
      {formState.displayReturn && (
      <div
        id="return-payment-popup"
        className="checkout-container"
        // style={{ display: "none" }}
      >
        {/* <div className=""> */}
        {/* <div className="card p-4 shadow-sm"> */}
        <button
          className="btn close-btn"
          onClick={(e) => {
            flushSync(() => {
              updateField("home", true);
              updateField("displayReturn", false);
            });
            close_ReturnPayment_Popup();
          }}
          style={{ cursor: "pointer", position: "fixed", marginRight: "20px", marginTop: "10px" }}
        >
          {" "}
          X{" "}
        </button>
        <div className="form-panel">
          <h3
            className="mb-4 popup-title "
            style={{
              color: "green",
              fontWeight: "600",
              fontSize: "30px",
              // maxWidth: "90%",
              maxHeight: "80px",
               
            }} 
          >
            Return Payment
          </h3>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <form>
                  <div className="input-group m-0">
                    <span style={{ width: "130px", marginTop: "10px" }}>
                      Original TxID
                    </span>
                    <input
                      type="text"
                      id="txIDReturn"
                      name="txIDReturn"
                      width="100%"
                      className="form-control"
                      placeholder="Enter Orgnl TxId ..."
                      value={formState.txID}
                      onChange={(e) => updateField("txID", e.target.value)}
                    ></input>
                    <button
                      className="btn btn-primary d-flex align-items-center justify-content-center"
                      type="submit"
                      style={{ height: "38px", maxWidth: "30px" }}
                      onClick={sendReturnPaymentRequest}
                      disabled={formState.loading}
                    >
                      {formState.loading ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        "Return"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* Notification */}
        <div
          className={`notification-message ${showNotification ? "show" : ""}`}
        >
            Please fill out Original Transaction Id.
        </div>

        <div
          className={`notification-message ${showErrorNotification ? "show" : ""}`}
        >
          {formState.error}
        </div>
        {/* </div> */}
        {formState.txStatus == "ACSC" && <SuccessPopup
          show={showPopup}
          orgnlTxId={formState.txID}
          RtrId={formState.RtrId}
          message="Payment Returned successfully!"
          onClose={() => setShowPopup(false)}
        />}

        {formState.txStatus == "RJCT" && <FailedPopup
          show={showPopup}
          orgnlTxId={formState.txID}
          RtrId={formState.RtrId}
          message="Payment Returned Failed!"
          detail={formState.txReason}
          onClose={() => setShowPopup(false)}
        />}

      </div>)}
    </>
  );
}

export default ReturnPayment;
