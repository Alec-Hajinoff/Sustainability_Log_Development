import React from "react";
import "./Main.css";

function Main() {
  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <p>
            Sustainability Log is a web application that helps ethical
            organisations create a self-verifiable, timestamped, and easily
            shareable digital record of their sustainability journey.
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-6">
          <div className="text-start">
            <ul className="list-unstyled ps-0 mb-0">
              <li>Step 1: Log your sustainability actions</li>
              <li>
                Step 2: Add Digital Product Passport information where relevant
              </li>
              <li>Step 3: Link suppliers as required</li>
              <li>Step 4: Automatically anchored on the blockchain</li>
              <li>
                Step 5: Share your sustainability story with stakeholders via
                URL or QR code
              </li>
            </ul>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card">
            <img
              src="/TimelineSample.png"
              className="card-img-top img-fluid"
              alt="Sustainability timeline"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
