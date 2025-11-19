import React from "react";
import "./Main.css";

function Main() {
  return (
    <div className="container">
      {/* Intro paragraph spanning full width */}
      <div className="row">
        <div className="col-12">
          <p>
            Sustainability Log is a web application that helps ethical
            organisations create a self-verifiable, timestamped, and easily
            shareable digital record of their sustainability journey.
          </p>
        </div>
      </div>

      {/* Two-column layout underneath */}
      <div className="row">
        {/* Left column: steps */}
        <div className="col-12 col-md-6">
          <ul className="list-group list-group-numbered text-start">
            <li className="list-group-item">
              Step 1: Log your sustainability actions
            </li>
            <li className="list-group-item">
              Step 2: Add Digital Product Passport information where relevant
            </li>
            <li className="list-group-item">
              Step 3: Link suppliers as required
            </li>
            <li className="list-group-item">
              Step 4: Automatically anchored on the blockchain
            </li>
            <li className="list-group-item">
              Step 5: Share your sustainability story with stakeholders via URL
              or QR code
            </li>
          </ul>
        </div>

        {/* Right column: timeline mock-up */}
        <div className="col-12 col-md-6">
          <div className="card">
            {/* Replace with real timeline screenshot later */}
            <img
              src="https://s3.amazonaws.com/thumbnails.venngage.com/template/9c5e68ba-fdd1-4617-b949-65ca6933a256.png"
              className="card-img-top img-fluid"
              alt="Sustainability timeline mock-up"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
