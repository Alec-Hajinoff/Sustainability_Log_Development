import React, { useEffect, useState } from "react";
import { fetchUserTimelineUrl } from "./ApiService";

function TimelineUrlDisplay() {
  const [timelineUrl, setTimelineUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUrl = async () => {
      try {
        const data = await fetchUserTimelineUrl();
        if (data.status === "success" && data.timeline_url) {
          setTimelineUrl(data.timeline_url);
        } else {
          setError("Timeline URL not found.");
        }
      } catch (err) {
        setError("Failed to fetch timeline URL.");
      }
    };
    loadUrl();
  }, []);

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
        Share this link with anyone who should be able to view your
        organisation’s sustainability timeline.
      </p>
    </div>
  );
}

export default TimelineUrlDisplay;
