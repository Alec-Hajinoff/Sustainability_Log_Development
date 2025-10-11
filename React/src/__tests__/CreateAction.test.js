import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import CreateAgreement from "../CreateAgreement";
import { createAgreementFunction, userDashboard } from "../ApiService";

// Mock API service module
jest.mock("../ApiService");

// Mock LogoutComponent to avoid rendering it fully
jest.mock("../LogoutComponent", () => () => <button>Logout</button>);

describe("CreateAgreement Component", () => {
  // Sample agreements as they are rendered by the component
  const mockAgreements = [
    {
      description: "Installed solar panels",
      files: "JVBERi0xLjQKJcTl8uXr... (base64)",
      timestamp: "2025-08-25T10:00:00Z",
      hash: "hash123",
    },
    {
      description: "Reduced waste via recyclable packaging",
      files: "JVBERi0yLjQKJcTl8uXr... (base64)",
      timestamp: "2025-09-01T09:30:00Z",
      hash: "hash456",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // IMPORTANT: component expects { status: "success" }
    userDashboard.mockResolvedValue({
      status: "success",
      agreements: mockAgreements,
    });
  });

  it("renders initial form elements correctly", async () => {
    render(<CreateAgreement />);

    // Textarea labeled by the long example text
    expect(
      screen.getByRole("textbox", { name: /For example:/i })
    ).toBeInTheDocument();

    // File input labeled as "Upload a supporting document"
    expect(
      screen.getByLabelText(/Upload a supporting document/i)
    ).toBeInTheDocument();

    // Submit button
    expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();

    // Logout button (mocked)
    expect(screen.getByRole("button", { name: /Logout/i })).toBeInTheDocument();
  });

  it("loads and displays agreements from dashboard", async () => {
    render(<CreateAgreement />);

    await waitFor(() => {
      // Descriptions
      expect(screen.getByText("Installed solar panels")).toBeInTheDocument();
      expect(
        screen.getByText("Reduced waste via recyclable packaging")
      ).toBeInTheDocument();

      // Hashes
      expect(screen.getByText("hash123")).toBeInTheDocument();
      expect(screen.getByText("hash456")).toBeInTheDocument();

      // Download buttons exist for rows
      const downloadButtons = screen.getAllByRole("button", {
        name: /Download PDF/i,
      });
      expect(downloadButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("handles dashboard loading error", async () => {
    userDashboard.mockRejectedValueOnce(new Error("Failed to load agreements"));

    render(<CreateAgreement />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load agreements")).toBeInTheDocument();
    });
  });

  it("submits agreement text and displays hash", async () => {
    const mockHash = "generatedHash123";
    createAgreementFunction.mockResolvedValueOnce({
      success: true,
      hash: mockHash,
    });

    render(<CreateAgreement />);

    // Enter text
    await act(async () => {
      fireEvent.change(screen.getByRole("textbox", { name: /For example:/i }), {
        target: { value: "Test agreement text" },
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /Submit/i }));
    });

    // Hash should display in the alert
    await waitFor(() => {
      expect(screen.getByText(mockHash)).toBeInTheDocument();
      expect(screen.getByText(/Agreement hash:/i)).toBeInTheDocument();
    });
  });

  it("handles agreement submission error", async () => {
    createAgreementFunction.mockRejectedValueOnce(
      new Error("Submission failed")
    );

    render(<CreateAgreement />);

    await act(async () => {
      fireEvent.change(screen.getByRole("textbox", { name: /For example:/i }), {
        target: { value: "Test agreement text" },
      });
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /Submit/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Submission failed/)).toBeInTheDocument();
    });
  });

  it("clears hash when agreement text changes", async () => {
    const mockHash = "generatedHash123";
    createAgreementFunction.mockResolvedValueOnce({
      success: true,
      hash: mockHash,
    });

    render(<CreateAgreement />);

    // Initial text + submit to generate hash
    await act(async () => {
      fireEvent.change(screen.getByRole("textbox", { name: /For example:/i }), {
        target: { value: "Initial text" },
      });
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /Submit/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(mockHash)).toBeInTheDocument();
    });

    // Change text -> should clear hash
    await act(async () => {
      fireEvent.change(screen.getByRole("textbox", { name: /For example:/i }), {
        target: { value: "New text" },
      });
    });

    expect(screen.queryByText(mockHash)).not.toBeInTheDocument();
  });
});
