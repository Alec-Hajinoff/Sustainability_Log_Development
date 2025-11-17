/**
 * @fileoverview Tests TimelineUrlQrDisplay component rendering and API integration.
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import TimelineUrlQrDisplay from "../TimelineUrlQrDisplay";
import { fetchUserTimelineUrlQr } from "../ApiService";

// Mock the API service
jest.mock("../ApiService", () => ({
  fetchUserTimelineUrlQr: jest.fn(),
}));

describe("TimelineUrlQrDisplay", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders timeline URL and QR code when API succeeds", async () => {
    fetchUserTimelineUrlQr.mockResolvedValue({
      status: "success",
      timeline_url: "https://example.com/timeline",
      qr_code: "/qr/example.png",
    });

    render(<TimelineUrlQrDisplay />);

    // Wait for async effect
    await waitFor(() =>
      expect(
        screen.getByText("Your public timeline URL is:")
      ).toBeInTheDocument()
    );

    // URL link
    const link = screen.getByRole("link", {
      name: /https:\/\/example.com\/timeline/i,
    });
    expect(link).toHaveAttribute("href", "https://example.com/timeline");

    // QR code image
    const img = screen.getByAltText("Timeline QR Code");
    expect(img).toHaveAttribute(
      "src",
      "http://localhost:8001/Sustainability_Log_Development/qr/example.png"
    );
  });

  test("renders error message when API returns failure", async () => {
    fetchUserTimelineUrlQr.mockResolvedValue({
      status: "error",
    });

    render(<TimelineUrlQrDisplay />);

    await waitFor(() =>
      expect(screen.getByText("Timeline URL not found.")).toBeInTheDocument()
    );
  });

  test("renders error message when API throws", async () => {
    fetchUserTimelineUrlQr.mockRejectedValue(new Error("Network error"));

    render(<TimelineUrlQrDisplay />);

    await waitFor(() =>
      expect(
        screen.getByText("Failed to fetch timeline URL and QR code.")
      ).toBeInTheDocument()
    );
  });

  test("renders nothing initially before data or error", () => {
    // Component returns null until useEffect runs
    fetchUserTimelineUrlQr.mockImplementation(() => new Promise(() => {}));

    const { container } = render(<TimelineUrlQrDisplay />);
    expect(container).toBeEmptyDOMElement();
  });
});
