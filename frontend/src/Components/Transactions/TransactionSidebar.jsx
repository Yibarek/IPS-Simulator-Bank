import { useState, useEffect } from "react";
import axios from "axios";
import { flushSync } from "react-dom";
import { open_P2P_Verification_Popup } from "../Home/P2P/AccVerification";
import { close_P2P_Verification_Popup } from "../Home/P2P/AccVerification";
import { close_Normal_RTP_Popup, open_Normal_RTP_Popup } from "../Home/RTP/NormalRTP";
import { close_Blank_RTP_Popup, open_Blank_RTP_Popup } from "../Home/RTP/BlankRTP";
import { open_ReturnPayment_Popup } from "../Home/ReturnPayment/ReturnPayment"
import { close_ReturnPayment_Popup } from "../Home/ReturnPayment/ReturnPayment"
import { open_QueryStatus_Popup } from "../Home/StatusQuery/QueryStatus"
import { close_QueryStatus_Popup } from "../Home/StatusQuery/QueryStatus"
import TransactionTable from "./TransactionTable";
import { open_TransactionTable } from "./TransactionTable";
import { close_TransactionTable } from "./TransactionTable";

// -- RTP  POPUP  --
function open_RTP_Popup() {
  document.getElementById("rtp-popup").style.display = "block";
}

function close_RTP_Popup() {
  document.getElementById("rtp-popup").style.display = "none";
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);


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
    transaction: true,
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
      transaction: true,
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
    {/* RTP POPUP Content */}
    <div id="rtp-popup" className="rtp-popup" style={{ display: "none", height: "35%", width: "25%", minWidth: "250px", minHeight: "25%"}}>
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
                transaction: false,
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
                transaction: false,
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
          <h3>Transactions</h3>
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
              <span>Transactions</span>
            </a>
            <i className="bi bi-arrow"></i>
          </div>
          <div className={`sidebar-list ${navLinkState.QR ? "selected" : ""} `}>
            <a onClick={(e) => {
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  transaction: true,
                }));
              });
              open_TransactionTable()
              setQR()
              }}>
              <span>Transaction List</span>
            </a>
          </div>
          <div className={`sidebar-list ${navLinkState.p2p ? "selected" : ""} `}>
            <a href="/home">
              <span>Initiate Transaction</span>
            </a>
          </div>
          <div className={`sidebar-list ${navLinkState.rtp ? "selected" : ""} `}>
            <a onClick={(e) => {
              setRTP()
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  transaction: true,
                }));
              });
              resetStates()
              close_P2P_Verification_Popup()   
              close_Normal_RTP_Popup()
              close_Blank_RTP_Popup()   
              close_ReturnPayment_Popup()
              close_QueryStatus_Popup()        
              open_RTP_Popup()
              }}>
              <span>Pending Transaction</span>
            </a>
          </div>
          <div className={`sidebar-list ${navLinkState.return ? "selected" : ""} `}>
            <a onClick={(e) => {
              setReturn()
              flushSync(() => {
                setFormState(prev => ({
                  ...prev,
                  transaction: false,
                }));
              });
              resetStates()
              close_P2P_Verification_Popup()   
              close_Normal_RTP_Popup()
              close_Blank_RTP_Popup()
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
                  transaction: true,
                }));
              });
              resetStates()
              close_P2P_Verification_Popup()   
              close_Normal_RTP_Popup()
              close_Blank_RTP_Popup()   
              close_ReturnPayment_Popup()
              close_QueryStatus_Popup()        
              open_RTP_Popup()
              }}>
              <span>Transaction Report</span>
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
                  transaction: false,
                }));
              });
              resetStates()
              close_P2P_Verification_Popup()   
              close_Normal_RTP_Popup()
              close_Blank_RTP_Popup()   
              close_ReturnPayment_Popup()        
              open_QueryStatus_Popup()
              }}>
              <span>Adjust Account Balance</span>
            </a>
          </div>
        </nav>
      </div>

      <div className="main ">
        {formState.transaction && 
        <TransactionTable
          formState={formState}
          setFormState={setFormState}
          sendVerificationRequest={sendVerificationRequest}
          resetStates={resetStates}
        />}
        

      </div>
    </div>
    </>
  );
}
