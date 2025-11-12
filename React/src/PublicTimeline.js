import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./PublicTimeline.css";
import { fetchTimeline } from "./ApiService";

function PublicTimeline() {
  const { slug } = useParams();
  const [agreements, setAgreements] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    // Tooltip setup
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new window.bootstrap.Tooltip(tooltipTriggerEl);
    });
  }, [agreements]);

  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const data = await fetchTimeline(slug);
        if (data.success) {
          setCompanyName(data.company_name);
          setAgreements(data.actions);
          setErrorMessage("");
        } else {
          setErrorMessage(data.message || "No data found");
        }
      } catch (error) {
        setErrorMessage("Failed to load timeline");
      } finally {
        setLoading(false);
      }
    };

    loadTimeline();
  }, [slug]);

  const handleFileDownload = (fileData, fileName) => {
    try {
      const binaryString = atob(fileData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Download error:", error);
      setErrorMessage("Failed to download PDF file");
    }
  };

  const getCategoryLabel = (category) => {
    const categoryClasses = {
      Sourcing: "category-sourcing",
      Operations: "category-operations",
      Impact: "category-impact",
    };

    const tooltipTexts = {
      Sourcing:
        "How we work with suppliers to reduce environmental impact and improve sustainability",
      Operations:
        "The day‑to‑day steps we take inside the company to reduce waste and energy use, and to support employees and communities",
      Impact:
        "How our products or services help customers reduce their environmental footprint or deliver positive social outcomes",
    };

    return category ? (
      <span
        className={`category-tag ${categoryClasses[category]}`}
        data-bs-toggle="tooltip"
        title={tooltipTexts[category]}
      >
        [{category.toUpperCase()}]
      </span>
    ) : null;
  };

  return (
    <div className="container">
      <h5 className="text-start mb-4">
        Sustainability Timeline: {companyName}
      </h5>

      {loading && <p>Loading...</p>}
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
                    <td>
                      {getCategoryLabel(agreement.category)}
                      {agreement.description}
                    </td>
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

export default PublicTimeline;
