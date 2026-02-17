import { useState } from "react";
import Services, { open_Service_Page } from "../../../Services";
import AccVerification from "./AccVerification";
import NormalRTP from "./NormalRTP";
import BlankRTP from "./BlankRTP";
import RTPReport from "./RTPReport";

import axios from "axios";
import { flushSync } from "react-dom";
import Amount from "./Amount";
import { open_P2P_Verification_Popup } from "./AccVerification";
import { close_P2P_Verification_Popup } from "./AccVerification";
import { open_P2P_Amount_Popup } from "./Amount";
import { close_P2P_Amount_Popup } from "./Amount";
import { close_P2P_Checkout_Popup } from "./Checkout";
import { close_Normal_RTP_Popup, open_Normal_RTP_Popup } from "./NormalRTP";
import { close_Blank_RTP_Popup, open_Blank_RTP_Popup } from "./BlankRTP";
import { open_RTPReport_Popup } from "./RTPReport"
import { close_RTPReport_Popup } from "./RTPReport"
import { open_ReturnPayment_Popup } from "../../../ReturnPayment"
import { close_ReturnPayment_Popup } from "../../../ReturnPayment"
import { open_QueryStatus_Popup } from "../../../QueryStatus"
import { close_QueryStatus_Popup } from "../../../QueryStatus"
import ReturnPayment from "../../../ReturnPayment"
import QueryStatus from "../../../QueryStatus"
import Checkout from "./Checkout";
import GenerateQR from "./GenerateQR";
import CustomerTable from "../CustomerTable";
import AddCustomer from "./addCustomer";


// -- RTP  POPUP  --
function open_RTP_Popup() {
  document.getElementById("rtp-popup").style.display = "block";
}

function close_RTP_Popup() {
  document.getElementById("rtp-popup").style.display = "none";
}

