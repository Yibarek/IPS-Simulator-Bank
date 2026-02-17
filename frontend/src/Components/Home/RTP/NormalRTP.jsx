import React, { useState, useEffect } from "react";
import Services from "../../Home/Services";
import { flushSync } from "react-dom";
import Select from "react-select"
import { selectStyles } from "../../../selectStyles";
import { getUserErrorMessage } from "../../../errorMessage";
import api from "../../../api"


// import React, { useEffect } from "react";
// import { flushSync } from "react-dom";
import socket from "../../../Socket.js";

import { open_Blank_RTP_Popup } from "./BlankRTP.jsx";
import { resetBlankRTPInputs } from "./BlankRTP.jsx";
import GenerateQR from "./GenerateQR";
import { close_GenerateQR_Popup } from "./GenerateQR";

let GeneratedUETR = ''
let TxId = ''
let Status = ''
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
export function open_Cancel_RTP_Popup() {
  document.getElementById("cancel-rtp-popup").style.display = "block";
}

export function close_Cancel_RTP_Popup() {
  document.getElementById("cancel-rtp-popup").style.display = "none";
}

export function open_Normal_RTP_Popup() {
  document.getElementById("normalRTP-popup").style.display = "block";
}

export function close_Normal_RTP_Popup() {
  document.getElementById("normalRTP-popup").style.display = "none";
}

export function resetNormalRTPInputs() {
  document.getElementById("debitorBank").value = "";
  document.getElementById("creditorBank").value = "";
  document.getElementById("debitorAccount").value = "";
  document.getElementById("creditorAccount").value = "";
  document.getElementById("amount").value = "";
}


