import { useState, useEffect } from "react";
import Services from "../Home/Services";
import AccVerification from "../Home/P2P/AccVerification";
import NormalRTP from "../Home/RTP/NormalRTP";
import BlankRTP from "./RTP/BlankRTP";
import api from "../../api";
import axios from "axios";
import { flushSync } from "react-dom";
import { open_P2P_Verification_Popup } from "../Home/P2P/AccVerification";
import { close_P2P_Verification_Popup } from "../Home/P2P/AccVerification";
import { close_Normal_RTP_Popup, open_Normal_RTP_Popup } from "../Home/RTP/NormalRTP";
import { close_Blank_RTP_Popup, open_Blank_RTP_Popup } from "./RTP/BlankRTP";
import { open_ReturnPayment_Popup } from "../Home/ReturnPayment/ReturnPayment"
import { close_ReturnPayment_Popup } from "../Home/ReturnPayment/ReturnPayment"
import { open_QueryStatus_Popup } from "../Home/StatusQuery/QueryStatus"
import { close_QueryStatus_Popup } from "../Home/StatusQuery/QueryStatus"
import ReturnPayment from "../Home/ReturnPayment/ReturnPayment"
import QueryStatus from "../Home/StatusQuery/QueryStatus"
import { GenerateQRCode } from "../Home/RTP/GenerateQR";
import { getUserErrorMessage } from "../../errorMessage";
import RequestToken from './RequestToken';
import {open_requestToken} from './RequestToken'
import { Routes, Route, Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
import AutoTest from "./AutoTest";

// -- RTP  POPUP  --
export function open_RTP_Popup() {
  document.getElementById("rtp-popup1").style.display = "block";
}

export function close_RTP_Popup() {
  document.getElementById("rtp-popup1").style.display = "none";
}

  

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
const steps = [
    {
      title: "Account Verification",
      description: "    10 / 10 Pass",
      progress: 100,
      activities: [
        {
          // name: "Postive scenario",
          detail: "Postive scenario",
          status: "completed",
        },
        {
          // name: "Inavalid Destination BIC",
          detail: "Inavalid Destination BIC",
          status: "completed",
        },
        {
          // name: "Without Access Token",
          detail: "Without Access Token",
          status: "completed",
        },
        {
          // name: "Wrong Access Token",
          detail: "Wrong Access Token",
          status: "completed",
        },
        {
          // name: "Using another bank access token",
          detail: "Another Bank Token",
          status: "completed",
        },
        {
          // name: "Wrong Access Token",
          detail: "Inavalid Destination BIC",
          status: "completed",
        },
        {
          // name: "For blocked account",
          detail: "For blocked account",
          status: "completed",
        },
        {
          // name: "For Invalid account",
          detail: "For Invalid account",
          status: "completed",
        },
        {
          // name: "For Timeout account",
          detail: "For Timeout account",
          status: "completed",
        },
        {
          // name: "Invalid Source BIC",
          detail: "Invalid Source BIC",
          status: "completed",
        },
      ],
    },
    {
      title: "Push Payment",
      description: "    1 / 10 Pass",
      progress: 10,
      activities: [
        {
          // name: "Push Payment (postive)",
          detail: "Positive scenarios",
          status: "completed",
        },
        {
          // name: "Push Payment (negative)",
          detail: "Duplicate Transaction ID",
          status: "in-progress",
        },
        {
          // name: "Push Payment (postive)",
          detail: "Invalid Destination BIC",
          status: "in-progress",
        },
        {
          // name: "Push Payment (postive)",
          detail: "Zero Amount",
          status: "in-progress",
        },
        {
          // name: "Push Payment (postive)",
          detail: "Fraction Amount",
          status: "in-progress",
        },
        {
          // name: "Push Payment (postive)",
          detail: "Empty Amount",
          status: "in-progress",
        },
        {
          // name: "Push Payment (postive)",
          detail: "For blocked account",
          status: "in-progress",
        },
        {
          // name: "Push Payment (postive)",
          detail: "For Invalid account",
          status: "in-progress",
        },
        {
          // name: "Without Access Token",
          detail: "Without Access Token",
          status: "in-progress",
        },
        {
          // name: "Wrong Access Token",
          detail: "Wrong Access Token",
          status: "in-progress",
        },
      ],
    },
    {
      title: "Return Payment",
      description: "    NotStarted",
      progress: 0,
      activities: [
        {
          // name: "Push Payment (postive)",
          detail: "Positive scenarios",
          status: "not-started",
        },
        {
          // name: "Push Payment (negative)",
          detail: "Duplicate Return",
          status: "not-started",
        },
        {
          // name: "Push Payment (postive)",
          detail: "Invalid Transaction ID",
          status: "not-started",
        },
        {
          // name: "Push Payment (postive)",
          detail: "Without Transaction ID",
          status: "not-started",
        },
        {
          // name: "Push Payment (postive)",
          detail: "Amount greaterthan Original",
          status: "not-started",
        },
        {
          // name: "Push Payment (postive)",
          detail: "Wrong bank",
          status: "not-started",
        },
        {
          // name: "Push Payment (postive)",
          detail: "Currency mismatch",
          status: "not-started",
        },
        {
          // name: "Push Payment (postive)",
          detail: "For rejected payment",
          status: "not-started",
        },
        {
          // name: "Push Payment (postive)",
          detail: "Different Amount Ccy",
          status: "not-started",
        },
        {
          // name: "Without Access Token",
          detail: "Without Access Token",
          status: "not-started",
        },
        { 
          // name: "Wrong Access Token",
          detail: "Wrong Access Token",
          status: "not-started",
        },
      ],
    },
    {
      title: "Payment Status",
      description: "    NotStarted",
      progress: 0,
      activities: [
        {
          // name: "Push Payment (postive)",
          detail: "Positive scenarios",
          status: "not-started",
        },
        {
          // name: "Push Payment (negative)",
          detail: "Rejected Payment",
          status: "not-started",
        },
        {
          // name: "Push Payment (postive)",
          detail: "Transaction doesn't exist",
          status: "not-started",
        },
        {
          // name: "Without Access Token",
          detail: "Without Access Token",
          status: "not-started",
        },
        { 
          // name: "Wrong Access Token",
          detail: "Wrong Access Token",
          status: "not-started",
        },
      ],
    },
  ];

  const [formState, setFormState] = useState({
    amount: null,
    debitorBank: null,
    debitorAccount: null,
    creditorName: null,
    debitorName: null,
    creditorBank: null,
    creditorAccount: null,
    result: null,
    error: null,
    loading: false,
    txSuccess: false,
    txFail: false,
    txID: null,
    RtrID: null,
    UETR: null,
    txStatus: null,
    txReason: null,
    home: true,
    RtpReceived: false,
    RtpRejected: false,
    RtpPaid: false,
    RtpCancelled: false,
    errorcode: null,
    normalrtp: false,
    blankrtp: false,
    Reason: null,
    ReasonAddtlInf: null,
    OrgnlInstrId: null,
    OrgnlPmtInfId: null,
    OrgnlMsgId: null,
    currency: '230',
    finalqrString: "Scan me and break the secret.",
    displayVerification: false,
    displayRTP: false,
    displayReturn: false,
    displayQuery: false,
    displayToken: false,
    displayQR: false,
    autoTest:false,
  });

  function resetStates (){
    setFormState((prev) => ({
      ...prev,
      result: null,
      error: null,
      loading: false,
      txSuccess: null,
      txFail: null,
      txID: null,
      txStatus: null,
      txReason: null,
      home: true,
      RtpReceived: false,
      RtpRejected: false,
      RtpPaid: false,
      RtpCancelled: false,
      errorcode: null,
      normalrtp: false,
      blankrtp: false,
      Reason: null,
      ReasonAddtlInf: null,
      OrgnlInstrId: null,
      OrgnlPmtInfId: null,
      OrgnlMsgId: null,
      displayVerification: false,
      displayQuery: false,
      displayQR: false, 
      displayRTP: false,
      displayReturn: false,
      displayToken: false,
      autoTest: false,
    }));
  }

  const [navLinkState, setNavLinkState] = useState({
      QR: false,
      p2p: false,
      rtp: false,
      return: false,
      query: false,
      token: false,
    });
    function setQR (){
      setNavLinkState((prev) => ({
        ...prev,
        QR: true,
        p2p: false,
        rtp: false,
        return: false,
        query: false,
        token: false,
      }));
    }
    function setP2P (){
      setNavLinkState((prev) => ({
        ...prev,
        QR: false,
        p2p: true,
        rtp: false,
        return: false,
        query: false,
        token: false,
      }));
    }
    function setRTP (){
      setNavLinkState((prev) => ({
        ...prev,
        QR: false,
        p2p: false,
        rtp: true,
        return: false,
        query: false,
        token: false,
      }));
    }
    function setReturn (){
      setNavLinkState((prev) => ({
        ...prev,
        QR: false,
        p2p: false,
        rtp: false,
        return: true,
        query: false,
        token: false,
      }));
    }
    function setQuery (){
      setNavLinkState((prev) => ({
        ...prev,
        QR: false,
        p2p: false,
        rtp: false,
        return: false,
        query: true,
        token: false,
      }));
    }
    function setToken (){
      setNavLinkState((prev) => ({
        ...prev,
        QR: false,
        p2p: false,
        rtp: false,
        return: false,
        query: false,
        token: true,
      }));
    }

  
  // -- Tokenization request to backend
  // -- Tokenization request to backend
  const requestToken = async (e) => {
    e.preventDefault();
    setFormState.Loading(true); 

    try {
      const response = await api.post(
        "http://localhost:5000/token", // react backend server which will request token from remote server
        {
          grant_type: "password",
          username,
          password,
        }
        
      );

      setFormState.Result(response.data);
      setFormState.Error(null);
    } catch (err) {
      setFormState.Error(err.response?.data || err.message);
      setFormState.Result(null);
    } finally {
      setLoading(false);
    }
  };

 

  // -- Verification Request to backend  --
  const sendVerificationRequest = async (e) => {
    e.preventDefault();
    setFormState((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      const res = await api.post(
        "/api/accountVerification",
        {
          creditorBank: formState.creditorBank,
          creditorAccount: formState.creditorAccount,
        }
      );
      setFormState((prev) => ({
        ...prev,
        creditorName: res.data.creditorName,
      }));
      setFormState((prev) => ({
        ...prev,
        errorcode: res.data.errorcode,
      }));

      if (formState.creditorName) {
        // close_P2P_Verification_Popup();
        // open_P2P_Amount_Popup();
        console.log(res.data.creditorName);
      } else {
        // close_P2P_Verification_Popup();
        // open_P2P_Amount_Popup();
        console.log(res.data.creditorName);
        console.log(res.data.errorcode);
        if (errorcode === "BLCK") {
          flushSync(() => {
            setFormState(prev => ({
              ...prev,
              errorcode: "Account is Blocked. Unable to procced.",
            }));
          });
        }
        else if (errorcode === "UNFN"){
          flushSync(() => {
            setFormState(prev => ({
              ...prev,
              errorcode: "Account is not Found.",
            }));
          });
        }
      }

      setFormState((prev) => ({
        ...prev,
        error: null,
      }));
    } catch (err) {
      const message = getUserErrorMessage(err);
      alert(message); // show to user
      
      setFormState((prev) => ({
        ...prev,
        error: message,
      }));
      console.error(message);

      setFormState((prev) => ({
        ...prev,
        result: null,
      }));
    } finally {
      setFormState((prev) => ({
        ...prev,
        loading: false,
      }));
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
      }
      );
      const status = res.data.txStatus;
      const TxId = res.data.TxId;

      flushSync(() => {
        setFormState(prev => ({
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
        setFormState((prev) => ({
          ...prev,
          txSuccess: true,
        }));
        console.log("TxSuccess: " + formState.txSuccess);
      } else if (res.data.txStatus == "RJCT") {
        setFormState((prev) => ({
          ...prev,
          txFail: true,
        }));
        console.log("Status: " + status + "\n" + "TxId: " + TxId);
      }

      setFormState((prev) => ({
        ...prev,
        error: null,
      }));
    } catch (err) {
      const message = getUserErrorMessage(err);
      alert(message); // show to user
      
      setFormState((prev) => ({
        ...prev,
        error: message,
      }));
      console.error(message);

      setFormState((prev) => ({
        ...prev,
        result: null,
      }));
    } finally {
      setFormState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  // -- NormalRTP Request to backend  --
  const sendNormalRTPRequest = async (e) => {
    e.preventDefault();
    setFormState((prev) => ({
      ...prev,
      loading: true,
      RtpCancelled: false,
      RtpPaid: false,
      RtpRejected: false,
      RtpReceived: false,
      normalrtp: true,
    }));

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

      console.log("OrgnlInstrId: " + res.data.OrgnlInstrId)
      console.log("OrgnlMsgId: " + res.data.OrgnlMsgId)
      console.log("OrgnlPmtInfId: " + res.data.OrgnlPmtInfId)

      flushSync(() => {
        setFormState(prev => ({
          ...prev,
          txStatus: status,
          UETR: UETR,
          AddtlInf: AddtlInf,
          debitorName: debitorName,
          OrgnlInstrId: OrgnlInstrId,
          OrgnlPmtInfId: OrgnlPmtInfId,
          OrgnlMsgId: OrgnlMsgId,
          debitorBank: debitorBank,
          debitorAccount: debitorAccount,
        }));
      });

      
      console.log(" TxStatus: " + status + "\n UETR: " + UETR + "\n AddtlInf: " + AddtlInf);


      if (res.data.txStatus == "RCVD") {
        setFormState((prev) => ({
          ...prev,
          RtpReceived: true,
        }));
      } else if (res.data.txStatus == "RJCT") {
        setFormState((prev) => ({
          ...prev,
          RtpRejected: true,
        }));
      }
      setFormState((prev) => ({
          ...prev,
          normalrtp: true,
        }));
      close_Normal_RTP_Popup()
      close_Blank_RTP_Popup() 

      setFormState((prev) => ({
        ...prev,
        error: null,
      }));
    } catch (err) {
      const message = getUserErrorMessage(err);
      alert(message); // show to user
      
      setFormState((prev) => ({
        ...prev,
        error: message,
      }));
      console.error(message);

      setFormState((prev) => ({
        ...prev,
        result: null,
      }));
    } finally {
      setFormState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  // -- BlankRTP Request to backend  --
  const sendBlankRTPRequest = async (e) => {
    e.preventDefault();
    setFormState((prev) => ({
      ...prev,
      loading: true,
      RtpCancelled: false,
      RtpPaid: false,
      RtpRejected: false,
      RtpReceived: false,
      debitorBank: null,
      debitorAccount: null,
      debitorName: null,
      normalrtp: false,
    }));

    console.log(formState.amount)
    console.log(formState.creditorBank)
    console.log(formState.creditorAccount)

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

      console.log("OrgnlInstrId: " + res.data.OrgnlInstrId)
      console.log("OrgnlMsgId: " + res.data.OrgnlMsgId)
      console.log("OrgnlPmtInfId: " + res.data.OrgnlPmtInfId)

      flushSync(() => {
        setFormState(prev => ({
          ...prev,
          txStatus: status,
          UETR: UETR,
          AddtlInf: AddtlInf,
          debitorName: debitorName,
          OrgnlInstrId: OrgnlInstrId,
          OrgnlPmtInfId: OrgnlPmtInfId,
          OrgnlMsgId: OrgnlMsgId,
          debitorBank: debitorBank,
          debitorAccount: debitorAccount,
          creditorName: creditorName,
          amount: amount,
        }));
      });

      
      console.log(" TxStatus: " + status + "\n UETR: " + UETR + "\n AddtlInf: " + AddtlInf);


      if (res.data.txStatus == "RCVD") {
        setFormState((prev) => ({
          ...prev,
          RtpReceived: false,
        }));
      } else if (res.data.txStatus == "RJCT") {
        setFormState((prev) => ({
          ...prev,
          RtpRejected: true,
        }));
      }
      setFormState((prev) => ({
          ...prev,
          normalrtp: false,
        }));
      close_Normal_RTP_Popup()
      close_Blank_RTP_Popup()
      GenerateQRCode(UETR, amount, "230", creditorAccount, setFormState)

      setFormState((prev) => ({
        ...prev,
        error: null,
      }));
    } catch (err) {
      const message = getUserErrorMessage(err);
      alert(message); // show to user
      
      setFormState((prev) => ({
        ...prev,
        error: message,
      }));
      console.error(message);

      setFormState((prev) => ({
        ...prev,
        result: null,
      }));
    } finally {
      setFormState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

    // -- RTP Cancel Request to backend  --
  const sendRTPCancelRequest = async (e, Reason, ReasonAddtlInf) => {
    e.preventDefault();
    setFormState((prev) => ({
      ...prev,
      loading: true,
      RtpPaid: false,
      RtpRejected: false,
      RtpReceived: false,
      RtpCancelled: true,
      Reason: Reason,
      ReasonAddtlInf: ReasonAddtlInf,
    }));

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
        setFormState(prev => ({
          ...prev,
          txStatus: status,
          AddtlInf: AddtlInf,
        }));
      });

      // useEffect(() => {
      //   console.log("TxStatus: " + formState.txStatus);
      // }, [formState.txStatus]);
      
      console.log(" TxStatus: " + status + "\n UETR: " + formState.UETR + "\n AddtlInf: " + AddtlInf);


      if (res.data.txStatus == "ACCR") {
        setFormState((prev) => ({
          ...prev,
          RtpCancelled: true,
          RtpRejected: false,
        }));
      } else if (res.data.txStatus == "RJCR") {
        setFormState((prev) => ({
          ...prev,
          RtpCancelled: false,
          RtpRejected: false,
        }));
        // alert("RTP Request Not Received. Try Again! \n TxStatus: " + status + "\n" + "UETR: " + UETR + "\n" + "AddtlInf: " + AddtlInf);
      }

      close_Normal_RTP_Popup()
      close_Blank_RTP_Popup()

      setFormState((prev) => ({ 
        ...prev,
        error: null,
      }));
    } catch (err) {
      const message = getUserErrorMessage(err);
      alert(message); // show to user
      
      setFormState((prev) => ({
        ...prev,
        error: message,
      }));
      console.error(message);

      setFormState((prev) => ({
        ...prev,
        result: null,
      }));
    } finally {
      setFormState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };


  // -- Return Payment Request to backend  --
  const sendReturnPaymentRequest = async (e) => {
    e.preventDefault();
    setFormState((prev) => ({
      ...prev,
      loading: true,
    }));

    console.log("TxId: " + formState.txID)

    try {
      const res = await api.post("http://localhost:5000/returnPayment", {
        txID: formState.txID,
      }
    
    );

      const txStatus = res.data.txStatus;
      const txReason = res.data.txReason;

      flushSync(() => {
        setFormState(prev => ({
          ...prev,
          txStatus: txStatus,
          txReason: txReason,
        }));
      });

      // useEffect(() => {
      //   console.log("TxStatus: " + formState.txStatus);
      // }, [formState.txStatus]);
      
      console.log("TxStatus: " + txStatus + "\n Reason: " + txReason);


      if (res.data.txStatus == "ACSC") {
        close_ReturnPayment_Popup();
        // open_P2P_Amount_Popup();
      } else {
        close_ReturnPayment_Popup();
        // open_P2P_Amount_Popup();
        console.log(res.data.txReason);
      }

      setFormState((prev) => ({
        ...prev,
        error: null,
      }));
    } catch (err) {
      const message = getUserErrorMessage(err);
      alert(message); // show to user
      
      setFormState((prev) => ({
        ...prev,
        error: message,
      }));
      console.error(message);

      setFormState((prev) => ({
        ...prev,
        result: null,
      }));
    } finally {
      setFormState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  // -- Query Status Request to backend  --
  const sendQueryStatusRequest = async (e) => {
    e.preventDefault();
    setFormState((prev) => ({
      ...prev,
      loading: true,
    }));

    console.log("TxId: " + formState.txID)

    try {
      const res = await api.post("http://localhost:5000/queryStatus", {
        Id: formState.txID,
      }
    );

      const txStatus = res.data.txStatus;
      if (txStatus == "ACSC") {
        flushSync(() => {
          setFormState(prev => ({
            ...prev,
            txSuccess: true,
            txFail: false,
          }));
        });
      }
      else{
        flushSync(() => {
          setFormState(prev => ({
            ...prev,
            txSuccess: false,
            txFail: true,
          }));
        });
      }

      const txReason = res.data.AddtlInf;
      const amount = res.data.amount;
      const creditorName = res.data.creditorName;
      const debitorName = res.data.debitorName;
      const creditorAccount = res.data.creditorAccount;
      const debitorAccount = res.data.debitorAccount;
      const debitorBank = res.data.debitorBank;
      const creditorBank = res.data.debitorBank;

      flushSync(() => {
        setFormState(prev => ({
          ...prev,
          txStatus: txStatus,
          txReason: txReason,
          creditorName: creditorName,
          creditorAccount: creditorAccount,
          debitorAccount: debitorAccount,
          creditorBank: creditorBank,
          debitorBank: debitorBank,
          amount: amount,
          debitorName: debitorName,
        }));
      });
      
      const id = String(formState.txID);
      const idLength = id.length;

      if (idLength === 36){
        // open_RTPReport_Popup()
      }
      else{
        open_P2P_Checkout_Popup()
      }
      // useEffect(() => {
      //   console.log("TxStatus: " + formState.txStatus);
      // }, [formState.txStatus]);
      
      console.log("TxStatus: " + txStatus + "\n Reason: " + txReason);


      if (res.data.txStatus == "ACSC") {
        close_QueryStatus_Popup();
        // open_P2P_Amount_Popup();
      } else {
        close_QueryStatus_Popup();
        // open_P2P_Amount_Popup();
        console.log(res.data.txReason);
      }

      setFormState((prev) => ({
        ...prev,
        error: null,
      }));
    } catch (err) {
      const message = getUserErrorMessage(err);
      alert(message); // show to user
      
      setFormState((prev) => ({
        ...prev,
        error: message,
      }));
      console.error(message);

      setFormState((prev) => ({
        ...prev,
        result: null,
      }));
    } finally {
      setFormState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  


  return (
    <>
    {/* RTP POPUP Content */}
    <div id="rtp-popup1" className="rtp-popup" style={{height: "35%", width: "25%", minWidth: "250px", minHeight: "25%"}}>
      <button
        className="btn close-btn"
        onClick={close_RTP_Popup}
        style={{ marginRight: "-15px", marginTop: "5px" }}
      >
        {" "}
        X{" "}
      </button>
      <div className="rtp-popup-content" style={{paddingTop: "10px", paddingleft: "10px", paddingRight: "10px"}} >
        <div
          className="popup-content"
          style={{height: "50px", width: "200px"}}
          onClick={(e) => {
            flushSync(() => {
              setFormState(prev => ({
                ...prev,
                home: false,
                displayVerification: false,
                displayRTP: true,
                displayReturn: false,
                displayQuery: false,
                displayToken: false,
                displayQR: false,
                normalrtp: true,
              }));
            });
            close_RTP_Popup();
            open_Normal_RTP_Popup();
          }}
        >
          <i className="bi bi-bell-fill"></i>  Normal RTP
        </div>
        <div className="popup-content"
        style={{height: "50px", width: "200px", marginTop: "-5%"}}
          onClick={(e) => {
            flushSync(() => {
              setFormState(prev => ({
                ...prev,
                home: false,
                displayVerification: false,
                displayReturn: false,
                displayQuery: false,
                displayToken: false,
                displayQR: false,
                normalrtp: false,
              }));
            });
            close_RTP_Popup();
            open_Blank_RTP_Popup();
          }}
        >
          <i className="bi bi-qr-code"></i> Blank RTP (DQR)

        </div>
      </div>
    </div>
            
    <div className="sidebar-container d-flex">
      {/* Sidebar */}
      <div className={`sidebar ${collapsed ? "collapsed" : ""} `}>
        <div className="sidebar-header original-header">
          <h3>Home</h3>
          <button
            type="button"
            className={`toggle-btn ${!collapsed ? "bi bi-arrow-left" : ""}`}
            onClick={() => setCollapsed(true)}
          >
            {/* <i className={${!collapsed ? "bi bi-arrow-left" : ""}`}></i> */}
          </button>
        </div>

        <div className="sidebar-header collapsed-header">
          <button
            type="button"
            className="toggle-btn bi bi-list list-button-info"
            style={{ marginLeft: "-3px"}}
            onClick={() => setCollapsed(false)}
          >
            {/* <i className={`${!collapsed ? "bi bi-list" : ""}`}></i> */}
          </button>
        </div>

        <nav className="sidebar-links">
          <div className="sidebar-title">
            <a href="#">
              <span>Services</span>
            </a>
            <i className="bi bi-arrow"></i>
          </div>
          <div className={`sidebar-list ${formState.displayQR ? "selected" : ""} `}>
            <a onClick={(e) => {
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  home: true,
                  displayVerification: false,
                  displayRTP: false,
                  displayReturn: false,
                  displayQuery: false,
                  displayToken: false,
                  displayQR: false,
                }));
              });
              resetStates()
              open_P2P_Verification_Popup()

              setQR()
              }}>
              <span>QR Payment</span>
            </a>
          </div>
          <div className={`sidebar-list ${formState.displayVerification ? "selected" : ""} `}>
            <a onClick={(e) => {
              resetStates()
              setP2P()
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  home: false,
                  displayVerification: true,
                  displayRTP: false,
                  displayReturn: false,
                  displayQuery: false,
                  displayToken: false,
                  displayQR: false,
                }));
              });
              
              // close_Normal_RTP_Popup()
              // close_Blank_RTP_Popup()   
              // close_ReturnPayment_Popup()
              // close_QueryStatus_Popup() 
              open_P2P_Verification_Popup()
              }}>
              <span>P2P </span>
            </a>
          </div>
          <div className={`sidebar-list ${formState.displayRTP ? "selected" : ""} `}>
            <a onClick={(e) => {
              resetStates()
              setRTP()
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  home: true,
                  displayVerification: false,
                  displayRTP: true,
                  displayReturn: false,
                  displayQuery: false,
                  displayToken: false,
                  displayQR: false,
                }));
              });
              
              // close_P2P_Verification_Popup()    
              // close_Normal_RTP_Popup()
              // close_Blank_RTP_Popup()   
              // close_ReturnPayment_Popup()
              // close_QueryStatus_Popup()        
              open_RTP_Popup()
              }}>
              <span>Request To Pay</span>
            </a>
          </div>
          <div className={`sidebar-list ${formState.displayReturn ? "selected" : ""} `}>
            <a onClick={(e) => {
              resetStates()
              setReturn()
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  home: false,
                  displayVerification: false,
                  displayRTP: false,
                  displayReturn: true,
                  displayQuery: false,
                  displayToken: false,
                  displayQR: false,
                }));
              });
              
              // close_P2P_Verification_Popup()   
              // close_Normal_RTP_Popup()
              // close_Blank_RTP_Popup()
              // close_QueryStatus_Popup()      
              open_ReturnPayment_Popup()
              }}>
              <span>Return Payment</span>
            </a>
          </div>
          <div className={`sidebar-list ${formState.displayQuery ? "selected" : ""} `}>
            <a onClick={(e) => {
              resetStates()
              setQuery()
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  home: false,
                  displayVerification: false,
                  displayRTP: false,
                  displayReturn: false,
                  displayQuery: true,
                  displayToken: false,
                  displayQR: false,
                }));
              });
              // close_P2P_Verification_Popup()   
              // close_Normal_RTP_Popup()
              // close_Blank_RTP_Popup()   
              // close_ReturnPayment_Popup()        
              open_QueryStatus_Popup()
              }}>
              <span>Query Status</span>
            </a>
          </div>
          <div className={`sidebar-list ${formState.displayToken ? "selected" : ""} `}>
            <a onClick={(e) => {
              resetStates()
              setToken()
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  home: false,
                  displayVerification: false,
                  displayRTP: false,
                  displayReturn: false,
                  displayQuery: false,
                  displayToken: true,
                  displayQR: false,
                }));
              });
              // close_P2P_Verification_Popup()   
              // close_Normal_RTP_Popup()
              // close_Blank_RTP_Popup()    
              // close_ReturnPayment_Popup()         
              open_requestToken()
              }}>
              <span>Request Token</span>
            </a>
          </div>
          <div className="sidebar-title">
            <a >
              <span>Activity Log</span>
            </a>
          </div>
          <div className="sidebar-list">
            <a onClick={(e) => {
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  home: true,
                }));
              });
              }}>
              <span>Debug Log</span>
            </a>
          </div>
          <div className={`sidebar-list ${navLinkState.QR ? "not-selected" : ""} `}>
            <a onClick={(e) => {
              resetStates
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  home: true,
                }));
              });
              
              }}>
              <span>Operation Log </span>
            </a>
          </div>
        </nav>
      </div>

      <div className="main ">
        {/* <Outlet/> */}

        {formState.home && 
        <Services
          formState={formState}
          setFormState={setFormState}
          resetStates={resetStates}
        />}
        
        {/* ---------  P2P Account Verification POPUP Content ---------- */}
        {formState.displayVerification && <AccVerification
          formState={formState}
          setFormState={setFormState}
          resetStates={resetStates}
        />}

        {/* ---------  Normal RTP POPUP Content ---------- */}
        {formState.displayRTP && <NormalRTP
          formState={formState}
          setFormState={setFormState}
          resetStates={resetStates}
        />}

        {/* ---------  Blank RTP POPUP Content ---------- */}
        {formState.displayRTP && <BlankRTP
          formState={formState}
          setFormState={setFormState}
          resetStates={resetStates}
        />}

        {/* ---------  Return Payment POPUP Content ---------- */}
        {formState.displayReturn && <ReturnPayment
          formState={formState}
          setFormState={setFormState}
          resetStates={resetStates}
        />}

        {/* ---------  Query Status Content ---------- */}
        {formState.displayQuery && <QueryStatus
          formState={formState}
          setFormState={setFormState}
          resetStates={resetStates}
          sendQueryStatusRequest={sendQueryStatusRequest}
        />}

        {/* ---------  Request Token Content ---------- */}
        {formState.displayToken && <RequestToken
          formState={formState}
          setFormState={setFormState}
          resetStates={resetStates}
        />}

        {/* ---------  AutoTest Content ---------- */}
        {formState.autoTest && <AutoTest
          formState={formState}
          setFormState={setFormState}
          resetStates={resetStates}
          testId="Test-2026-002"
          status="In Progress"
          overallProgress={20}
          steps={steps}
        />}

      </div>
    </div>
    </>
  );
}
