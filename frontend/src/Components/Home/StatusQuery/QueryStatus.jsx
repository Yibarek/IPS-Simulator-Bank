import React, { useState } from "react";
import Select from "react-select";
import { selectStyles } from "../../../selectStyles";
import { getUserErrorMessage } from "../../../errorMessage";
import api from "../../../api";

// import Services from "./Components/Home/P2P/Services";
import { flushSync } from "react-dom";
import NotFound from "../../../NotFound";

// -- Return Payment POPUP  --
export function open_QueryStatus_Popup() {
  document.getElementById("query-status-popup").style.display = "block";
}

export function close_QueryStatus_Popup() {
  document.getElementById("query-status-popup").style.display = "none";
}

let txReason = '';
let txStatus = '';

function QueryStatus({ formState, setFormState }) {
  const updateField = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const [id, setId] = useState(null);
  const idOptions = [
    { value: "TxId", label: "TxId" },
    { value: "UETR", label: "UETR" },
  ];
  const [showP2P, setShowP2P] = useState(false)
  const [showRTP, setShowRTP] = useState(false)
  const [showNotFound, setShowNotFound] = useState(false)
  
  // -- Query Status Request to backend  --
  const sendQueryStatusRequest = async (e) => {
    e.preventDefault();

    updateField("loading", true)

    console.log("TxId: " + formState.txID)

    try {
      const res = await api.post("http://localhost:5000/queryStatus", {
        Id: formState.txID,
      }
    );

      txStatus = res.data.txStatus;
      if (txStatus == "ACSC") {
        flushSync(() => {
          updateField("txSuccess", true)
          updateField("txFail", false)
        });
      }
      else{
        flushSync(() => {
          updateField("txSuccess", false)
          updateField("txFail", true)
        });
      }

      txReason = res.data.AddtlInf;
      const amount = res.data.amount;
      const creditorName = res.data.creditorName;
      const debitorName = res.data.debitorName;
      const creditorAccount = res.data.creditorAccount;
      const debitorAccount = res.data.debitorAccount;
      const debitorBank = res.data.debitorBank;
      const creditorBank = res.data.creditorBank;

      flushSync(() => {
          updateField("txStatus", txStatus);
          updateField("txReason", txReason);
          updateField("creditorName", creditorName);
          updateField("creditorAccount", creditorAccount);
          updateField("debitorAccount", debitorAccount);
          updateField("creditorBank", creditorBank);
          updateField("debitorBank", debitorBank);
          updateField("amount", amount);
          updateField("debitorName", debitorName);
      });
      
      const id = String(formState.txID);
      const idLength = id.length;
      if (txReason === "Transaction not found" || !txStatus){
        setShowNotFound(true)
      }
      else if (idLength === 36 && txStatus){
        setShowRTP(true)
      }
      else if (idLength < 36 && txStatus){
        setShowP2P(true)
      }
      document.getElementById("id").value = "";
      // useEffect(() => {
      //   console.log("TxStatus: " + formState.txStatus);
      // }, [formState.txStatus]);
      
      console.log("TxStatus: " + txStatus + "\n Reason: " + txReason);


      updateField("error", null)
    } catch (err) {
      const message = getUserErrorMessage(err);
      alert(message); // show to user
      
      updateField("error", message)
      console.error(message);

      updateField("result", null);
    } finally {
      updateField("loading", false);
    }
  };

  return (
    <>
    {formState.displayQuery && (
      
      <div
        id="query-status-popup"
        className="checkout-container"
        // style={{display: "none" }}
        // style={{ marginTop: "-120px", display: "none" }}
        >
        <button
          className="btn close-btn"
          onClick={(e) => {
            close_QueryStatus_Popup();
            flushSync(() => {
              updateField("home", true);
              updateField("displayQuery", false);
              setShowNotFound(false);
              setShowP2P(false);
              setShowRTP(false);
            });
          }}
          style={{ cursor: "pointer", position: "fixed", margin: "20px" }}
        >
          {" "}
          X{" "}
        </button>
        <div className="form-panel">
          <h3
            className="mb-3 popup-title "
            style={{
              color: "green",
              fontWeight: "600",
              fontSize: "30px",
              width: "100%",
              minWidth: "100%",
              // maxHeight: "80px",
              marginTop: "5px",
            }}
          >
            Query Status
          </h3>

          <div class="container">
            <div class="row justify-content-center">
              <div class="col-md-6">
                <form>
                  <div class="input-group m-0">
                    <Select
                      className=""
                      id="creditorBank"
                      options={idOptions}
                      value={idOptions.find((option) => option.value === id)}
                      onChange={(selectedIdType) => setId(selectedIdType.value)}
                      defaultValue={idOptions[0]}
                      styles={selectStyles}
                    />
                    <input
                      type="text"
                      id="id"
                      class="form-control ml-4 mr-4"
                      placeholder="Search..."
                      style={{ height: "38px" }}
                      value={formState.txID}
                      onChange={(e) => {
                        updateField("txID", e.target.value);
                      }}
                    ></input>
                    <button
                      className="btn btn-primary d-flex align-items-center justify-content-center"
                      type="submit"
                      style={{ height: "38px", maxWidth: "30px" }}
                      onClick={sendQueryStatusRequest}
                      disabled={formState.loading}
                    >
                      {formState.loading ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <i className="bi bi-search"></i>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {showP2P && !showNotFound && !showRTP && <div
                      className="form-panel "
                      style={{ minWidth: "670px", width: "100%", marginTop: "20px" }}
                    >
                      {/* {formState.creditorName && ( */} 
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
                                  Status : 
                                </th>
                                <td
                                  className="fw-bold fs-6 bi bi-check-circle "
                                  style={{
                                    color: "green",
                                    paddingLeft: "10px",
                                    textAlign: "left",
                                    fontSize: "20px",
                                  }}
                                >
                                  {" "}
                                  Success
                                  <h5 style={{color:"orange"}}>{txReason && txReason}</h5>
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
                       {/* )}  */}
                             
                      {/* Submit Button */}
                      <div className="d-flex justify-content-center pt-3">
                        
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
                    }

                    {showNotFound && !showRTP && !showP2P && <div
                      className="form-panel"
                      style={{ minWidth: "670px", width: "100%", marginTop: "20px" }}
                    >
                      <h4 style={{color: "orange"}}>{txReason}</h4>
                    </div>
                    }

                    {showRTP && !showP2P && !showNotFound && <div
                      className="form-panel"
                      style={{ minWidth: "670px", width: "100%", marginTop: "20px" }}
                    >
                      <h4 >Status: <b style={{color: "orange"}}>{txStatus}</b></h4>
                      <h4 >Reason: <b style={{color: "orange"}}>{txReason}</b></h4>
                    </div>
                    }
      </div>)}
    </>
  );
}

export default QueryStatus;