export default function CustomerSidebar() {
  const [collapsed, setCollapsed] = useState(false);

    // const [amount, setAmount] = useState(null);
  // const [debitorAccount, setdebitorAccount] = useState(null);
  // const [creditorName, setcreditorName] = useState(null);
  // const [creditorBank, setcreditorBank] = useState(null);
  // const [creditorAccount, setcreditorAccount] = useState(null);
  // const [result, setFormState.Result] = useState(null);
  // const [error, setFormState.Error] = useState(null);
  // const [loading, setLoading] = useState(false);

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
    txSuccess: null,
    txFail: null,
    txID: null,
    UETR: null,
    txStatus: null,
    txReason: null,
    customer: true,
    RtpReceived: false,
    RtpRejected: false,
    RtpPaid: false,
    RtpCancelled: false,
    errorcode: null,
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
      customer: true,
      RtpReceived: false,
      RtpRejected: false,
      RtpPaid: false,
      RtpCancelled: false,
      errorcode: null,
    }));
  }

  const [navLinkState, setNavLinkState] = useState({
    QR: false,
    p2p: false,
    rtp: false,
    return: false,
    qurey: false,
  });
  function setQR (){
    setNavLinkState((prev) => ({
      ...prev,
      QR: true,
      p2p: false,
      rtp: false,
      return: false,
      qurey: false,
    }));
  }
  function setP2P (){
    setNavLinkState((prev) => ({
      ...prev,
      QR: false,
      p2p: true,
      rtp: false,
      return: false,
      qurey: false,
    }));
  }
  function setRTP (){
    setNavLinkState((prev) => ({
      ...prev,
      QR: false,
      p2p: false,
      rtp: true,
      return: false,
      qurey: false,
    }));
  }
  function setReturn (){
    setNavLinkState((prev) => ({
      ...prev,
      QR: false,
      p2p: false,
      rtp: false,
      return: true,
      qurey: false,
    }));
  }
  function setQuery (){
    setNavLinkState((prev) => ({
      ...prev,
      QR: false,
      p2p: false,
      rtp: false,
      return: false,
      qurey: true,
    }));
  }
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
    }));
  }
  // -- Tokenization request to backend
  // -- Tokenization request to backend
  const requestToken = async (e) => {
    e.preventDefault();
    setFormState.Loading(true);

    try {
      const response = await axios.post(
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

  // -- Query Customer request to backend
  // -- Query Customer request to backend
  const queryCustomer = async (e) => {};

  // -- Verification Request to backend  --
  const sendVerificationRequest = async (e) => {
    e.preventDefault();
    setFormState((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      const res = await axios.post(
        "http://localhost:5000/accountVerification",
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
        close_P2P_Verification_Popup();
        open_P2P_Amount_Popup();
        console.log(res.data.creditorName);
      } else {
        close_P2P_Verification_Popup();
        open_P2P_Amount_Popup();
        console.log(res.data.creditorName);
        console.log(res.data.errorcode);
      }

      setFormState((prev) => ({
        ...prev,
        error: null,
      }));
    } catch (err) {
      setFormState((prev) => ({
        ...prev,
        error: err.res?.data || err.message,
      }));
      console.error(err);
      alert(err);
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
      const res = await axios.post("http://localhost:5000/pushpayment", {
        amount: formState.amount,
        debitorAccount: formState.debitorAccount,
        creditorBank: formState.creditorBank,
        creditorAccount: formState.creditorAccount,
      });
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
        console.log("TxFail: " + formState.txFail);
        alert("TxStatus: " + formState.txStatus + "\n" + "TxId: " + formState.txID);
      }

      setFormState((prev) => ({
        ...prev,
        error: null,
      }));
    } catch (err) {
      setFormState((prev) => ({
        ...prev,
        error: err.res?.data || err.message,
      }));
      console.error(err);
      alert(err.res?.data || err.message);
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
    }));

    console.log("Amount: " + formState.amount)
    console.log("DebitorBank: " + formState.debitorBank)
    console.log("DebitorAccount: " + formState.debitorAccount)
    console.log("CreditorBank: " + formState.creditorBank)
    console.log("CreditorAccount: " + formState.creditorAccount)

    try {
      const res = await axios.post("http://localhost:5000/normalRTP", {
        amount: formState.amount,
        debitorAccount: formState.debitorAccount,
        debitorBank: formState.debitorBank,
        creditorBank: formState.creditorBank,
        creditorAccount: formState.creditorAccount,
      });

      const status = res.data.txStatus;
      const UETR = res.data.UETR;
      const AddtlInf = res.data.AddtlInf;
      const debitorName = res.data.creditorName;

      flushSync(() => {
        setFormState(prev => ({
          ...prev,
          txStatus: status,
          UETR: UETR,
          AddtlInf: AddtlInf,
          debitorName: debitorName,
        }));
      });

      // useEffect(() => {
      //   console.log("TxStatus: " + formState.txStatus);
      // }, [formState.txStatus]);
      
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
        // alert("RTP Request Not Received. Try Again! \n TxStatus: " + status + "\n" + "UETR: " + UETR + "\n" + "AddtlInf: " + AddtlInf);
      }

      close_Normal_RTP_Popup()
      close_Blank_RTP_Popup()
      open_RTPReport_Popup()

      setFormState((prev) => ({
        ...prev,
        error: null,
      }));
    } catch (err) {
      setFormState((prev) => ({
        ...prev,
        error: err.res?.data || err.message,
      }));
      console.error(err);
      setFormState((prev) => ({
        ...prev,
        result: null,
      }));
      alert(err);
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
    }));

    console.log(formState.amount)
    console.log(formState.creditorBank)
    console.log(formState.creditorAccount)

    try {
      const res = await axios.post("http://localhost:5000/blankRTP", {
        amount: formState.amount,
        creditorBank: formState.creditorBank,
        creditorAccount: formState.creditorAccount,
      });

      

      setFormState((prev) => ({
        ...prev,
        error: null,
      }));
    } catch (err) {
      setFormState((prev) => ({
        ...prev,
        error: err.res?.data || err.message,
      }));
      console.error(err);
      setFormState((prev) => ({
        ...prev,
        result: null,
      }));
      alert(err);
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
      const res = await axios.post("http://localhost:5000/returnPayment", {
        txID: formState.txID,
      });

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
      setFormState((prev) => ({
        ...prev,
        error: err.res?.data || err.message,
      }));
      console.error(err);
      alert(err);
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
      const res = await axios.post("http://localhost:5000/queryStatus", {
        txID: formState.txID,
      });

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
      setFormState((prev) => ({
        ...prev,
        error: err.res?.data || err.message,
      }));
      console.error(err);
      alert(err);
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
    <div className="sidebar-container d-flex">
      {/* Sidebar */}
      <div className={`sidebar ${collapsed ? "collapsed" : ""} `}>
        <div className="sidebar-header original-header">
          <h3>Customers</h3>
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
              <span>Customers</span>
            </a>
            <i className="bi bi-arrow"></i>
          </div>
          <div className={`sidebar-list ${navLinkState.QR ? "selected" : ""} `}>
            <a onClick={(e) => {
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  customer: false,
                }));
              });
              open_P2P_Verification_Popup()
              setQR()
              }}>
              <span>customers</span>
            </a>
          </div>
          <div className={`sidebar-list ${navLinkState.p2p ? "selected" : ""} `}>
            <a onClick={(e) => {
              setP2P()
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  customer: false,
                }));
              });
              resetStates()
              close_P2P_Amount_Popup()
              close_P2P_Checkout_Popup()
              close_Normal_RTP_Popup()
              close_Blank_RTP_Popup()   
              close_RTPReport_Popup()   
              close_ReturnPayment_Popup()
              close_QueryStatus_Popup() 
              open_P2P_Verification_Popup()
              }}>
              <span>Initiate customer</span>
            </a>
          </div>
          <div className={`sidebar-list ${navLinkState.rtp ? "selected" : ""} `}>
            <a onClick={(e) => {
              setRTP()
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  customer: true,
                }));
              });
              resetStates()
              close_P2P_Verification_Popup()   
              close_P2P_Amount_Popup()
              close_P2P_Checkout_Popup()
              close_Normal_RTP_Popup()
              close_Blank_RTP_Popup()   
              close_RTPReport_Popup()   
              close_ReturnPayment_Popup()
              close_QueryStatus_Popup()        
              open_RTP_Popup()
              }}>
              <span>Pending customer</span>
            </a>
          </div>
          <div className={`sidebar-list ${navLinkState.return ? "selected" : ""} `}>
            <a onClick={(e) => {
              setReturn()
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  customer: false,
                }));
              });
              resetStates()
              close_P2P_Verification_Popup()   
              close_P2P_Amount_Popup()
              close_P2P_Checkout_Popup()
              close_Normal_RTP_Popup()
              close_Blank_RTP_Popup()
              close_RTPReport_Popup()     
              close_QueryStatus_Popup()      
              open_ReturnPayment_Popup()
              }}>
              <span>Return Payment</span>
            </a>
          </div>
          <div className={`sidebar-list ${navLinkState.rtp ? "selected" : ""} `}>
            <a onClick={(e) => {
              setRTP()
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  customer: true,
                }));
              });
              resetStates()
              close_P2P_Verification_Popup()   
              close_P2P_Amount_Popup()
              close_P2P_Checkout_Popup()
              close_Normal_RTP_Popup()
              close_Blank_RTP_Popup()   
              close_RTPReport_Popup()   
              close_ReturnPayment_Popup()
              close_QueryStatus_Popup()        
              open_RTP_Popup()
              }}>
              <span>customer Report</span>
            </a>
          </div>
          <div className={`sidebar-list ${navLinkState.rtp ? "selected" : ""} `}>
            <a onClick={(e) => {
              setRTP()
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  customer: true,
                }));
              });
              resetStates()
              close_P2P_Verification_Popup()   
              close_P2P_Amount_Popup()
              close_P2P_Checkout_Popup()
              close_Normal_RTP_Popup()
              close_Blank_RTP_Popup()   
              close_RTPReport_Popup()   
              close_ReturnPayment_Popup()
              close_QueryStatus_Popup()        
              open_RTP_Popup()
              }}>
              <span>customer Report</span>
            </a>
          </div>
          <div className={`sidebar-list ${navLinkState.rtp ? "selected" : ""} `}>
            <a onClick={(e) => {
              setRTP()
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  customer: true,
                }));
              });
              resetStates()
              close_P2P_Verification_Popup()   
              close_P2P_Amount_Popup()
              close_P2P_Checkout_Popup()
              close_Normal_RTP_Popup()
              close_Blank_RTP_Popup()   
              close_RTPReport_Popup()   
              close_ReturnPayment_Popup()
              close_QueryStatus_Popup()        
              open_RTP_Popup()
              }}>
              <span>customer Report</span>
            </a>
          </div>
          <div className={`sidebar-list ${navLinkState.rtp ? "selected" : ""} `}>
            <a onClick={(e) => {
              setRTP()
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  customer: true,
                }));
              });
              resetStates()
              close_P2P_Verification_Popup()   
              close_P2P_Amount_Popup()
              close_P2P_Checkout_Popup()
              close_Normal_RTP_Popup()
              close_Blank_RTP_Popup()   
              close_RTPReport_Popup()   
              close_ReturnPayment_Popup()
              close_QueryStatus_Popup()        
              open_RTP_Popup()
              }}>
              <span>customer Report</span>
            </a>
          </div>
          <div className="sidebar-title">
            <a href="#">
              <span>Finance</span>
            </a>
            <i className="bi bi-arrow"></i>
          </div>
          <div className={`sidebar-list ${navLinkState.qurey ? "selected" : ""} `}>
            <a onClick={(e) => {
              setQuery()
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  customer: false,
                }));
              });
              resetStates()
              close_P2P_Verification_Popup()   
              close_P2P_Amount_Popup()
              close_P2P_Checkout_Popup()
              close_Normal_RTP_Popup()
              close_Blank_RTP_Popup()   
              close_RTPReport_Popup()   
              close_ReturnPayment_Popup()        
              open_QueryStatus_Popup()
              }}>
              <span>Adjust Account Balance</span>
            </a>
          </div>
        </nav>
      </div>

      <div className="main ">
        {/* {formState.customer &&  */}
        {/* <CustomerTable
          formState={formState}
          setFormState={setFormState}
          sendVerificationRequest={sendVerificationRequest}
          resetStates={resetStates}
        />
        
        <AddCustomer
          formState={formState}
          setFormState={setFormState}
          resetStates={resetStates}
        /> */}
        {/* } */}
        

      </div>
    </div>
    </>
  );
}
