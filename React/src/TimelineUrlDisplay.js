import React, { useEffect, useState } from "react";
import { fetchCompanyMap } from "./ApiService";

function TimelineUrlDisplay({ companyName }) {
  const [timelineUrl, setTimelineUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUrl = async () => {
      try {
        const data = await fetchCompanyMap();
        if (data.status === "success" && data.companies) {
          const company = data.companies.find((c) => c.name === companyName);
          if (company && company.timeline_url) {
            setTimelineUrl(company.timeline_url);
          } else {
            setError("No timeline URL found for this company.");
          }
        }
      } catch (err) {
        setError("Failed to fetch timeline URL.");
      }
    };
    loadUrl();
  }, [companyName]);

  if (!timelineUrl && !error) return null;

  return (
    <div className="alert alert-secondary mb-3">
      <strong>Your public timeline URL:</strong>{" "}
      {timelineUrl ? (
        <a href={timelineUrl} target="_blank" rel="noopener noreferrer">
          {timelineUrl}
        </a>
      ) : (
        <span className="text-danger">{error}</span>
      )}
      <p className="mb-0 small text-muted">
        Share this link with customers or embed it on your site.
      </p>
    </div>
  );
}

export default TimelineUrlDisplay;
