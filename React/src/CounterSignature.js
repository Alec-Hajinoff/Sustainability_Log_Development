// This file allows a user to search for company name in the UI and see its data.

import React, { useState } from "react";
import "./CounterSignature.css";
import { agreementHashFunction } from "./ApiService";

function CounterSignature() {
  const [searchTerm, setSearchTerm] = useState("");
  const [agreements, setAgreements] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 2) {
      // Start searching after 3 characters.
      try {
        const data = await agreementHashFunction(term); // Checks a company's name in the database and fetches the associated data.
        if (data.status === "success") {
          setAgreements(data.agreements);
          setErrorMessage("");
        } else {
          setAgreements([]);
          setErrorMessage(data.message);
        }
      } catch (error) {
        setErrorMessage(error.message);
        setAgreements([]);
      }
    } else {
      setAgreements([]);
      setErrorMessage("");
    }
  };

  const handleFileDownload = (fileData, fileName) => {
    try {
      // Converts base64 string we got from the backend to binary data for PDF download.
      const binaryString = atob(fileData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "application/pdf" }); // Creates a Blob object with data array (first parameter) and data type (second parameter).
      const url = URL.createObjectURL(blob); // Creates a temporary URL for the object in browser's memory.

      // Creates the download link and triggers the click.
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleans up afterwards.
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Download error:", error);
      setErrorMessage("Failed to download PDF file");
    }
  };

  return (
    <div className="container">
      <div className="form-group row mb-3 text-start">
        <label className="col-sm-2 col-form-label">
          Search for a company:
        </label>
        <div className="col-sm-10">
          <input
            type="text"
            className="form-control"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Enter company name"
          />
        </div>
      </div>

      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {agreements.length > 0 && (
        <div className="row">
          <div className="col">
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Files</th>
                  <th>Timestamp</th>
                  <th>Hash</th>
                </tr>
              </thead>
              <tbody>
                {agreements.map((agreement, index) => (
                  <tr key={index}>
                    <td>{agreement.description}</td>
                    <td>
                      <button
                        className="btn btn-link"
                        onClick={() =>
                          handleFileDownload(
                            agreement.files,
                            `agreement_${agreement.hash}.pdf`
                          )
                        }
                      >
                        Download PDF
                      </button>
                    </td>
                    <td>{new Date(agreement.timestamp).toLocaleString()}</td>
                    <td>{agreement.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3">
              <a
                href="https://sepolia.explorer.zksync.io/address/0x82c086a29C39Cf184050A0687652f4e16b392014#events"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                To verify an entry, click to open the blockchain explorer and
                search using the hash.
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CounterSignature;
