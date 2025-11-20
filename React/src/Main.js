import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Main.css";

function Main() {
  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-12">
          <p>
            Sustainability Log is a web application that helps ethical
            organisations create a self-verifiable, timestamped, and easily
            shareable digital record of their sustainability journey.
          </p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12 text-start">
          <ul className="list-unstyled ps-0 mb-0">
            <li className="step step-1">
              Step 1: Log your sustainability actions
              <i className="bi bi-journal-check text-success fs-5 ms-2"></i>
            </li>
            <li className="step step-2">
              Step 2: Add Digital Product Passport information where relevant
              <i className="bi bi-file-earmark-text text-primary fs-5 ms-2"></i>
            </li>
            <li className="step step-3">
              Step 3: Link suppliers as required
              <i className="bi bi-people-fill text-warning fs-5 ms-2"></i>
            </li>
            <li className="step step-4">
              Step 4: Automatically anchored on the blockchain
              <i className="bi bi-link-45deg text-danger fs-5 ms-2"></i>
            </li>
            <li className="step step-5">
              Step 5: Share your sustainability story with stakeholders via URL
              or QR code
              <i className="bi bi-share-fill text-info fs-5 ms-2"></i>
            </li>
          </ul>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <img
            src="/TimelineSample.png"
            className="img-fluid w-100"
            alt="Sustainability timeline"
          />
        </div>
      </div>
    </div>
  );
}

export default Main;
