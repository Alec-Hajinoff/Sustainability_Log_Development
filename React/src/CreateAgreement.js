// When a user inputs text into the text box & uploads a file - this is the file that is responsible.

import React, { useState, useEffect } from "react";
import "./CreateAgreement.css";
import LogoutComponent from "./LogoutComponent";
import { createAgreementFunction, userDashboard } from "./ApiService";

function CreateAgreement() {
  const [textHash, setTextHash] = useState("");
  const [formData, setFormData] = useState({
    agreement_text: "",
    file: null,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreements, setAgreements] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await userDashboard(); // Fetches data from the database to populate the dashboard.
        if (data.status === "success") {
          setAgreements(data.agreements);
          setErrorMessage("");
        }
      } catch (error) {
        setErrorMessage("Failed to load agreements");
      }
    };
    fetchDashboard();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setTextHash("");
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0],
    });
    setTextHash("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData(); // We are combining text and file into payload to be sent to backend - this is not concatenation for hashing.
    submitData.append("agreement_text", formData.agreement_text);
    if (formData.file) {
      submitData.append("file", formData.file);
    }

    try {
      const data = await createAgreementFunction(submitData);
      if (data.success) {
        setTextHash(data.hash);
      } else {
        setErrorMessage("Submission failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
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
      <div>
        <p>
          To add a sustainability action or event, type a description in the
          text box, attach any supporting document, and click Submit.
        </p>
      </div>
      <div className="d-flex justify-content-end mb-3">
        <LogoutComponent />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="agreementText">
            For example: ‘We installed solar panels’ or ‘We reduced waste by
            switching to recyclable packaging.’
          </label>
          <textarea
            id="agreementText"
            className="form-control"
            rows="10"
            name="agreement_text"
            value={formData.agreement_text}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="fileUpload">
            Upload a supporting document (e.g. an invoice or certificate):
          </label>
          <input
            type="file"
            id="fileUpload"
            className="form-control"
            onChange={handleFileChange}
          />
        </div>

        {/* Display hash if available */}
        {textHash && (
          <div className="alert alert-info">
            <strong>Record hash:</strong>
            <br />
            <code>{textHash}</code>
          </div>
        )}

        <div className="d-flex justify-content-end mb-3">
          <div id="error-message" className="error" aria-live="polite">
            {errorMessage}
          </div>
          <button type="submit" className="btn btn-secondary" id="loginBtnOne">
            Submit
            <span
              role="status"
              aria-hidden="true"
              id="spinnerLogin"
              style={{ display: loading ? "inline-block" : "none" }}
            ></span>
          </button>
        </div>
        <div className="form-group mb-3">
          <label>
            See your full timeline of submissions below, securely anchored to
            the blockchain:
          </label>
        </div>
      </form>
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

export default CreateAgreement;
