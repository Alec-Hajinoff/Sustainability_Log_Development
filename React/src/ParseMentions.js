// src/ParseMentions.js
import React from "react";

import "./ParseMentions.css";

function ParseMentions(text, companyMap) {
  const mentionRegex = /@(\w[\w\s\-]*)/g;

  return text.split(mentionRegex).map((segment, index) => {
    // Even indexes are plain text, odd indexes are company names
    if (index % 2 === 0) return segment;

    const companyName = segment.trim();
    const url = companyMap[companyName];

    if (url) {
      return (
        <a
          key={`mention-${index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mention-link"
        >
          @{companyName}
        </a>
      );
    } else {
      return `@${companyName}`; // fallback to plain text if no match
    }
  });
}

export default ParseMentions;
