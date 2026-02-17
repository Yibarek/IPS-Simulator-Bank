import React, { useState, useEffect } from "react";
import Select from "react-select";
import { flushSync } from "react-dom";
import { selectStyles } from "../../../selectStyles";
import { getUserErrorMessage } from "../../../errorMessage";
import "../../../assets/css/InputForm.css";
import api from "../../../api";
import bic from "../../../bic";
import socket from "../../../Socket.js";
import SuccessPopup from "./popupMessage";
import { open_Customer_Table } from "./CustomerTable.jsx"

// -- P2P verification Page --
export function open_AddCustomer() {
  document.getElementById("checkout-container-customer").style.display = "block";
}

export function close_AddCustomer() {
  document.getElementById("checkout-container-customer").style.display = "none";
}


export default function AddCustomer( {formState, setFormState} ) {
  const updateField = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [status, setStatus] = useState("ACTIVE");
  const [type, setType] = useState("INDIVIDUAL");
  const [phone, setPhone] = useState(null);
  const [email, setEmail] = useState(null);
  const [nid, setNid] = useState(null);
//   const [birthdate, set] = useState(null);
  const [account, setAccount] = useState(null);
  const [currency, setCurrency] = useState("230");
  const [isCurrencyDisabled, setIsCurrencyDisabled] = useState(true);
  const [loading, setLoading] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const statusOptions = [
    { value: "ACTIVE", label: "ACTIVE" },
    { value: "BLOCKED", label: "BLOCKED" },
    { value: "SUSPENDED", label: "SUSPENDED" },
    { value: "INVALID", label: "INVALID" },
    { value: "TIMEOUT", label: "TIMEOUT" },
    { value: "INACTIVE", label: "INACTIVE" },
    { value: "FOREIGN", label: "FOREIGN" },
    { value: "LOAN", label: "LOAN" },
  ];

  const typeOptions = [
    { value: "INDIVIDUAL", label: "INDIVIDUAL" },
    { value: "BUSINESS", label: "BUSINESS" },
  ];

  const currencyOptions = [
    { value: "230", label: "ETB" },
    { value: "240", label: "USD" },
    { value: "250", label: "RMB" },
    { value: "260", label: "EUR" },
  ];

  
  // -- AddCustomer Request to backend  --
  const sendAddCustomerRequest = async (e) => {
    // const nextStepFinal = () => {
    if (
      !firstname ||
      !lastname ||
      !status ||
      !phone ||
      !email ||
      !nid ||
      !account
    ) {
      triggerNotification();
      return;
    }
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/addCustomer", {
        firstname:firstname,
        lastname: lastname,
        type: type,
        status: status,
        phone: phone,
        email: email,
        nid: nid,
        account: account,
        currency:  currency,
      });

      if (res.data.message === "success") {
        console.log("Registration Status :  Customer Registered Successfully!");
        // setPopup(res.data.message);
        setShowPopup(true);
      } 
      else if (res.data.message === "fail") {
        console.log("Customer Registration Failled : Customer Registration Failled!");
        triggerErrorNotification()
        // alert("Registration failed");
      }

    } catch (err) {
      const message = getUserErrorMessage(err);
      // alert(message); // show to user
      updateField("error", message);
      triggerErrorNotification(message)
      console.error(message);
    //   updateField("result", null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (showPopup) {
    const timer = setTimeout(() => {
      setShowPopup(false);

      console.log("Popup closed after 10 seconds");
      open_Customer_Table()
      // navigate("/customers");
      // resetForm();
      // fetchData();

    }, 10000);

    // cleanup (important!)
    return () => clearTimeout(timer);
  }
}, [showPopup]);

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
    // sendPushPaymentRequest();
    setTimeout(() => window.location.reload(), 2000);
  };

  
  return (
    <>
        <div className="checkout-container" id="checkout-container-customer" style={{display: "none"}}>
          <button
            className="btn close-btn"
            onClick={(e) => {
              close_AddCustomer()
              open_Customer_Table()
            }}
            style={{ cursor: "pointer", marginTop: "10px", marginRight: "20px"}}
          >
            {" "}
            X{" "}
          </button>
          <div className="form-panel">
            <h1 className="h3 fw-bold mb-4" style={{ color: "green" }}>
              Add New Customer
            </h1>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div className="form-step active">
                  <div className="row g-6">
                    <div className="col-md-6">
                      <label
                        htmlFor="debitorBank"
                        style={{ fontWeight: "bold", fontSize: "14px", marginTop: "25px" }}
                        className="form-label"
                      >
                        First Name <i style={{color: "red"}}> * </i>
                      </label>
                      <input
                        className="form-control col-md-6"
                        name="firstname"
                        placeholder="firstname"
                        value={firstname}
                        onChange={(e) => {
                          setFirstname(e.target.value)
                        }}>
                      </input>
                  </div>
                  
                  <div className="col-md-6">
                      <label
                        htmlFor="debitorBank"
                        style={{ fontWeight: "bold", fontSize: "14px", marginTop: "25px" }}
                        className="form-label"
                      >
                        Last Name <i style={{color: "red"}}> * </i>
                      </label>
                      <input
                        className="form-control col-md-6"
                        name="lastname"
                        placeholder="lastname"
                        value={lastname}
                        onChange={(e) => {
                          setLastname(e.target.value)
                        }}>
                      </input>
                    </div>
                  </div>

                  <div className="row g-6">
                    <div className="col-md-6">
                      <label
                        htmlFor="lastname"
                        style={{ fontWeight: "bold", fontSize: "14px", marginTop: "25px"  }}
                        className="form-label"
                      >
                        Customer Type <i style={{color: "red"}}> * </i>
                      </label>
                      <Select
                        className=""
                        id="type"
                        options={typeOptions}
                        defaultValue={typeOptions[0]}
                        value={typeOptions.find(
                          (option) => option.value === type,
                        )}
                        onChange={(selectedType) =>
                          setType(selectedType.value)
                        }
                        isDisabled={true}
                        styles={selectStyles}
                      />
                    </div>

                    <div className="col-md-6">
                      <label
                        htmlFor="lastname"
                        style={{ fontWeight: "bold", fontSize: "14px", marginTop: "25px"  }}
                        className="form-label"
                      >
                        Status <i style={{color: "red"}}> * </i>
                      </label>
                      <Select
                        className=""
                        id="status"
                        options={statusOptions}
                        value={statusOptions.find(
                          (option) => option.value === status,
                        )}
                        defaultValue={statusOptions[0]}
                        onChange={(selectedStatus) =>{
                          setStatus(selectedStatus.value);
                          if (selectedStatus.value != "FOREIGN") {
                            setIsCurrencyDisabled(true);
                            setCurrency(currencyOptions[0].value)
                          }else{
                            setIsCurrencyDisabled(false);
                          }
                        }
                        }
                        styles={selectStyles}
                      />
                    </div>
                  </div>

                  <div className="row g-6">
                    <div className="col-md-6">
                      <label
                        htmlFor="debitorBank"
                        style={{ fontWeight: "bold", fontSize: "14px", marginTop: "25px"   }}
                        className="form-label"
                      >
                        Phone <i style={{color: "red"}}> * </i>
                      </label>
                      <input
                        className="form-control col-md-6"
                        name="phone"
                        placeholder="phone"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value)
                        }}>
                      </input>
                  </div>
                  
                  <div className="col-md-6">
                      <label
                        htmlFor="debitorBank"
                        style={{ fontWeight: "bold", fontSize: "14px", marginTop: "25px"   }}
                        className="form-label"
                      >
                        Email <i style={{color: "red"}}> * </i>
                      </label>
                      <input
                        className="form-control col-md-6"
                        type="email"
                        name="email"
                        placeholder="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                        }}>
                      </input>
                    </div>
                  </div>

                  <div className="row g-6">
                    <div className="col-md-6">
                      <label
                        htmlFor="debitorBank"
                        style={{ fontWeight: "bold", fontSize: "14px", marginTop: "25px"   }}
                        className="form-label"
                      >
                        Account No <i style={{color: "red"}}> * </i>
                      </label>
                      <input
                        className="form-control col-md-6"
                        name="account"
                        placeholder="account"
                        value={account}
                        onChange={(e) => {
                          setAccount(e.target.value)
                        }}>
                      </input>
                  </div>
                  
                  <div className="col-md-6" disabled>
                      <label
                        htmlFor="debitorBank"
                        style={{ fontWeight: "bold", fontSize: "14px", marginTop: "25px"   }}
                        className="form-label"
                      >
                        Currency <i style={{color: "red"}}> * </i>
                      </label>
                      <Select
                        className=""
                        id="type"
                        options={currencyOptions}
                        value={currencyOptions.find(
                          (option) => option.value === currency,
                        )}
                        onChange={(selectedCurrency) =>
                          setCurrency(selectedCurrency.value)
                        }
                        isDisabled={isCurrencyDisabled}
                        defaultValue={currencyOptions[0]}
                        styles={selectStyles}
                      />
                    </div>
                  </div>

                  <div className="row g-6">
                                     
                  <div className="col-md-6">
                      <label
                        htmlFor="debitorBank"
                        style={{ fontWeight: "bold", fontSize: "14px", marginTop: "25px"   }}
                        className="form-label"
                      >
                        National Id <i style={{color: "red"}}> * </i>
                      </label>
                      <input
                        className="form-control col-md-6"
                        type="nid"
                        name="nid"
                        placeholder="nid"
                        value={nid}
                        onChange={(e) => {
                          setNid(e.target.value)
                        }}>
                      </input>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={sendAddCustomerRequest}
                      disabled={loading}
                    >
                      {loading ? "Requesting..." : "Register"}
                    </button>
                  </div>
                </div>

            </form>
          </div>

          {/* Notification */}
          <div
            className={`notification-message ${showNotification ? "show" : ""}`}
          >
            Please fill out all required information
              
          </div>

          <div
            className={`notification-message ${showErrorNotification ? "show" : ""}`}
          >
            {formState.error}
          </div>
          <SuccessPopup
            show={showPopup}
            message="Customer registered successfully!"
            onClose={() => setShowPopup(false)}
          />
        </div>
    </>
  );
}
