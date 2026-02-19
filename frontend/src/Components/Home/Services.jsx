import axios from "axios";
import { flushSync } from "react-dom";
import { open_P2P_Verification_Popup } from "./P2P/AccVerification";
import { close_P2P_Verification_Popup } from "./P2P/AccVerification";
import NormalRTP, { open_Normal_RTP_Popup } from "./RTP/NormalRTP";
import { open_Blank_RTP_Popup } from "./RTP/BlankRTP";
import { open_ReturnPayment_Popup } from "./ReturnPayment/ReturnPayment";
import { open_QueryStatus_Popup } from "./StatusQuery/QueryStatus";
import { useNavigate } from "react-router-dom";
import {open_requestToken} from './RequestToken'
import {open_RTP_Popup} from './HomeSidebar'
import {close_RTP_Popup} from './HomeSidebar'
import AutoTest from "./AutoTest";

// // -- RTP  POPUP  --
// function open_RTP_Popup() {
//   document.getElementById("rtp-popup").style.display = "block";
// }

// export function close_RTP_Popup() {
//   document.getElementById("rtp-popup").style.display = "none";
// }

export function open_Service_Page() {
  document.getElementById("service-page").style.display = "block";
}
export function close_Service_Page() {
  document.getElementById("service-page").style.display = "none";
}

export function clearStates() {}

