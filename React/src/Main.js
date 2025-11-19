import React from "react";
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
            </li>
            <li className="step step-2">
              Step 2: Add Digital Product Passport information where relevant
            </li>
            <li className="step step-3">Step 3: Link suppliers as required</li>
            <li className="step step-4">
              Step 4: Automatically anchored on the blockchain
            </li>
            <li className="step step-5">
              Step 5: Share your sustainability story with stakeholders via URL
              or QR code
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
