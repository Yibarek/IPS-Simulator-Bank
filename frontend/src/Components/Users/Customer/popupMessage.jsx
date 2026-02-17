import React from "react";
// import "./SuccessPopup.css";

const popupMessage = ({ show, onClose, message }) => {
  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <h2><i className="bi bi-check-lg"></i> Success</h2>
        <p>{message}</p>

        <button onClick={onClose} className="popup-btn">
          OK
        </button>
      </div>
    </div>
  );
};

export default popupMessage;
