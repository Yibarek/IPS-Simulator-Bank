import React from "react";
// import "./SuccessPopup.css";

const popupMessage = ({ show, onClose, message, detail, orgnlTxId, RtrId }) => {
  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <h2 style={{color: "red"}}><i className="bi bi-x-circle-lg"></i> Failed</h2>
        <p style={{textAlign: "left"}}>Return Id: {RtrId}</p>
        <p style={{textAlign: "left"}}>orgnl TxId: {orgnlTxId}</p>
        <p>{message}</p>
        <p style={{color: "red"}}>{detail}</p>

        <button onClick={onClose} className="popup-btn" style={{color: "red", backgroundColor: "orange"}}>
          OK
        </button>
      </div>
    </div>
  );
};

export default popupMessage;
