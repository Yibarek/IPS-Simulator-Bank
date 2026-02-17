import React, {useState} from 'react'
import axios from "axios"
import { flushSync } from "react-dom";

// -- Return Payment POPUP  --
export function open_AutoTest() {
  document.getElementById("autoTest").style.display = "block";
}

export function close_AutoTest() {
  document.getElementById("autoTest").style.display = "none";
}

const AutoTest = ( {formState, setFormState, testId, status, overallProgress, steps }) => {
  const updateField = (key, value) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const [expandedSteps, setExpandedSteps] = useState({});

  const toggleStep = (index) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getStatusBadge = () => {
    switch (status) {
      case "Completed":
        return "bg-success";
      case "Failed":
        return "bg-danger";
      case "In Progress":
        return "bg-warning text-dark";
      default:
        return "bg-secondary";
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return "bg-success";
    if (progress > 0 && progress < 100) return "bg-warning";
    return "bg-secondary";
  };

  return (
    <>
    {formState.autoTest && 
    <div className='checkout-container' id='autoTest' style={{marginTop: "-50px"}}>
        
       {/* <section className="working-process my-5 form-panel"> */}
            <div className="working-process my-5 form-panel shadow border-0 rounded-4">
                <button
                  className="btn close-btn"
                  onClick={(e) => {
                    // close_AutoTest();
                    flushSync(() => {
                      updateField("home", true);
                      updateField("autoTest", false);
                    });
                  }}
                  style={{ cursor: "pointer", position: "fixed", marginTop: "-12px", marginRight: "17px" }}
                >
                  {" "}
                  X{" "}
                </button>
      {/* HEADER */}
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        
        <div>
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
            Automated Test
          </h3>
          <div className="text-muted" style={{marginLeft: "-60px"}}>Test ID: {testId}</div>
        </div>

        <span className={`badge ${getStatusBadge()}`}>
          {status}
        </span>
      </div>

      {/* BODY */}
      <div className="card-body">

        {/* Overall Progress */}
        <div className="">
          <div className="d-flex justify-content-between ">
            <small className="fw-semibold" style={{color: "green"}}>Overall Progress</small>
            <small>{overallProgress}%</small>
          </div>

          <div className="progress rounded-pill" style={{ height: "14px" }}>
            <div
              className={`progress-bar progress-bar-striped progress-bar-animated ${getProgressColor(
                overallProgress
              )}`}
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* STEPS */}
        {steps.map((step, index) => (
          <div key={index} className="card  border-0 shadow-sm rounded-3" style={{padding: "5px"}}>

            {/* Step Header */}
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <div>
                <strong style={{marginLeft: "20px"}}>{step.title}</strong>
                <i className="small text-muted">{step.description}</i>
              </div>
            
            {/* Step Progress Bar */}
              <div className="" style={{minWidth: "30%", right: "70px", position: "absolute"}}>
                <div className="d-flex justify-content-between">
                  <small style={{color: "white"}}>-</small>
                  <small>{step.progress}%</small>
                </div>

                <div className="progress" style={{ height: "10px" }}>
                  <div
                    className={`progress-bar ${getProgressColor(
                      step.progress
                    )}`}
                    style={{ width: `${step.progress}%` }}
                  ></div>
                </div>
              </div>

              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => toggleStep(index)}
              >
                <i
                  className={`bi ${
                    expandedSteps[index]
                      ? "bi-chevron-up"
                      : "bi-chevron-down"
                  }`}
                ></i>
              </button>
            </div>

            {/* Step Body */}
            <div className="card-body">

              {/* Detailed Activities */}
              {expandedSteps[index] && (
                <div className="">
                  {step.activities.map((activity, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center border-bottom"
                    >
                      <div className='p-1'>
                        <label className="fw-semibold">
                          {activity.name}  
                        </label>
                        <label className="small text-muted" style={{marginLeft: "20px"}}>
                          {activity.detail}
                        </label>
                      </div>

                      <span
                        className={`badge ${
                          activity.status === "completed"
                            ? "bg-success"
                            : activity.status === "in-progress"
                            ? "bg-warning text-dark"
                            : activity.status === "failed"
                            ? "bg-danger"
                            : "bg-secondary"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
        {/* </section> */}
    </div>}
    </>
  )
}

export default AutoTest