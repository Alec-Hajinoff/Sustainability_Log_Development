import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PublicTimeline from "../PublicTimeline";
import * as ApiService from "../ApiService";

// Mock Bootstrap Tooltip
window.bootstrap = {
  Tooltip: jest.fn().mockImplementation(() => ({
    dispose: jest.fn(),
  })),
};

// Mock atob for file download
global.atob = (input) => Buffer.from(input, "base64").toString("binary");

jest.mock("../ApiService");

describe("PublicTimeline", () => {
  const mockSlug = "acme-corp";

  const mockTimelineData = {
    success: true,
    company_name: "Acme Corp",
    actions: [
      {
        description: "We partnered with @GreenSupply for better sourcing.",
        category: "Sourcing",
        files: btoa("PDF content"),
        timestamp: "2025-11-01T12:00:00Z",
        hash: "abc123",
      },
    ],
  };

  const mockCompanyMap = {
    status: "success",
    companies: [{ name: "GreenSupply", timeline_url: "/timeline/greensupply" }],
  };

  const renderWithRouter = () =>
    render(
      <MemoryRouter initialEntries={[`/timeline/${mockSlug}`]}>
        <Routes>
          <Route path="/timeline/:slug" element={<PublicTimeline />} />
        </Routes>
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    ApiService.fetchTimeline.mockResolvedValueOnce(mockTimelineData);
    ApiService.fetchCompanyMap.mockResolvedValueOnce(mockCompanyMap);

    renderWithRouter();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText(/Acme Corp/)).toBeInTheDocument()
    );
  });

  it("displays error message on fetch failure", async () => {
    ApiService.fetchTimeline.mockRejectedValueOnce(new Error("Network error"));
    ApiService.fetchCompanyMap.mockResolvedValueOnce(mockCompanyMap);

    renderWithRouter();

    await waitFor(() =>
      expect(screen.getByText(/failed to load timeline/i)).toBeInTheDocument()
    );
  });

  it("renders timeline table with data", async () => {
    ApiService.fetchTimeline.mockResolvedValueOnce(mockTimelineData);
    ApiService.fetchCompanyMap.mockResolvedValueOnce(mockCompanyMap);

    renderWithRouter();

    await waitFor(() =>
      expect(screen.getByText(/Acme Corp/)).toBeInTheDocument()
    );

    expect(screen.getByText(/\[SOURCING\]/)).toBeInTheDocument();
    expect(screen.getByText(/@GreenSupply/)).toBeInTheDocument();
    expect(screen.getByText(/Download PDF/)).toBeInTheDocument();
    expect(screen.getByText(/abc123/)).toBeInTheDocument();
  });

  it("handles file download click", async () => {
    ApiService.fetchTimeline.mockResolvedValueOnce(mockTimelineData);
    ApiService.fetchCompanyMap.mockResolvedValueOnce(mockCompanyMap);

    const createElementSpy = jest.spyOn(document, "createElement");
    renderWithRouter();

    await waitFor(() =>
      expect(screen.getByText(/Download PDF/)).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(/Download PDF/));
    expect(createElementSpy).toHaveBeenCalledWith("a");
  });
});