function NormalRTP({ formState, setFormState, resetStates }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExpired, setIsexpired] = useState(false);
  // const [formState1, setFormState1] = useState({
  //     RtpReceived: false,
  //     RtpRejected: false,
  //     RtpPaid: false,
  //     RtpCancelled: false
  //   });

  const [display, setDisplay] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);

  const updateField = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // const updateField = (key, value) => {
  //   flushSync(() => {
  //     setFormState1((prev) => ({
  //     ...prev,
  //     [key]: value,
  //   }));
  //   });
  // };


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
    });

    return () => socket.off("payment-update");
  }, []);


  // Completion-notification (pacs.002)
  useEffect(() => {
    socket.on("completion-notification", (data) => {
      console.log("Received from backend:", data.TxId);
      console.log("Received from backend:", data.txStatus);
      console.log("Received from frontend:", formState.TxId);
      close_GenerateQR_Popup
      

      if ((GeneratedUETR === data.UETR) && (data.txStatus === "ACSC")) {
        TxId = data.TxId;
        console.log("Paid")
        updateField("txSuccess", true);
        updateField("txFail", false);
        document.getElementById("debitorBank").value = data.debitorBank
        document.getElementById("debitorName").value = data.debitorName
        document.getElementById("debitorAccount").value = data.debitorAccount
        console.log("txSuccess : " + formState.txSuccess)
        console.log("txFail : " + formState.txFail)
      }
      else {
        TxId = data.TxId;
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
    updateField("RtpCancelled", true);
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

      flushSync(() => {
        updateField("txStatus", status);
        updateField("AddtlInf", AddtlInf);
      });

      // useEffect(() => {
      //   console.log("TxStatus: " + formState.txStatus);
      // }, [formState.txStatus]);

      console.log(" TxStatus: " + status + "\n UETR: " + formState.UETR + "\n AddtlInf: " + AddtlInf);


      if (res.data.txStatus == "ACCR") {
        updateField("RtpCancelled", true)
        updateField("RtpRejected", false)
      } else if (res.data.txStatus == "RJCR") {
        updateField("RtpCancelled", false)
        updateField("RtpRejected", false)
      }

      // close_Cancel_RTP_Popup()
      // close_Normal_RTP_Popup()
      // close_Blank_RTP_Popup()
      // open_RTPReport_Popup()
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
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
    { value: "ABAWETAA", label: "AbayWallet" },
    { value: "ABSCETAA", label: "AddisInt" },
    { value: "AMHRETAA", label: "AmharaBank" },
    { value: "WALLETAA", label: "AmharaBankWallet" },
    { value: "AWINETAA", label: "AwashBank" },
    { value: "ABYSETAA", label: "BOA" },
    { value: "BUNAETAA", label: "BunnaBank" },
    { value: "CBETETAA", label: "CBE" },
    { value: "CBEBETAA", label: "CBEBIRR" },
    { value: "CBORETAA", label: "CBO" },
    { value: "DASHETAA", label: "DashenBank" },
    { value: "ENATETAA", label: "EnatBank" },
    { value: "GOBTETAA", label: "GohBetochBank" },
    { value: "KAFIETAA", label: "KAAFIMFI" },
    { value: "LIBSETAA", label: "LionBank" },
    { value: "MPSAETAA", label: "MPesa" },
    { value: "NIBIETAA", label: "NIB_Int._Bank" },
    { value: "RMSIETAA", label: "RammisBank" },
    { value: "RMFIETA2", label: "RaysMFI" },
    { value: "SAHLETAA", label: "SahalMFI" },
    { value: "SSHCETAA", label: "SiketBank" },
    { value: "SINQETAA", label: "SiinqeeBank" },
    { value: "TSDYETAA", label: "TsedeyBank" },
    { value: "TSCPETAA", label: "TsehayBank" },
    { value: "WEGAETAA", label: "WegagenBank" },
    { value: "EBIRETAA", label: "Wegagen_EBirr" },
    { value: "YITBETAA", label: "YTSBank" },
    { value: "ZAMZETAA", label: "ZamZamBank" },
    { value: "ZEMEETAA", label: "ZemenBank" }
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

  // -- NormalRTP Request to backend  --
  const sendNormalRTPRequest1 = async (e) => {
    e.preventDefault();

    if (
      !formState.creditorBank ||
      !formState.creditorAccount ||
      !formState.debitorBank ||
      !formState.debitorAccount ||
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
    updateField("normalrtp", true)
    updateField("blankrtp", true)

    if (
      currentStep === 0 &&
      (!formState.creditorBank || !formState.creditorAccount)
    ) {
      triggerNotification();
      return;
    }
    console.log("Amount: " + formState.amount)
    console.log("DebitorBank: " + formState.debitorBank)
    console.log("DebitorAccount: " + formState.debitorAccount)
    console.log("CreditorBank: " + formState.creditorBank)
    console.log("CreditorAccount: " + formState.creditorAccount)

    try {
      const res = await api.post("http://localhost:5000/normalRTP", {
        amount: formState.amount,
        debitorAccount: formState.debitorAccount,
        debitorBank: formState.debitorBank,
        creditorBank: formState.creditorBank,
        creditorAccount: formState.creditorAccount,
      }

      );

      const status = res.data.txStatus;
      const UETR = res.data.UETR;
      const AddtlInf = res.data.AddtlInf;
      const debitorName = res.data.debitorName;
      const OrgnlInstrId = res.data.OrgnlInstrId;
      const OrgnlPmtInfId = res.data.OrgnlPmtInfId;
      const OrgnlMsgId = res.data.OrgnlMsgId;
      const debitorBank = formState.debitorBank;
      const debitorAccount = formState.debitorAccount;
      RTPExpiredTime = res.data.RTPExpiredTime;

      console.log("OrgnlInstrId: " + res.data.OrgnlInstrId)
      console.log("OrgnlMsgId: " + res.data.OrgnlMsgId)
      console.log("OrgnlPmtInfId: " + res.data.OrgnlPmtInfId)

      flushSync(() => {
        updateField("txStatus", status);
        updateField("UETR", UETR);
        updateField("AddtlInf", AddtlInf);
        updateField("debitorName", debitorName);
        updateField("OrgnlInstrId", OrgnlInstrId);
        updateField("OrgnlPmtInfId", OrgnlPmtInfId);
        updateField("OrgnlMsgId", OrgnlMsgId);
        updateField("debitorBank", debitorBank);
        updateField("debitorAccount", debitorAccount);
      });


      console.log(" TxStatus: " + status + "\n UETR: " + UETR + "\n AddtlInf: " + AddtlInf + "\nRTPExpiredTime: " + RTPExpiredTime);


      if (res.data.txStatus == "RCVD") {
        updateField("RtpReceived", true);
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        GeneratedUETR = res.data.UETR;
      } else if (res.data.txStatus == "RJCT") {
        updateField("RtpRejected", true);
      }
      updateField("normalrtp", true);
      updateField("blankrtp", true);
      // close_Normal_RTP_Popup()
      // close_Blank_RTP_Popup() 
      // open_RTPReport_Popup()

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
      if (timeLeft === 0 && formState.normalrtp) {
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
        id="cancel-rtp-popup"
        className="cancel-rtp-popup"
        style={{
          display: "none",
          height: "35%",
          width: "25%",
          minWidth: "250px",
          minHeight: "25%",
        }}
       >
        <button
          className="btn cancel-close-btn"
          onClick={close_Cancel_RTP_Popup}
          style={{ marginRight: "-15px", marginTop: "5px" }}
        >
          {" "}
          X{" "}
        </button>
        <div
          className="rtp-popup-content"
          style={{
            paddingTop: "10px",
            paddingleft: "10px",
            paddingRight: "10px",
          }}
        >
          <div
            className="popup-content"
            style={{ height: "50px", width: "200px", background: "orange" }}
            onClick={(e) => {
              sendRTPCancelRequest(e, "WrongAmount", "Invalid amount")
              close_Cancel_RTP_Popup()
            }}
          >
            Wrong Amount
          </div>
          <div
            className="popup-content"
            style={{
              height: "50px",
              width: "200px",
              marginTop: "-5%",
              background: "orange",
            }}
            onClick={(e) =>{
              sendRTPCancelRequest(e, "invalidreceiverBIC", "Receiver BIC is not defined or invalid")
              close_Cancel_RTP_Popup()
            }}
          >
            Invalid Debitor Info
          </div>
        </div>
      </div>

      {formState.displayRTP && 
      <div className="checkout-container">

        <div
          id="normalRTP-popup"
          className="form-panel"
          style={{ display: "none", }}
        >
          {/* <div className=""> */}
          {/* <div className="card p-4 shadow-sm"> */}
          {/* Progress bar */}
          <button
            className="btn close-btn"
            onClick={(e) => {
              close_Normal_RTP_Popup();
              
              if (currentStep === 2) {
                prevStep()
                prevStep()
              }
              else if (currentStep === 1) {
                prevStep()
              }

              flushSync(() => {
                updateField("home", true);
                updateField("normalrtp", false);
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
              });
              resetStates();
            }}
            style={{ marginRight: "20px", cursor: "pointer" }}
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
            Normal RTP Request
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
                {/* Debitor Bank */}
                <div className="row g-6">
                  <div className="col-md-6">
                    <label
                      htmlFor="debitorBank"
                      style={{ fontWeight: "bold", fontSize: "14px" }}
                      className="form-label"
                    >
                      Debtor Bank <i style={{color: "red"}}> *</i>
                    </label>
                    <Select
                      className=""
                      id="debitorBank"
                      options={bankOptions}
                      value={bankOptions.find(
                        (option) => option.value === formState.debitorBank,
                      )}
                      onChange={(selectedDebtor) =>
                        updateField("debitorBank", selectedDebtor.value)
                      }
                      styles={selectStyles}
                    />
                  </div>

                  <div className="col-md-6">
                    <label
                      htmlFor="debitorBank"
                      style={{ fontWeight: "bold", fontSize: "14px" }}
                      className="form-label"
                    >
                      Debitor Account <i style={{color: "red"}}> *</i>
                    </label>
                    <input
                      id="debitorAccount"
                      className="form-control"
                      name="Creditor Account"
                      placeholder="Debitor Account"
                      value={formState.debitorAccount ?? ""}
                      onChange={(e) => updateField("debitorAccount", e.target.value)}
                    />
                  </div>
                </div>


                {/* Creditor Bank */}
                <div className="row g-6">
                  <div className="col-md-6">
                    <label
                      htmlFor="debitorBank"
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
                      onChange={(selectedCreditor) =>
                        updateField("creditorBank", selectedCreditor.value)
                      }
                      styles={selectStyles}
                    />
                  </div>

                  <div className="col-md-6">
                    <label
                      htmlFor="debitorBank"
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
                      value={formState.creditorAccount ?? ""}
                      onChange={(e) => updateField("creditorAccount", e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2">
                  <label
                    htmlFor="debitorBank"
                    style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "-5px", marginTop: "25px" }}
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
                    onClick={sendNormalRTPRequest1}
                    disabled={formState.loading}
                  >
                    {formState.loading ? "Requesting..." : "Next"}
                  </button>
                </div>
                {/* </div> */}
                {/* </div> */}
              </div>)}

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
                                        id="debitorBank"
                                        style={{
                                          minWidth: "180px",
                                          textAlign: "left",
                                          paddingLeft: "10px",
                                        }}
                                      >
                                        {formState.debitorBank}
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
                                        id="debitorAccount"
                                        style={{
                                          minWidth: "180px",
                                          textAlign: "left",
                                          paddingLeft: "10px",
                                        }}
                                      >
                                        {formState.debitorAccount}
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
                                        id="debitorName"
                                        style={{
                                          minWidth: "180px",
                                          textAlign: "left",
                                          paddingLeft: "10px",
                                        }}
                                      >
                                        {formState.debitorName}
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
                                            onClick={open_Cancel_RTP_Popup}
                                            disabled={formState.loading || isExpired}
                                          >
                                            {formState.loading
                                              ? "Requesting..."
                                              : "Cancel Request"}
                                          </button>
                                        </div>
                                      )}
                                      {formState.RtpRejected && !formState.RtpPaid && !formState.RtpCancelled && !formState.RtpReceived &&(
                                        <button
                                          type="button"
                                          className="btn btn-primary bg-warning w-100 fw-bold fs-5"
                                          style={{ maxWidth: "220px" }}
                                          onClick={prevStep}
                                        >
                                          Try Again
                                        </button>
                                      )}
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
            
          { currentStep > 0 && formState.normalrtp === true &&
            (
            <div className="summary-panel d-none d-sm-block" style={{ minHeight: "600px", maxWidth: "400px", paddingLeft: "-140px" }}>
              <br />
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
              {formState.RtpPaid && (
              <div id="summary-content">
                  <h3> Payment Completed </h3>
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
                  <h4> Request Rejected by Payer </h4>
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
            {/* {(currentStep === 0) && !formState.RtpCancelled && !formState.RtpPaid && !formState.RtpReceived && !formState.RtpRejected && formState.normalrtp && (
              <div id="summary-content">
                  <h2> RTP in Process </h2>
                  <br />
                  <h4> Please enter the debitor, creditor and the amount </h4>
                  
              </div>
            )} */}
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

      </div>}
    </>
  );
}

export default NormalRTP;
