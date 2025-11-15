// When a user inputs text into the text box & uploads a file - this is the file that is responsible.

import React, { useState, useEffect, useRef } from "react";
import "./CreateAction.css";
import LogoutComponent from "./LogoutComponent";
import {
  createActionFunction,
  userDashboard,
  searchCompanyNames,
} from "./ApiService";

import ParseMentions from "./ParseMentions";
import { fetchCompanyMap } from "./ApiService";
import TimelineUrlDisplay from "./TimelineUrlDisplay";

function CreateAction() {
  const [textHash, setTextHash] = useState("");
  const [formData, setFormData] = useState({
    agreement_text: "",
    file: null,
    category: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreements, setAgreements] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionStartPos, setMentionStartPos] = useState(null);
  const [caretPos, setCaretPos] = useState(0);
  const debounceRef = useRef(null); // useRef doesn't cause a rerender like useState.
  // With 'const debounceRef = useRef(null);' React gives you an object that looks like: {current: null}
  const textareaRef = useRef(null);
  const [companyMap, setCompanyMap] = useState({});

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

  useEffect(() => {
    // Initialises tooltips
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new window.bootstrap.Tooltip(tooltipTriggerEl);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const selectionStart = e.target.selectionStart; // This is where the caret currently is.
    setCaretPos(selectionStart);

    setFormData({
      ...formData,
      [name]: value,
    });
    setTextHash("");

    // only run mention detection for the main textarea field
    if (name === "agreement_text") {
      const uptoCaret = value.slice(0, selectionStart); // All the text up to the caret.
      const atIndex = uptoCaret.lastIndexOf("@"); // Position of most recent @ before the caret.

      if (atIndex !== -1) {
        // Only proceed if @ is before the caret.
        // Get the text following the last '@' up to the caret.
        const query = uptoCaret.slice(atIndex + 1);

        // Only proceed if the token has no whitespace (simple mention token).
        if (/^\S*$/.test(query)) {
          setMentionStartPos(atIndex);
          setMentionQuery(query);

          if (query.length >= 3) {
            fetchSuggestions(query);
          } else {
            // Hide suggestions until >= 3 chars.
            setSuggestions([]);
            setShowSuggestions(false);
          }
          return;
        }
      }

      // No valid mention found.
      setMentionQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
      setMentionStartPos(null);
    }
  };

  const fetchSuggestions = async (q) => {
    if (debounceRef.current) clearTimeout(debounceRef.current); // If the timer on typing started, we clear it.
    debounceRef.current = setTimeout(async () => {
      // We then reset the timer.
      try {
        const data = await searchCompanyNames(q); // We then run the function after 250 milliseconds.
        if (data.status === "success" && data.companies) {
          setSuggestions(data.companies);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);
  };

  const selectSuggestion = (item) => {
    // Item might be an object with a company name or a plain string.
    const companyName = item.name || "";

    const text = formData.agreement_text;
    const before = text.slice(0, mentionStartPos); // Text before '@'.
    const afterStart =
      mentionStartPos + 1 + (mentionQuery ? mentionQuery.length : 0);
    const after = text.slice(afterStart);

    const inserted = "@" + companyName + " ";
    const newText = before + inserted + after;

    setFormData({
      ...formData,
      agreement_text: newText,
    });

    // Close suggestions.
    setShowSuggestions(false);
    setSuggestions([]);
    setMentionQuery("");
    setMentionStartPos(null);

    // Restore focus and place caret after inserted company name.
    setTimeout(() => {
      const ta =
        textareaRef.current || document.getElementById("agreementText");
      if (ta) {
        const newPos = before.length + inserted.length;
        ta.focus();
        ta.setSelectionRange(newPos, newPos);
        setCaretPos(newPos);
      }
    }, 0);
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
    submitData.append("category", formData.category);

    try {
      const data = await createActionFunction(submitData);
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

  const getCategoryLabel = (category) => {
    const categoryClasses = {
      Sourcing: "category-sourcing",
      Operations: "category-operations",
      Impact: "category-impact",
    };

    return category ? (
      <span className={`category-tag ${categoryClasses[category]}`}>
        [{category.toUpperCase()}]
      </span>
    ) : null;
  };

  useEffect(() => {
    const loadCompanyMap = async () => {
      try {
        const data = await fetchCompanyMap();
        if (data.status === "success") {
          const map = {};
          data.companies.forEach((c) => {
            if (c.name && c.timeline_url) {
              map[c.name] = c.timeline_url;
            }
          });
          setCompanyMap(map);
        }
      } catch (err) {
        console.error("Failed to fetch company URLs", err);
      }
    };
    loadCompanyMap();
  }, []);

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
            ref={textareaRef} // Add the ref
            className="form-control"
            rows="10"
            name="agreement_text"
            value={formData.agreement_text}
            onChange={handleChange}
            required
            aria-describedby={
              showSuggestions ? "mention-suggestions" : undefined
            }
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul
              id="mention-suggestions"
              className="list-group mention-suggestions"
              role="listbox"
              aria-label="Company suggestions"
            >
              {suggestions.map((s, idx) => {
                const label = s.name || "Unknown";
                return (
                  <li
                    key={idx}
                    className="list-group-item list-group-item-action"
                    role="option"
                    aria-selected={false}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSuggestion(s);
                    }}
                  >
                    {label}
                  </li>
                );
              })}
            </ul>
          )}
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

        <div className="form-group mb-3">
          <label>Select the category this action relates to:</label>
          <div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="category"
                value="Sourcing"
                checked={formData.category === "Sourcing"}
                onChange={handleChange}
                required
              />
              <label className="form-check-label">
                Sourcing
                <span
                  className="ms-1 text-primary fw-bold"
                  data-bs-toggle="tooltip"
                  title="Actions taken by your suppliers to improve sustainability (e.g., switching to recycled inputs)"
                >
                  ?
                </span>
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="category"
                value="Operations"
                checked={formData.category === "Operations"}
                onChange={handleChange}
              />
              <label className="form-check-label">
                Operations
                <span
                  className="ms-1 text-primary fw-bold"
                  data-bs-toggle="tooltip"
                  title="Internal company actions like reducing waste, donations, or volunteering"
                >
                  ?
                </span>
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="category"
                value="Impact"
                checked={formData.category === "Impact"}
                onChange={handleChange}
              />
              <label className="form-check-label">
                Impact
                <span
                  className="ms-1 text-primary fw-bold"
                  data-bs-toggle="tooltip"
                  title="Your products or services that help customers become more sustainable"
                >
                  ?
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Display hash if available */}
        {textHash && (
          <div className="alert alert-info">
            <strong>Your action hash is:</strong>
            <br />
            <code>{textHash}</code>
          </div>
        )}

        <div className="d-flex flex-column align-items-end mb-3">
          <div
            id="error-message"
            className={`error${errorMessage ? " mb-2" : ""}`}
            aria-live="polite"
          >
            {errorMessage}
          </div>
          {loading && (
            <div className="error mb-2" role="status">
              Saving your action to the blockchain, please wait…
            </div>
          )}
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
            {agreements.length > 0 && (
              <div className="row">
                <div className="col">
                  <TimelineUrlDisplay />
                  <table className="table">{/* existing table code */}</table>
                  {/* blockchain explorer link */}
                </div>
              </div>
            )}

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
                      {ParseMentions(agreement.description, companyMap)}
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

export default CreateAction;
