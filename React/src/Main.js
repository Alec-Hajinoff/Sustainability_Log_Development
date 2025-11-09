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
