// This file allows a user to search for company name in the UI and see its data.

import React, { useState } from "react";
import "./CounterSignature.css";
import { counterSigned, agreementHashFunction } from "./ApiService";

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
        const data = await agreementHashFunction(term);
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
    const blob = new Blob([Buffer.from(fileData, "base64")]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "document";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="container">
      <div className="form-group row mb-3">
        <label className="col-sm-4 col-form-label text-end">
          Search for a company:
        </label>
        <div className="col-sm-8">
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
                            `document_${agreement.hash}.pdf`
                          )
                        }
                      >
                        Download
                      </button>
                    </td>
                    <td>{new Date(agreement.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CounterSignature;
