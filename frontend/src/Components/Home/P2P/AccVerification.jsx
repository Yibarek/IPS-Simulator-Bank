import React, { useState, useEffect } from "react";
import Select from "react-select";
import { flushSync } from "react-dom";
import { selectStyles } from "../../../selectStyles";
import { getUserErrorMessage } from "../../../errorMessage";
import "../../../assets/css/InputForm.css";
import api from "../../../api";
import bic from "../../../bic";
import socket from "../../../Socket.js";

// -- P2P verification Page --
export function open_P2P_Verification_Popup() {
  document.getElementById("checkout-container").style.display = "block";
}

export function close_P2P_Verification_Popup() {
  document.getElementById("checkout-container").style.display = "none";
}

export function resetVerificationInputs() {
  document.getElementById("debitorAccount").value = "";
  document.getElementById("creditorBank").value = "";
  document.getElementById("creditorAccount").value = "";
}

export default function AccVerification({ formState, setFormState, resetStates }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [Id, setId] = useState(null);
  // const [display, setDisplay] = useState(true);
  const [debitorName, setDebitorName] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const updateField = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const bankOptions = [
    { value: "ABAWETAA", label: "Abay" },
    { value: "ABAWETAA", label: "Abay-Wallet" },
    { value: "ABSCETAA", label: "Addis-Int" },
    { value: "AMHRETAA", label: "Amhara-Bank" },
    { value: "AWINETAA", label: "Awash-Bank" },
    { value: "ABYSETAA", label: "BOA" },
    { value: "BUNAETAA", label: "Bunna-Bank" },
    { value: "CBETETAA", label: "CBE" },
    { value: "CBEBETAA", label: "CBE-BIRR" },
    { value: "CBORETAA", label: "CBO" },
    { value: "DASHETAA", label: "Dashen-Bank" },
    { value: "DIREETAA", label: "Dire-MFI" },
    { value: "ENATETAA", label: "Enat-Bank" },
    { value: "ETSETAA", label: "ETS-Bank" },
    { value: "GOBTETAA", label: "Goh-Betoch-Bank" },
    { value: "KAFIETAA", label: "KAAFI-MFI" },
    { value: "LIBSETAA", label: "Lion-Bank" },
    { value: "MPSAETAA", label: "M-Pesa" },
    { value: "NIBIETAA", label: "NIB_Int._Bank" },
    { value: "RMSIETAA", label: "Rammis-Bank" },
    { value: "RMFIETA2", label: "Rays-MFI" },
    { value: "SAHLETAA", label: "Sahal-MFI" },
    { value: "SSHCETAA", label: "Siket-Bank" },
    { value: "SINQETAA", label: "Siinqee-Bank" },
    { value: "TSDYETAA", label: "Tsedey-Bank" },
    { value: "TSCPETAA", label: "Tsehay-Bank" },
    { value: "WEGAETAA", label: "Wegagen-Bank" },
    { value: "EBIRETAA", label: "Wegagen_E-Birr" },
    { value: "YITBETAA", label: "YTS-Bank" },
    { value: "ZAMZETAA", label: "ZamZam-Bank" },
    { value: "ZEMEETAA", label: "Zemen-Bank" }
  ];

  const steps = ["Account", "Amount", "Review"];

  const progress = (currentStep / (steps.length - 1)) * 100;

  const nextStepFinal = () => {
    if (currentStep === 1 && !formState.amount) {
      triggerNotification();
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  let TxId = ''
  // Completion-notification (pacs.002)
  useEffect(() => {
    socket.on("completion-notification", (data) => {
      console.log("Received from backend:", data.TxId);
      console.log("Received from backend:", data.txStatus);
      console.log("Received from frontend:", formState.TxId);
      // close_GenerateQR_Popup;
      TxId = data.TxId;

      if (data.txStatus === "ACSC") {
        console.log("Paid");
        // updateField("txSuccess", true);
        // updateField("txFail", false);
        document.getElementById("debitorBank").value = data.debitorBank;
        document.getElementById("debitorName").value = data.debitorName;
        document.getElementById("debitorAccount").value = data.debitorAccount;
        console.log("txSuccess : " + formState.txSuccess);
        console.log("txFail : " + formState.txFail);
      } else {
        console.log("Rejected");
        // updateField("txFail", true);
        // updateField("txSuccess", false);
        console.log("txSuccess : " + formState.txSuccess);
        console.log("txFail : " + formState.txFail);
      }
    });

    return () => socket.off("completion-notification");
  }, []);

  // -- Verification Request to backend  --
  const sendVerificationRequest1 = async (e) => {
    // const nextStepFinal = () => {
    if (
      !formState.creditorBank ||
      !formState.creditorAccount ||
      !formState.debitorAccount
    ) {
      triggerNotification();
      return;
    }
    e.preventDefault();
    updateField("loading", true);

    try {
      const res = await api.post("/accountVerification", {
        creditorBank: formState.creditorBank,
        creditorAccount: formState.creditorAccount,
      });
      updateField("creditorName", res.data.creditorName);
      updateField("errorcode", res.data.errorcode);
      setId(res.data.Id);

      if (res.data.creditorName) {
        // close_P2P_Verification_Popup();
        // open_P2P_Amount_Popup();
        console.log(res.data.creditorName);
      } else {
        // close_P2P_Verification_Popup();
        // open_P2P_Amount_Popup();
        console.log(res.data.creditorName);
        console.log(res.data.errorcode);
        if (res.data.errorcode === "BLCK") {
          // flushSync(() => {
            updateField("errorcode", "Account is Blocked.");
          // });
        } else if (res.data.errorcode === "UNFN") {
          // flushSync(() => {
            updateField("errorcode", "Account Not Found.");
          // });
        }
      }

      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      updateField("error", null);
    } catch (err) {
      const message = getUserErrorMessage(err);
      // alert(message); // show to user
      updateField("error", message);
      triggerErrorNotification()
      console.error(message);
      updateField("result", null);
    } finally {
      updateField("loading", false);
    }
  };

  // -- PushPayment Request to backend  --
  const sendPushPaymentRequest = async (e) => {
    e.preventDefault();
    setFormState((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      const res = await api.post("http://localhost:5000/pushpayment", {
        amount: formState.amount,
        debitorAccount: formState.debitorAccount,
        creditorBank: formState.creditorBank,
        creditorAccount: formState.creditorAccount,
        creditorName: formState.creditorName,
      });
      const status = res.data.txStatus;
      const TxId = res.data.TxId;

      flushSync(() => {
        setFormState((prev) => ({
          ...prev,
          txStatus: status,
          txID: TxId,
        }));
      });

      // useEffect(() => {
      //   console.log("TxStatus: " + formState.txStatus);
      // }, [formState.txStatus]);

      console.log("TxStatus: " + formState.txStatus);
      console.log("TxId: " + formState.txID);

      if (res.data.txStatus == "ACSC") {
        updateField("txSuccess", true);
        updateField("txFail", false);
        console.log("TxSuccess: " + formState.txSuccess);
      } else if (
        res.data.txStatus == "RJCT" ||
        res.data.txStatus == "" ||
        res.data.txStatus == null
      ) {
        updateField("txFail", true);
        updateField("txSuccess", false);
        console.log("TxFail: " + formState.txFail);
        console.log("Status: " + status + "\n" + "TxId: " + TxId);
      }

      updateField("error", null);
    } catch (err) {
      const message = getUserErrorMessage(err);
      // alert(message); // show to user

      updateField("error", message);
      triggerErrorNotification()
      console.error(message);

      updateField("result", null);
    } finally {
      updateField("loading", false);
    }
  };

  // };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const triggerNotification = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const triggerErrorNotification = () => {
    setShowErrorNotification(true);
    setTimeout(() => setShowErrorNotification(false), 6000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerNotification();
    sendPushPaymentRequest();
    setTimeout(() => window.location.reload(), 2000);
  };

  // const lastFour = formState.cardNumber.slice(-4);
  const [data, setData] = useState();
  
  const queryDebitorName = async () => {
    // const input = document.getElementById("debitorAccount").value; 
    const inputLength = String(formState.debitorAccount).length;

    if(inputLength > 5){
      try {
        const result = await api.post("/queryDebitor", {
          debitorAccount: formState.debitorAccount,
        });
        
        // const result = await queryDebitorName();
        if (result.data == null || result.data == "") {
          setData("Not Found")
          console.log(result.data);
          return
        }
        console.log(result.data);
        setData(result.data);

      } catch (err) {
        console.error(err);
        throw err; 
      }
    }
  };

  return (
    <>
      {formState.displayVerification && (
        <div className="checkout-container">
          <button
            className="btn close-btn"
            onClick={(e) => {
              // close_P2P_Verification_Popup();
              // resetStates()
              if (currentStep === 2) {
                prevStep()
                prevStep()
              }
              else if (currentStep === 1) {
                prevStep()
              }

              flushSync(() => {
                updateField("home", true);
                updateField("displayVerification", false);
                updateField("debitorAccount", null);
                updateField("creditorAccount", null);
                updateField("creditorBank", null);
                updateField("amount", null);
                updateField("txSuccess", false);
                updateField("txFail", false);
                updateField("errorcode", null);
                updateField("txStatus", null);
                setData(null);

              });
              
            }}
            style={{ cursor: "pointer", marginRight: "15px", marginTop: "5px"}}
          >
            {" "}
            X{" "}
          </button>
          <div className="form-panel">
            <h1 className="h3 fw-bold mb-4" style={{ color: "green" }}>
              Transfer to Other Bank
            </h1>

            {/* Progress bar */}
            <div className="step-progress-bar">
              <div
                className="progress-indicator"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Step headers */}
            <div className="step-header">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className={`step-item ${
                    index === currentStep
                      ? "active"
                      : index < currentStep
                        ? "completed"
                        : ""
                  }`}
                >
                  <div className="step-number">{index + 1}</div>
                  <div className="step-title d-none d-md-block">{step}</div>
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* STEP 1 */}
              {currentStep === 0 && (
                <div className="form-step active">
                  <h2 className="h5 fw-bold mb-4">Account Information</h2>
                  <div className="row g-6">
                    <div className="col-md-6">
                      <label
                        htmlFor="debitorBank"
                        style={{ fontWeight: "bold", fontSize: "14px" }}
                        className="form-label"
                      >
                        Debitor Info <i style={{color: "red"}}> *</i>
                      </label>
                      <input
                        className="form-control col-md-6"
                        name="debitorAccount"
                        placeholder="Debitor Account"
                        value={formState.debitorAccount}
                        onChange={(e) => {
                          updateField("debitorAccount", e.target.value)
                        }}>
                      </input>
                      
                  </div>
                  
                  <div className="col-md-6">
                    <table className="row g-6">
                      <tbody>
                        <tr style={{width: "100%"}}>
                          <td style={{width: "30%"}}>
                            <span className="d-flex align-items-start justify-content-center rounded-circle" 
                                style={{position:"relative", marginTop: "33px", left: "-58px", width: "30px", height: "30px", 
                                        color: "White", background: "green", fontSize: "19px"}}
                                title="Verify"
                                 onClick={queryDebitorName}>
                              <i class="bi bi-check"></i>
                            </span>
                            
                            </td>
                            <td style={{minWidth: "200px"}} className= {"form-label col-md-6"}>
                              <label
                                  htmlFor="debitorBank"
                                  style={{textAlign:"left", fontWeight: "bold", fontSize: "14px", color: "orange" ,marginTop:"30px" }}
                                >
                              {data}
                            </label>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  </div>

                  <div className="row g-6">
                    <div className="col-md-6">
                      <label
                        htmlFor="creditorBank"
                        style={{ fontWeight: "bold", fontSize: "14px", marginTop: "25px"  }}
                        className="form-label"
                      >
                        Creditor Bank <i style={{color: "red"}}> *</i>
                      </label>
                      <Select
                        className=""
                        id="creditorBank"
                        options={bankOptions}
                        value={bankOptions.find(
                          (option) => option.value === formState.creditorBank,
                        )}
                        onChange={(selectedDebtor) =>
                          updateField("creditorBank", selectedDebtor.value)
                        }
                        styles={selectStyles}
                      />
                    </div>

                    <div className="col-md-6">
                      <label
                        htmlFor="creditorBank"
                        style={{ fontWeight: "bold", fontSize: "14px", marginTop: "25px"  }}
                        className="form-label"
                      >
                        Creditor Account <i style={{color: "red"}}> *</i>
                      </label>
                      <input
                        id="creditorAccount"
                        className="form-control"
                        name="Creditor Account"
                        placeholder="Creditor Account"
                        value={formState.creditorAccount}
                        onChange={(e) =>
                          updateField("creditorAccount", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={sendVerificationRequest1}
                      disabled={formState.loading}
                    >
                      {formState.loading ? "Requesting..." : "Next"}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 1 && (
                <div className="form-step active ">
                  <h2 className="h5 fw-bold mb-4">Payment Amount</h2>

                  <div style={{}}>
                    <div className="row g-3">
                      <table style={{ width: "60%" }}>
                        <tbody>
                          <tr>
                            <td
                              style={{ minWidth: "120px", textAlign: "right" }}
                              className="col-6"
                            >
                              Creditor Bank:
                            </td>
                            <td
                              style={{ minWidth: "120px", textAlign: "left" }}
                              className="col-6"
                            >
                              {formState.creditorBank}
                            </td>
                          </tr>
                          <tr>
                            <td
                              style={{ minWidth: "120px", textAlign: "right" }}
                              className="col-6"
                            >
                              Creditor Account:
                            </td>
                            <td
                              style={{ minWidth: "120px", textAlign: "left" }}
                              className="col-6"
                            >
                              {formState.creditorAccount}

                              {formState.creditorName && (
                                // <label
                                //   className="bi bi-check-circle "
                                //   style={{ color: "green", marginTop: "-250px", fontSize: "20px" }}
                                // >
                                <i
                                  className="bi bi-check-circle "
                                  style={{ fontSize: "10px", color: "green" }}
                                >
                                  {" "}
                                  Account verified
                                </i>
                              )}
                            </td>
                          </tr>
                          {formState.creditorName && (
                            <tr>
                              <td
                                style={{
                                  minWidth: "120px",
                                  textAlign: "right",
                                }}
                                className="col-6"
                              >
                                Creditor Name:
                              </td>
                              <td
                                style={{
                                  minWidth: "120px",
                                  textAlign: "left",
                                  fontWeight: "bold",
                                  color: "green",
                                }}
                                className="col-6"
                              >
                                {formState.creditorName}
                              </td>
                            </tr>
                          )}
                          {!formState.creditorName && (
                            <tr>
                              <td
                                style={{
                                  minWidth: "120px",
                                  textAlign: "right",
                                }}
                                className="col-6"
                              >
                                Reason:
                              </td>
                              <td
                                style={{ minWidth: "120px", textAlign: "left" , color: "orange"}}
                                className="col-6"
                              >
                                {formState.errorcode}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {formState.creditorName && (
                    <div className="row g-2">
                      <label
                        htmlFor="amount"
                        style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "-5px", marginTop: "25px"  }}
                        className="form-label"
                      >
                        Amount <i style={{color: "red"}}> *</i>
                      </label>
                      <input
                        className="form-control mb-4"
                        name="amount"
                        placeholder="Amount"
                        value={formState.amount}
                        onChange={(e) => updateField("amount", e.target.value)}
                      />
                    </div>
                  )}

                  <div className="d-flex justify-content-between mt-2">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={prevStep}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={nextStepFinal}
                      disabled={!formState.creditorName}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 2 && (
                <div className="form-step active">
                  {/* <h2 className="h5 fw-bold mb-4">Review D</h2> */}
                  <div className="row g-3">
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
                                  style={{
                                    minWidth: "120px",
                                    textAlign: "right",
                                  }}
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

                            {/* <br /> */}
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

                              <th
                                className="rtpreport"
                                colSpan={2}
                                style={{ textAlign: "center", margin: "100px" }}
                              >
                                Creditor Info
                              </th>
                            </tr>

                            <tr>
                              <th
                                className=""
                                style={{
                                  minWidth: "120px",
                                  textAlign: "right",
                                }}
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
                                {bic}
                              </td>

                              <th
                                className=""
                                style={{
                                  minWidth: "120px",
                                  textAlign: "right",
                                }}
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
                                style={{
                                  minWidth: "120px",
                                  textAlign: "right",
                                }}
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
                                style={{
                                  minWidth: "120px",
                                  textAlign: "right",
                                }}
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
                                style={{
                                  minWidth: "120px",
                                  textAlign: "right",
                                }}
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
                                {data}
                              </td>

                              <th
                                className=""
                                style={{
                                  minWidth: "120px",
                                  textAlign: "right",
                                }}
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
                                style={{
                                  textAlign: "left",
                                  paddingLeft: "25px",
                                }}
                              >
                                {formState.amount}
                              </td>
                            </tr>

                            <tr>
                              <th
                                className=""
                                style={{
                                  minWidth: "120px",
                                  textAlign: "right",
                                }}
                              >
                                Currency :
                              </th>
                              <td
                                className="fs-6"
                                style={{
                                  textAlign: "left",
                                  paddingLeft: "10px",
                                }}
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
                                    color: "orange",
                                    marginRight: "10px",
                                    fontSize: "20px",
                                  }}
                                >
                                  {" "}
                                  Pending...
                                </td>
                              </tr>
                            )}

                            {formState.txSuccess && !formState.txFail && formState.txID && (
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

                            {formState.txFail && !formState.txSuccess && formState.txID && (
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
                        <h4 className="danger">
                          Checkout Failed! Unable to procceed.
                        </h4>
                      )}

                      <hr />
                      {/* Submit Button */}
                      <div className="d-flex justify-content-center pt-3">
                        {formState.creditorName && !formState.txID && (
                          <div className="d-flex justify-content-center pt-4">
                            <button
                              type="button"
                              className="btn btn-primary w-100"
                              style={{
                                maxWidth: "200px",
                                fontWeight: "bold",
                                fontSize: "18px",
                              }}
                              onClick={sendPushPaymentRequest}
                              disabled={formState.loading}
                            >
                              {formState.loading ? "Requesting..." : "Complete"}
                            </button>
                          </div>
                        )}
                        {!formState.creditorName && (
                          <button
                            type="button"
                            className="btn btn-primary w-100 fw-bold fs-5"
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
                      {formState.txSuccess && !formState.txFail && formState.txID && (
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
                      {formState.txFail && !formState.txSuccess && formState.txID && (
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
              )}
            </form>
          </div>

          {/* Notification */}
          <div
            className={`notification-message ${showNotification ? "show" : ""}`}
          >
            {currentStep === 0
              ? "Please fill out all required information."
              : "Verification Completed!"}
          </div>

          <div
            className={`notification-message ${showErrorNotification ? "show" : ""}`}
          >
            {currentStep === 0 && formState.error}
          </div>

          {/* <!-- Order Summary Panel (Hidden on small screens) --> */}
          <div className="summary-panel d-none d-md-block" style={{maxWidth: "360px"}}>
            {/* <h5 className="fw-bold mb-4">Summary</h5> */}
            {formState.txSuccess && !formState.txFail && formState.txID && (
              <div id="summary-content">
                  <h3> Payment Completed </h3>
                  <br />
                  <h4> Completion notification received! </h4>
                  <div
                      className="success-bg" 
                      style={{
                        width: "190px",
                        height: "190px",
                        top: "200px",
                        left: "60px",
                        position: "relative",
                      }}
                    ></div>
              </div>
            )}
            {formState.txFail && !formState.txSuccess && formState.txID && (
              <div id="summary-content">
                  <h2> Payment Rejected </h2>
                  <br />
                  {(currentStep === 1) && (<h4> Request Rejected </h4>)}
                  {(currentStep === 1) && (<h4 style={{color: "orange"}}> {formState.errorcode} </h4>)}
                  <div
                      className="fail-bg " 
                      style={{
                        width: "190px",
                        height: "190px",
                        top: "200px",
                        left: "60px",
                        position: "relative",
                      }}
                    ></div>
              </div>
            )}
            {!formState.txFail && !formState.txSuccess && (
              <div id="summary-content">
                  <h2> Payment in process </h2>
                  <br />
                  {(currentStep === 0) && (<h4> Please enter the account information </h4>)}
                  {(currentStep === 1) && (formState.errorcode === "SUCC") && ( <> <h4 style={{color: "orange"}}> Creditor Account verified Successfully! <br/> <br/>  <h5 style={{color: "green"}}> {formState.creditorName} <br/>  - {formState.creditorAccount} - </h5> <h6>{Id}</h6> </h4> </>)}
                  {(currentStep === 1) && (!formState.creditorName) && (<h4 style={{color: "orange"}}> Creditor Account verification Failed! <br/> <br/>  <h5 style={{color: "red"}}> - {formState.creditorAccount} - </h5> <h6>{Id}</h6></h4>)}
                  {(currentStep === 2) && (<h4 style={{color: "orange"}}> Please check and confirm Payment. </h4>)}
                  <div
                      className="loading-bg " 
                      style={{
                        width: "190px",
                        height: "190px",
                        top: "200px",
                        left: "60px",
                        position: "relative",
                      }}
                    ></div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
