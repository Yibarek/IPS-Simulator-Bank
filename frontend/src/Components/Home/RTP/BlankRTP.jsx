import React, { useState, useEffect } from "react";
import Services from "../Services.jsx";
import { flushSync } from "react-dom";
import Select from "react-select"
import { selectStyles } from "../../../selectStyles.js";
import { getUserErrorMessage } from "../../../errorMessage.jsx";
import api from "../../../api.js"
import socket from "../../../Socket.js";
import { GenerateQRCode } from "./GenerateQR.jsx";

// import { resetBlankRTPInputs } from "./BlankRTP1.jsx";
import GenerateQR from "./GenerateQR.jsx";
import { close_GenerateQR_Popup } from "./GenerateQR.jsx";

let GeneratedUETR = ''
let debitorBank = ''
let debitorAccount = ''
let debitorName = ''
let TxId = ''
let expired = new Date();
expired.setMinutes(expired.getHours() + 6000);
let RTPExpiredTime = expired.toISOString();

// -- P2P RTPReport POPUP  --
export function open_RTPReport_Popup() {
  document.getElementById("rtp-report-popup").style.display = "block";
}

export function close_RTPReport_Popup() {
  document.getElementById("rtp-report-popup").style.display = "none";
}

// -- Cancel RTP  POPUP  --
export function open_Cancel_BlankRTP_Popup() {
  document.getElementById("cancel-blankrtp-popup").style.display = "block";
}

export function close_Cancel_BlankRTP_Popup() {
  document.getElementById("cancel-blankrtp-popup").style.display = "none";
}

export function open_Blank_RTP_Popup() {
  document.getElementById("blankRTP-popup").style.display = "block";
  
}

export function close_Blank_RTP_Popup() {
  document.getElementById("blankRTP-popup").style.display = "none";
}

export function resetBlankRTPInputs() {
  // document.getElementById("creditorBank").value = "";
  // document.getElementById("creditorAccount").value = "";
  // document.getElementById("amount").value = "";
}


