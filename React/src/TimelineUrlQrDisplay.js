import React, { useEffect, useState } from "react";
import { fetchUserTimelineUrlQr } from "./ApiService";
import "./TimelineUrlQrDisplay.css";

function TimelineUrlQrDisplay() {
  const [timelineUrl, setTimelineUrl] = useState("");
  const [qrCodePath, setQrCodePath] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserTimelineUrlQr();
        if (data.status === "success" && data.timeline_url) {
          setTimelineUrl(data.timeline_url);
          setQrCodePath(data.qr_code);
        } else {
          setError("Timeline URL not found.");
        }
      } catch (err) {
        setError("Failed to fetch timeline URL and QR code.");
      }
    };
    loadData();
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
      {qrCodePath && (
        <div className="mt-2">
          <img
            src={`https://sustainabilitylog.com${qrCodePath}`}
            alt="Timeline QR Code"
            style={{ maxWidth: "200px", height: "auto" }}
          />
        </div>
      )}
      <p className="mb-0 small text-muted">
        Share your timeline URL or QR code with anyone who should be able to view your
        organisation’s sustainability timeline.
      </p>
    </div>
  );
}

export default TimelineUrlQrDisplay;