function Services({ formState, setFormState, resetStates }) {
  const updateField = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  

  // -- Query Customer request to backend
  // -- Query Customer request to backend
  const queryCustomer = async (e) => {};

  // -- Verification Request to backend  --
  const sendVerificationRequest = async (e) => {
    e.preventDefault();
    updateField("loading", true);

    try {
      const res = await axios.post(
        "http://localhost:5000/accountVerification",
        {
          creditorBank: formState.creditorBank,
          creditorAccount: formState.creditorAccount,
        }
      );
      updateField("creditorName", res.data);

      if (formState.creditorName) {
        close_P2P_Verification_Popup();
      } else {
        close_P2P_Verification_Popup();
        console.log(res.data);
      }

      updateField("error", null);
    } catch (err) {
      updateField("error", err.res?.data || err.message);
      console.error(err);
      updateField("result", null);
    } finally {
      updateField("loading", false);
    }
  };

  // -- PushPayment Request to backend  --
  const sendPushPaymentRequest = async (e) => {
    e.preventDefault();
    updateField("loading", true);

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
        updateField("txStatus", status);
        updateField("txID", TxId);
      });
      // useEffect(() => {
      //   console.log("TxStatus: " + formState.txStatus);
      // }, [formState.txStatus]);
      
      console.log("TxStatus: " + formState.txStatus);
      console.log("TxId: " + formState.txID);

      if (res.data.txStatus == "ACSC") {
        updateField("txSuccess", true);
        console.log("TxSuccess: " + formState.txSuccess);
      } else if (res.data.txStatus == "RJCT") {
        updateField("txFail", true);
        console.log("TxFail: " + formState.txFail);
      }

      // updateField("error", null);
    } catch (err) {
      updateField("error", err.res?.data || err.message);
      console.error(err);
      updateField("result", null);
    } finally {
      updateField("loading", false);
    }
  };

  // -- NormalRTP Request to backend  --
  const sendNormalRTPRequest = async (e) => {
    e.preventDefault();
    updateField("loading", true);

    console.log(formState.amount)
    console.log(formState.debitorAccount)
    console.log(formState.debitorBank)
    console.log(formState.creditorBank)
    console.log(formState.creditorAccount)

    try {
      const res = await axios.post("http://localhost:5000/normalRTP", {
        amount: formState.amount,
        debitorAccount: formState.debitorAccount,
        debitorBank: formState.debitorBank,
        creditorBank: formState.creditorBank,
        creditorAccount: formState.creditorAccount,
      });

      

      updateField("error", null);
    } catch (err) {
      updateField("error", err.res?.data || err.message);
      console.error(err);
      updateField("result", null);
    } finally {
      updateField("loading", false);
    }
  };

  // -- BlankRTP Request to backend  --
  const sendBlankRTPRequest = async (e) => {
    e.preventDefault();
    updateField("loading", true);

    console.log(formState.amount)
    console.log(formState.creditorBank)
    console.log(formState.creditorAccount)

    try {
      const res = await axios.post("http://localhost:5000/blankRTP", {
        amount: formState.amount,
        creditorBank: formState.creditorBank,
        creditorAccount: formState.creditorAccount,
      });

      

      updateField("error", null);
    } catch (err) {
      updateField("error", err.res?.data || err.message);
      console.error(err);
      updateField("result", null);
    } finally {
      updateField("loading", false);
    }
  };

  const navigate = useNavigate();

  return (
    <>
      {/* <!-- Services Section --> */}
      {formState.home && <section id="services" className="services section service-page">
        {/* <!-- Section Title --> */}
        <div className="container section-title" data-aos="fade-up">
          {/* <span className="subtitle">Services</span> */}
          <h2>Services</h2>
        </div>
        {/* <!-- End Section Title --> */}

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
                      updateField("home", false)
                      // updateField("displayRTP", true)
                      updateField("normalrtp", true)
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
                      flushSync(() => {
                      updateField("home", false)
                      // updateField("displayRTP", true)
                      updateField("normalrtp", false)
                    });
                    });
                    close_RTP_Popup();
                    open_Blank_RTP_Popup();
                  }}
                >
                  <i className="bi bi-qr-code"></i> Blank RTP (DQR)
        
                </div>
              </div>
            </div>
        

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            <div
              className="col-lg-2 col-md-10"
              data-aos="zoom-in"
              data-aos-delay="100"
            >
              <div className="service-item">
                <div className="icon-wrapper">
                  <i className="bi bi-qr-code"></i>
                </div>
                <h4>QR Payment</h4>
              </div>
            </div>

            <div
              className="col-lg-2 col-md-10"
              data-aos="zoom-in"
              data-aos-delay="200"
              // onClick={open_P2P_Verification_Popup}
              onClick={(e) => {
                resetStates()
                updateField("home", false)
                updateField("displayVerification", true)
                // updateField("displayReturn", false)
                // updateField("displayQuery", false)
                // updateField("displayToken", false)
                // updateField("displayQR", false)
              open_P2P_Verification_Popup()
              }}
            >
              <div className="service-item ">
                {/* <div className="featured-tag"> IPS </div> */}
                <div className="icon-wrapper">
                  <i className="bi bi-people"></i>
                </div>
                <h4>P2P</h4>
              </div>
            </div>

            <div
              className="col-lg-2 col-md-10"
              data-aos="zoom-in"
              data-aos-delay="200"
              onClick={(e) => {
              resetStates()
              updateField("RtpPaid", false)
              updateField("RtpCancelled", false)
              updateField("RtpRejected", false)
              updateField("RtpRecieved", false)
              updateField("displayVerification", false)
              updateField("displayRTP", true)
              open_RTP_Popup()
              }}
            >
              <div className="service-item ">
                {/* <div className="featured-tag"> IPS </div> */}
                <div className="icon-wrapper">
                  <i className="bi bi-people"></i>
                </div>
                <h4>RTP</h4>
              </div>
            </div>

            <div
              className="col-lg-2 col-md-10"
              data-aos="zoom-in"
              data-aos-delay="400"
              onClick={(e) => {
                 resetStates()
                updateField("home", false)
                flushSync(() => {
                  updateField("displayReturn", true)
                });
                open_ReturnPayment_Popup()
              }}
            >
              <div className="service-item">
                <div className="icon-wrapper">
                  <i className="bi bi-arrow-return-left"></i>
                </div>
                <h4>Return Payment</h4>
              </div>
            </div>

            <div
              className="col-lg-2 col-md-10"
              data-aos="zoom-in"
              data-aos-delay="400"
              onClick={(e) => {
              
              resetStates()
              updateField("home", false)
              updateField("displayQuery", true)
              open_QueryStatus_Popup()
              }}
            >
              <div className="service-item">
                <div className="icon-wrapper">
                  <i className="bi bi-search"></i>
                </div>
                <h4>Query Status</h4>
              </div>
            </div>

            <div
              className="col-lg-2 col-md-10"
              data-aos="zoom-in"
              data-aos-delay="400"
              onClick={(e) => {
                resetStates()
                updateField("home", false)
                // open_requestToken()
                updateField("displayToken", true)
              }}
            >
              <div className="service-item">
                <div className="icon-wrapper">
                  <i className="bi bi-question"></i>
                </div>
                <h4>Request Token</h4>
              </div>
            </div>

          </div>
          <br />
          <br />
          <div className="row mt-5">
            <div className="col-12" data-aos="fade-up" data-aos-delay="200">
              <div className="cta-box">
                <div className="row align-items-center">
                  <div className="col-lg-8">
                    <h3>Automated Testing</h3>
                    <p>
                      Click <b>start</b> to test every scenarios automatically. <b>Comming soon!</b> Automation development is in progress.
                    </p>
                  </div>
                  <div className="col-lg-4 text-lg-end text-center">
                    <a className="cta-btn"
                       style={{cursor: "pointer"}}
                       onClick={(e) => {
                          resetStates()
                          updateField("home", false)
                          flushSync(() => {
                            updateField("autoTest", true)
                          });
                          // open_ReturnPayment_Popup()
                        }}>
                      Start
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>}
      {/* <!-- /Services Section --> */}
    </>
  );
}

export default Services;
