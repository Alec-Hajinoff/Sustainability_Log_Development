import React, { useEffect, useState } from "react";
import { fetchCompanyMap } from "./ApiService";

function TimelineUrlDisplay({ companyName }) {
  const [timelineUrl, setTimelineUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUrl = async () => {
      try {
        const data = await fetchCompanyMap();
        if (data.status === "success" && data.companies?.length > 0) {
          setTimelineUrl(data.companies[0].timeline_url);
        }
      } catch (err) {
        setError("Failed to fetch timeline URL.");
      }
    };
    loadUrl();
  }, [companyName]);

  if (!timelineUrl && !error) return null;

  return (
    <div className="alert alert-light mb-3">
      <strong>Your public timeline URL is:</strong>{" "}
      {timelineUrl ? (
        <a href={timelineUrl} target="_blank" rel="noopener noreferrer">
          {timelineUrl}
        </a>
      ) : (
        <span className="text-danger">{error}</span>
      )}
      <p className="mb-0 small text-muted">
        Share this link with anyone who should be able to view your organisation’s sustainability timeline.
      </p>
    </div>
  );
}

export default TimelineUrlDisplay;
