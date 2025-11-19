import React from "react";
import "./Main.css";

function Main() {
  return (
    <div className="container">
      <div className="row">
        {/* Left column: intro + 5-step process */}
        <div className="col-12 col-md-6">
          <p>
            Sustainability Log is a web application that helps ethical
            organisations create a self-verifiable, timestamped, and easily
            shareable digital record of their sustainability journey.
          </p>

          <ul className="list-group list-group-numbered">
            <li className="list-group-item">Log your sustainability actions</li>
            <li className="list-group-item">
              Add Digital Product Passport information where relevant
            </li>
            <li className="list-group-item">Link suppliers as required</li>
            <li className="list-group-item">
              Automatically anchored on the blockchain
            </li>
            <li className="list-group-item">
              Share your sustainability story with stakeholders via URL or QR
              code
            </li>
          </ul>
        </div>

        {/* Right column: timeline mock-up */}
        <div className="col-12 col-md-6">
          <div className="card">
            {/* Replace with real timeline screenshot */}
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

/*
import React from "react";
import "./Main.css";

function Main() {
  return (
    <div>
      <p>
        Sustainability Log is a web application that helps ethical organisations
        create a self-verifiable, timestamped, and easily shareable digital
        record of their sustainability journey. The aim is not to rate
        organisations but to empower them to build trust through transparency,
        focusing on the timeline of progress. The application is built with
        React (frontend), PHP (backend), MySQL (database), and Solidity smart
        contract (blockchain).
      </p>

      <p>
        It allows an organisation to enter data related to its sustainability
        efforts; the application logs this data to the blockchain by emitting
        events and provides a publicly accessible timeline of sustainability
        logs over time, demonstrating the organisation's progress on its
        sustainability journey. Organisations can link their suppliers into the
        same timeline, creating a verifiable record of their broader supply
        chain or market impact.
      </p>

      <p>
        Each timeline is automatically converted into a dedicated URL and QR
        code, allowing it to be easily shared or displayed. In addition, an
        organisation can generate a unique URL and QR code for any individual
        product or service within its timeline, making it simple to communicate
        specific sustainability achievements directly to customers and partners.
      </p>

      <p>
        The value lies in enabling organisations to demonstrate, in a verifiable
        and transparent way, their sustainability journey to their stakeholders
        - from customers and suppliers to the wider community.
      </p>
    </div>
  );
}

export default Main;
*/