function BlankRTP({ formState, setFormState, resetStates }) {
  const [currentStep, setCurrentStep] = useState(0);

  const [displayQR, setQRDisplay] = useState(false);
  const [isExpired, setIsexpired] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);

  const updateField = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.log("Connection Error:", err.message);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  }, []);

  // payment-update (pain.014)
  useEffect(() => {
    socket.on("payment-update", (data) => {
      console.log("Received from backend:", data.UETR);
      console.log("Received from backend:", data.txStatus);
      console.log("Received from frontend:", formState.UETR);
      close_GenerateQR_Popup
      updateField("AddtlInf", data.AddtlInf)
      if ((GeneratedUETR === data.UETR) && (data.txStatus === "ACSP")) {
        setQRDisplay(false)
        console.log("Paid")
        updateField("RtpRecieved", false);
        console.log("RtpReceived:", formState.RtpReceived);
        updateField("RtpPaid", true);
        console.log("RtpPaid : " + formState.RtpPaid)
        updateField("RtpRejected", false);
        console.log("RtpRejected : " + formState.RtpRejected)
        updateField("RtpCancelled", false);
        console.log("RtpCancelled : " + formState.RtpCancelled)
      }
      else if ((GeneratedUETR === data.UETR) && (data.txStatus === "RJCT") || 
               (GeneratedUETR === data.UETR) && (data.txStatus === "") || 
               (GeneratedUETR === data.UETR) && (data.txStatus === null) ) {
        setQRDisplay(false)
        console.log("Rejected")
        updateField("RtpRecieved", false);
        console.log("RtpReceived:", formState.RtpReceived);
        updateField("RtpPaid", false);
        console.log("RtpPaid : " + formState.RtpPaid)
        updateField("RtpRejected", true);
        console.log("RtpRejected : " + formState.RtpRejected)
        updateField("RtpCancelled", false);
        console.log("RtpCancelled : " + formState.RtpCancelled)
      } else if (data.txStatus == "ACCR") {
        updateField("RtpCancelled", true)
      } else if (data.txStatus == "RJCR") {
        updateField("RtpCancelled", false)
      }
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      // setQRDisplay(true)
    });

    return () => socket.off("payment-update");
  }, []);


  // Completion-notification (pacs.002)
  useEffect(() => {
    socket.on("completion-notification", (data) => {
      console.log("completion-notification")
      console.log("Received from backend:", data.TxId);
      console.log("Received from backend:", data.txStatus);
      console.log("Received from frontend:", formState.TxId);
      close_GenerateQR_Popup
      

      if ((GeneratedUETR === data.UETR) && (data.txStatus === "ACSC")) {
        TxId = data.TxId;
        debitorBank = data.debitorBank;
        debitorAccount = data.debitorAccount;
        debitorName = data.debitorName;
        console.log("Paid")
        updateField("txSuccess", true);
        updateField("txFail", false);
        updateField("debitorBank", data.debitorBank);
        updateField("debitorAccount", data.debitorAccount);
        updateField("debitorName", data.debitorName);

        document.getElementById("debitorBank1").value = bank;
        // console.log("debitorBank : " + data.debitorBank)
        document.getElementById("debitorName1").value = name;
        document.getElementById("debitorAccount1").value = account;
        console.log("txSuccess : " + formState.txSuccess)
        console.log("txFail : " + formState.txFail)
      }
      else {
        TxId = data.TxId;
        debitorBank = data.debitorBank;
        debitorAccount = data.debitorAccount;
        debitorName = data.debitorName;
        console.log("Rejected")
        updateField("txFail", true);
        updateField("txSuccess", false);
        console.log("txSuccess : " + formState.txSuccess)
        console.log("txFail : " + formState.txFail)
      }
    });

    return () => socket.off("completion-notification");
  }, []);


  // -- RTP Cancel Request to backend  --
  const sendRTPCancelRequest = async (e, Reason, ReasonAddtlInf) => {
    e.preventDefault();

    updateField("loading", true);
    updateField("RtpPaid", false);
    updateField("RtpRejected", false);
    updateField("RtpReceived", false);
    updateField("RtpCancelled", false);
    updateField("Reason", Reason);
    updateField("ReasonAddtlInf", ReasonAddtlInf);
    
    console.log("UETR: " + formState.UETR)
    console.log("OrgnlInstrId: " + formState.OrgnlInstrId)
    console.log("OrgnlMsgId: " + formState.OrgnlMsgId)
    console.log("OrgnlPmtInfId: " + formState.OrgnlPmtInfId)

    try {
      const res = await api.post("http://localhost:5000/cancelRTP", {
        UETR: formState.UETR,
        Reason: Reason,
        ReasonAddtlInf: ReasonAddtlInf,
        OrgnlInstrId: formState.OrgnlInstrId,
        OrgnlMsgId: formState.OrgnlMsgId,
        OrgnlPmtInfId: formState.OrgnlPmtInfId,
        debitorBank: formState.debitorBank,
      }

      );

      const status = res.data.txStatus;
      const AddtlInf = res.data.AddtlInf;

      // flushSync(() => {
        updateField("txStatus", status);
        updateField("AddtlInf", AddtlInf);
      // });

      // useEffect(() => {
      //   console.log("TxStatus: " + formState.txStatus);
      // }, [formState.txStatus]);

      console.log(" TxStatus: " + status + "\n UETR: " + formState.UETR + "\n AddtlInf: " + AddtlInf);


      if (res.data.txStatus == "ACCR") {
        updateField("RtpCancelled", true)
        updateField("RtpRejected", false)
        updateField("RtpPaid", false)
        updateField("RtpRejected", false)
        updateField("RtpReceived", false)
        setQRDisplay(false)
      } else if (res.data.txStatus == "RJCR" || res.data.txStatus == "" || res.data.txStatus == null) {
        updateField("RtpCancelled", false)
        updateField("RtpRejected", false)
        updateField("RtpPaid", false)
        updateField("RtpReceived", false)
        setQRDisplay(false)
      }

      // close_Cancel_BlankRTP_Popup()
      // close_Blank_RTP_Popup()
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      close_GenerateQR_Popup
      // setQRDisplay(true)
      setFormState((prev) => ({
        ...prev,
        error: null,
      }));
    } catch (err) {
      const message = getUserErrorMessage(err);
      // alert(message); // show to user

      updateField("error", message);
      triggerErrorNotification()
      console.error(message);

      updateField("result", null)
    } finally {
      updateField("loading", false)
    }
  };


  const steps = ["Account", "Payment", "Complete"];

  const progress = (currentStep / (steps.length - 1)) * 100;


  const nextStepFinal = () => {
    if (
      currentStep === 0 &&
      (!formState.amount || !formState.creditorBank || !formState.creditorAccount)
    ) {
      triggerNotification();
      return;
    }
    // setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
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
    { value: "ENATETAA", label: "Enat-Bank" },
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
    setTimeout(() => window.location.reload(), 2000);
  };

  // -- BlankRTP Request to backend  --
  const sendBlankRTPRequest1 = async (e) => {
    e.preventDefault();

    if (
      !formState.creditorBank ||
      !formState.creditorAccount ||
      !formState.amount
    ) {
      triggerNotification();
      return;
    }

    updateField("loading", true)
    updateField("RtpCancelled", false)
    updateField("RtpPaid", false)
    updateField("RtpRejected", false)
    updateField("RtpReceived", false)
    updateField("normalrtp", false)
    updateField("blankrtp", true);

    console.log("Inputs from the User")
    console.log("\nAmount: " + formState.amount 
               +"\nCreditorBank: " + formState.creditorBank 
               +"\nCreditorAccount: " + formState.creditorAccount) 

    try {
      const res = await api.post("http://localhost:5000/blankRTP", {
        amount: formState.amount,
        creditorBank: formState.creditorBank,
        creditorAccount: formState.creditorAccount,
      }

      );

      const creditorAccount = formState.creditorAccount;
      const amount = formState.amount;
      const status = res.data.txStatus;
      const UETR = res.data.UETR;
      const AddtlInf = res.data.AddtlInf;
      const debitorName = res.data.debitorName;
      const OrgnlInstrId = res.data.OrgnlInstrId;
      const OrgnlPmtInfId = res.data.OrgnlPmtInfId;
      const OrgnlMsgId = res.data.OrgnlMsgId;
      const debitorBank = formState.debitorBank;
      const debitorAccount = formState.debitorAccount;
      const creditorName = formState.creditorName;
      RTPExpiredTime = res.data.RTPExpiredTime;

      console.log("All Generated ID")
      console.log("\nUETR: " + res.data.UETR 
              + "\nOrgnlInstrId: " + res.data.OrgnlInstrId 
              + "\nOrgnlMsgId: " + res.data.OrgnlMsgId 
              + "\nOrgnlPmtInfId: " + res.data.OrgnlPmtInfId )

      // flushSync(() => {
        updateField("txStatus", status);
        updateField("UETR", UETR);
        updateField("AddtlInf", AddtlInf);
        updateField("OrgnlInstrId", OrgnlInstrId);
        updateField("OrgnlPmtInfId", OrgnlPmtInfId);
        updateField("OrgnlMsgId", OrgnlMsgId);
        updateField("debitorAccount", debitorAccount);
        updateField("debitorBank", debitorBank);
        updateField("creditorName", creditorName);
        
      // });

      console.log("Response from IPS")
      console.log(" TxStatus: " + status + "\n UETR: " + UETR + "\n AddtlInf: " + AddtlInf + "\nRTPExpiredTime: " + RTPExpiredTime);


      if (res.data.txStatus == "RCVD") {
        updateField("RtpReceived", true);
        console.log("RTP Request Accepted")
        GenerateQRCode(UETR, amount, "230", creditorAccount, setFormState)
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        setQRDisplay(true);
        GeneratedUETR = res.data.UETR;
      } else if (res.data.txStatus == "RJCT" || res.data.txStatus == "" || res.data.txStatus == null) {
        updateField("RtpRejected", true);
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        console.log("RTP Request Rejected")
      }
      updateField("normalrtp", false);
      updateField("blankrtp", true);

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

  function useCountdown(targetTime) {
    const target = new Date(targetTime).getTime();
    const [timeLeft, setTimeLeft] = useState(target - Date.now());

    useEffect(() => {
      const interval = setInterval(() => {
        const diff = target - Date.now();
        setTimeLeft(diff > 0 ? diff : 0);
      }, 1000);

      return () => clearInterval(interval);
    }, [target]);

    return timeLeft;
  }

  
  const timeLeft = useCountdown(RTPExpiredTime);
  useEffect(() => {
    if (timeLeft === 0 && formState.blankrtp) {
      setIsexpired(true);
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
    else{
      setIsexpired(false);
    }
    
  });
  
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);


  return (
    <>

      <div
        id="cancel-blankrtp-popup"
        className="cancel-rtp-popup"
        style={{
          display: "none",
          height: "25%",
          width: "20%",
          minWidth: "250px",
          minHeight: "20%",
          
        }}
      >
        <button
          className="btn cancel-close-btn"
          onClick={close_Cancel_BlankRTP_Popup}
          style={{ marginRight: "-15px", marginTop: "5px" }}
        >
          {" "}
          X{" "}
        </button>
        <div
          className="rtp-popup-content"
          style={{
            paddingTop: "20px",
            paddingleft: "10px",
            paddingRight: "10px",
          }}
        >
          <div
            className="popup-content"
            style={{ height: "50px", width: "200px", background: "orange" }}
            onClick={(e) => {
                sendRTPCancelRequest(e, "WrongAmount", "Invalid amount");
                // setQRDisplay(false);
                close_Cancel_BlankRTP_Popup()
              }
            }
          >
            Wrong Amount
          </div>
          
        </div>
      </div>

      {formState.displayRTP && (
      <div className="checkout-container">

        <div
          id="blankRTP-popup"
          className="form-panel"
          style={{ display: "none", marginTop: "-60px", }}
        >
          {/* <div className=""> */}
          {/* <div className="card p-4 shadow-sm"> */}
          {/* Progress bar */}
          <button
            className="btn close-btn"
            // onClick={(e) => {
            //   // close_Blank_RTP_Popup();
            //   prevStep()
            //   prevStep()
            //   flushSync(() => {
            //     updateField("home", true);
            //   });
            //   resetStates();
            // }}
            onClick={() => {
              close_Blank_RTP_Popup();
              updateField("home", true);
              updateField("normalrtp", false);
              updateField("blankrtp", false);
              updateField("blankrtp", false);
              updateField("debitorAccount", null);
              updateField("creditorAccount", null);
              updateField("debitorBank", null);
              updateField("creditorBank", null);
              updateField("debitorName", null);
              updateField("creditorName", null);
              updateField("RtpPaid", false);
              updateField("RtpCancelled", false);
              updateField("RtpRejected", false);
              updateField("RtpReceived", false);
              updateField("amount", null);
              updateField("txID", null);
              TxId = "";
              updateField("displayRTP", false);
              setIsexpired(false)

              if (currentStep === 2) {
                prevStep()
                prevStep()
              }
              else if (currentStep === 1) {
                prevStep()
              }
              
              setQRDisplay(false)
              flushSync(() => {
                updateField("home", true);
              });
              resetStates();
            }}
            style={{ marginRight: "25px", cursor: "pointer" }}
          >
            {" "}
            X{" "}
          </button>
          <h3
            className="mb-4 popup-title"
            style={{
              color: "green",
              fontWeight: "600",
              fontSize: "30px",
              maxWidth: "100%",
              maxHeight: "60px",
              paddingBottom: "10px",
            }}
          >
            Blank RTP Request
          </h3>
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
                className={`step-item ${index === currentStep
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
              <div className="rtp-content ">

                {/* Creditor Bank */}
                <div className="row g-6">
                  <div className="col-md-6">
                    <label
                      htmlFor="creditorBank"
                      style={{ fontWeight: "bold", fontSize: "14px" }}
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
                      onChange={(selectedCreditor) =>
                        updateField("creditorBank", selectedCreditor.value)
                      }
                      styles={selectStyles}
                    />
                  </div>

                  <div className="col-md-6">
                    <label
                      htmlFor="creditorAccount"
                      style={{ fontWeight: "bold", fontSize: "14px" }}
                      className="form-label"
                    >
                      Creditor Account <i style={{color: "red"}}> *</i>
                    </label>
                    <input
                      id="creditorAccount"
                      className="form-control"
                      name="Creditor Account"
                      placeholder="Creditor Account"
                      value={formState.creditorAccount ?? ""}
                      onChange={(e) => updateField("creditorAccount", e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2">
                  <label
                    htmlFor="amount"
                    style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "-5px", marginTop: "25px"}}
                    className="form-label"
                  >
                    Amount <i style={{color: "red"}}> *</i>
                  </label>
                  <input
                    className="form-control mb-4"
                    name="amount"
                    placeholder="Amount"
                    value={formState.amount ?? ""}
                    onChange={(e) => updateField("amount", e.target.value)}
                  />
                </div>

                {/* Submit Button */}
                <div className="d-flex justify-content-center pt-4">
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    style={{
                      maxWidth: "200px",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                    disabled={formState.loading}
                    onClick={sendBlankRTPRequest1}
                  >
                    {formState.loading ? "Requesting..." : "Next"}
                  </button>
                </div>
                {/* </div> */}
                {/* </div> */}
              </div>)}

            {/* STEP 2 */}
            {/* STEP 2 */}
            {(currentStep === 1 || currentStep === 2) && (
              <div className="form-step active ">
                <div className="p2p-content-checkout" style={{ marginTop: "-10px" }}>
                  <table>
                    <tbody className="m-2">
                      <tr>

                        {formState.UETR && (
                          <td style={{ width: "100%" }}>
                            <table
                              className=" mb-2"
                              style={{ width: "100%" }}
                            // style={{ width: "100%", marginRight: "5%" }}
                            >
                              <tbody
                                className=""
                                style={
                                  formState.normalrtp ||
                                    !formState.RtpCancelled ||
                                    !formState.RtpPaid ||
                                    !formState.RtpRejected
                                    ? { minWidth: "670px", width: "100%" }
                                    : { minWidth: "250px", width: "50%" }
                                }
                              >
                                <tr>
                                  <th
                                    className="fw-bold fs-6 rtpreport"
                                    colspan={2}
                                    style={{ textAlign: "center" }}
                                  >
                                    Transaction Info
                                  </th>
                                  <th
                                    className="fw-bold fs-6 rtpreport"
                                    colspan="2"
                                    style={{ textAlign: "center" }}
                                  >
                                    Payment
                                  </th>
                                </tr>

                                {formState.UETR && (
                                  <tr>
                                    <th
                                      className=""
                                      style={{
                                        minWidth: "120px",
                                        textAlign: "right",
                                      }}
                                    >
                                      UETR :{" "}
                                    </th>
                                    <td
                                      className=""
                                      colspan={1}
                                      style={{
                                        minWidth: "180px",
                                        maxWidth: "250px",
                                        textAlign: "left",
                                        // paddingLeft: "5px",
                                      }}
                                    >
                                      {/* {formState.UETR} */}
                                      {GeneratedUETR = formState.UETR}
                                    </td>

                                    <tr className="" style={{ width: "100%" }}>

                                    </tr>

                                    <tr>
                                      <th
                                        className=""
                                        style={{ minWidth: "120px", textAlign: "right" }}
                                      >
                                        Amount :
                                      </th>
                                      <td
                                        className="fs-6"
                                        style={{ textAlign: "left", paddingLeft: "10px" }}
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


                                  </tr>
                                )}

                                {TxId && (formState.RtpPaid || formState.RtpRejected) && (
                                  <tr>
                                    <th
                                      className=""
                                      style={{
                                        minWidth: "120px",
                                        textAlign: "right",
                                      }}
                                    >
                                      TxId :{" "}
                                    </th>
                                    <td
                                      className=""
                                      colspan={2}
                                      style={{
                                        minWidth: "180px",
                                        maxWidth: "250px",
                                        textAlign: "left",
                                        paddingLeft: "5px",
                                      }}
                                    >
                                      {TxId}
                                    </td>
                                  </tr>
                                )}

                                <br />
                                <tr
                                  className=""
                                  style={{ marginRight: "5%", paddingRight: "5%" }}
                                >
                                  {(formState.normalrtp || formState.RtpPaid || formState.RtpRejected) && (
                                    <th
                                      className=" rtpreport"
                                      colspan={2}
                                      style={{ textAlign: "center", margin: "100px" }}
                                    >
                                      Debitor Info
                                    </th>
                                  )}

                                  <th
                                    className="rtpreport"
                                    colspan={2}
                                    style={{ textAlign: "center", margin: "100px" }}
                                  >
                                    Creditor Info
                                  </th>
                                  {/* <td className="fw-bold fs-6" style={{textAlign: "left", paddingLeft: "20px"}}></td> */}
                                </tr>

                                <tr>
                                  {(formState.normalrtp || formState.RtpPaid || formState.RtpRejected) && (
                                    <>
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
                                        id="debitorBank1"
                                        style={{
                                          minWidth: "180px",
                                          textAlign: "left",
                                          paddingLeft: "10px",
                                        }}
                                      >
                                        {debitorBank}
                                      </td>
                                    </>
                                  )}
                                  <th
                                    className=""
                                    style={{ minWidth: "120px", textAlign: "right" }}
                                  >
                                    Creditor Bank :{" "}
                                  </th>
                                  <td
                                    className=""
                                    id="creditorBank"
                                    style={{
                                      minWidth: "180px",
                                      textAlign: "left",
                                      paddingLeft: "10px",
                                    }}
                                  >
                                    {formState.creditorBank}
                                  </td>
                                </tr>

                                <tr>
                                  {(formState.normalrtp || formState.RtpPaid || formState.RtpRejected) && (
                                    <>
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
                                        id="debitorAccount1"
                                        style={{
                                          minWidth: "180px",
                                          textAlign: "left",
                                          paddingLeft: "10px",
                                        }}
                                      >
                                        {debitorAccount}
                                      </td>
                                    </>
                                  )}
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
                                      textAlign: "left",
                                      paddingLeft: "10px",
                                    }}
                                  >
                                    {formState.creditorAccount}
                                  </td>
                                </tr>

                                <tr>
                                  {(formState.normalrtp || formState.RtpPaid || formState.RtpRejected) && (
                                    <>
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
                                        id="debitorName1"
                                        style={{
                                          minWidth: "180px",
                                          textAlign: "left",
                                          paddingLeft: "10px",
                                        }}
                                      >
                                        {debitorName}
                                      </td>
                                    </>
                                  )}
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
                                      textAlign: "left",
                                      paddingLeft: "10px",
                                    }}
                                  >
                                    Merchant Name
                                  </td>
                                </tr>

                                <br />

                                {!formState.RtpPaid && !formState.RtpRejected && !formState.RtpCancelled && formState.Rtpceived &&(
                                  <tr>
                                    <th
                                      className="fs-6"
                                      style={{ textAlign: "right" }}
                                    >
                                      Status :{" "}
                                    </th>
                                    <td
                                      className="fw-bold fs-6 bi bi-check-circle "
                                      colspan={3}
                                      style={{
                                        color: "orange",
                                        marginRight: "10px",
                                        fontSize: "20px",
                                        marginLeft: "30px",
                                        paddingLeft: "20px",
                                        textAlign: "left",
                                      }}
                                    >
                                      {" "}
                                      Request Received - Awaiting Payment ...
                                    </td>
                                  </tr>
                                )}

                                {formState.RtpRejected && !formState.RtpCancelled && !formState.RtpPaid && (
                                  <tr>
                                    <th
                                      className="fs-6"
                                      style={{ textAlign: "right" }}
                                    >
                                      Status :{" "}
                                    </th>
                                    <td
                                      className="fw-bold fs-6 bi bi-x-circle-fill"
                                      style={{
                                        paddingLeft: "10px",
                                        color: "orange",
                                        fontSize: "20px",
                                        textAlign: "left",
                                      }}
                                    >
                                      {" "}
                                      Request Rejected
                                    </td>
                                  </tr>
                                )}

                                {formState.RtpRejected && (
                                  <tr>
                                    <th
                                      className="fs-6"
                                      style={{ textAlign: "right" }}
                                    >
                                      Reason :{" "}
                                    </th>
                                    <td
                                      className=""
                                      colspan={2}
                                      style={{
                                        paddingLeft: "10px",
                                        marginRight: "10px",
                                        textAlign: "left",
                                      }}
                                    >
                                      {formState.AddtlInf
                                        ? formState.AddtlInf
                                        : "Receiver Bank Failed to receive the request"}
                                    </td>
                                  </tr>
                                )}

                                {formState.RtpCancelled && (
                                  <tr>
                                    <th
                                      className="fs-6"
                                      style={{ textAlign: "right" }}
                                    >
                                      Status :{" "}
                                    </th>
                                    <td
                                      className="fw-bold fs-6 bi bi-x-circle-fill"
                                      colspan={2}
                                      style={{
                                        paddingLeft: "10px",
                                        color: "orange",
                                        fontSize: "20px",
                                        textAlign: "left",
                                      }}
                                    >
                                      {" "}
                                      RTP Cancelled Successfuly
                                    </td>
                                  </tr>
                                )}

                                {formState.RtpCancelled && (
                                  <tr>
                                    <th
                                      className="fs-6"
                                      style={{ textAlign: "right" }}
                                    >
                                      Reason :{" "}
                                    </th>
                                    <td
                                      className=""
                                      style={{
                                        paddingLeft: "10px",
                                        marginRight: "10px",
                                        textAlign: "left",
                                      }}
                                    >
                                      {formState.ReasonAddtlInf}
                                    </td>
                                  </tr>
                                )}

                                {formState.RtpPaid && (
                                  <tr>
                                    <th
                                      className="fs-6"
                                      style={{ textAlign: "right" }}
                                    >
                                      Reason :{" "}
                                    </th>
                                    <td
                                      className=""
                                      style={{
                                        paddingLeft: "10px",
                                        marginRight: "10px",
                                        textAlign: "left",
                                      }}
                                    >
                                      {formState.AddtlInf
                                        ? formState.AddtlInf
                                        : "Request is Accepted. Payment Completed!"}
                                    </td>
                                  </tr>
                                )}
                                <tr>
                                  <td colSpan={4}>
                                    <hr />
                                    {/* Submit Button */}
                                    <div className="d-flex justify-content-center pt-1  ">
                                      {!formState.RtpPaid && !formState.RtpRejected && !formState.RtpCancelled && formState.RtpReceived && (
                                        <div className="d-flex justify-content-center pt-2">
                                          <button
                                            type="button"
                                            className="btn btn-primary w-100"
                                            style={{
                                              maxWidth: "200px",
                                              fontWeight: "bold",
                                              fontSize: "18px",
                                              color: "white",
                                            }}
                                            onClick={open_Cancel_BlankRTP_Popup}
                                            disabled={formState.loading || isExpired}
                                          >
                                            {formState.loading
                                              ? "Requesting..."
                                              : "Cancel Request"}
                                          </button>
                                        </div>
                                      )}
                                      {/* {formState.RtpRejected && !formState.RtpPaid && !formState.RtpCancelled && !formState.RtpReceived &&(
                                        <button
                                          type="button"
                                          className="btn btn-primary bg-warning w-100 fw-bold fs-5"
                                          style={{ maxWidth: "220px" }}
                                          // onClick={prevStep}
                                           onClick={() => {
                                            prevStep()
                                            prevStep()
                                          }}
                                        >
                                          Try Again 
                                        </button>
                                      )} */}
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        )}
                      </tr>
                    </tbody>
                  </table>

                  {formState.RtpPaid && (
                    <div
                      className="success-bg RtpPaid"
                      style={{
                        width: "190px",
                        height: "190px",
                        top: "10px",
                        right: "2px",
                        position: "relative",
                      }}
                    ></div>
                  )}
                  {(formState.RtpCancelled || formState.RtpCancelled || isExpired) && (isExpired || !formState.RtpReceived) && !formState.RtpPaid && (
                    <div
                      className="fail-bg RtpCancelled"
                      style={{
                        width: "190px",
                        height: "190px",
                        top: "2px",
                        right: "3px",
                        position: "relative",
                      }}
                    ></div>
                  )}
                  {!formState.RtpPaid && !formState.RtpRejected && !formState.RtpCancelled && !isExpired && (
                    <div
                      className="received-bg RtpRecieved"
                      style={{
                        width: "190px",
                        height: "190px",
                        top: "2px",
                        right: "3px",
                        position: "relative",
                      }}
                    ></div>
                  )}
                  {formState.RtpRejected && <div className="fail-bg " style={{ width: "190px", height: "190px", top: "2px", right: "3px", position: "relative" }}></div>}
                </div>
              </div>
            )}

          </form>
        </div>
          
          { currentStep > 0 && (formState.normalrtp === false) && formState.blankrtp &&
            (
            <div className="summary-panel d-none d-sm-block" style={{ marginTop: "-60px", minHeight: "600px", maxWidth: "400px", paddingLeft: "-140px" }}>
              <br />
              
              {!formState.RtpPaid && !formState.RtpRejected && !formState.RtpCancelled && formState.normalrtp === false && formState.RtpReceived && (
              <>
              {(!formState.RtpPaid && 
                !formState.RtpCancelled && 
                !formState.RtpRejected) && formState.RtpReceived && <div className="summary-content" style={{marginTop: "-50px", color: "orange"}}>
                <h3 style={{color: "orange"}}> Expired In : 
                  {hours.toString().padStart(2, "0")}:
                  {minutes.toString().padStart(2, "0")}:
                  {seconds.toString().padStart(2, "0")}
                </h3>
                {(timeLeft === 0) &&  <span className="text-danger">⏰ RTP expired!</span>}
              </div>}
              <div
                className="p2p-content-checkout "
                style={{
                  position: "relative",
                  minWidth: "350px",
                  width: "50%",
                  height: "450px",
                  marginTop: "0px",
                  marginRight: "120px",
                  filter: isExpired ? "blur(3px)" : "none",
                }}
              >
                <GenerateQR
                  formState={formState}
                  setFormState={setFormState}
                  resetStates={resetStates}
                />
              </div>
             </>
            )}
              
              {formState.RtpPaid && (
              <div id="summary-content">
                  <h3> Payment Completed </h3>
                  <br />
                  <h4 style={{color : "orange"}}> QR Scanned </h4>
                  <h4> Request Accepted by Payer </h4>
                  <div
                      className="success-bg RtpPaid" 
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
            {formState.RtpRejected && (
              <div id="summary-content">
                  <h2> Payment Rejected </h2>
                  <br />
                  {(currentStep === 1) && (<h4> Request Rejected </h4>)}
                  {(currentStep === 2) && (<h4> Request Rejected by Payer </h4>)}
                  <div
                      className="fail-bg RtpRejected" 
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
            {formState.RtpCancelled && (
              <div id="summary-content">
                  <h2> Payment Cancelled </h2>
                  <br />
                  <h4> You Cancelled the RTP Request </h4>
                  <div
                      className="fail-bg RtpCancelled" 
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
            )}  

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

      </div>)}
    </>
  );
}

export default BlankRTP;
