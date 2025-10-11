import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import CounterSignature from "../CounterSignature";
import { agreementHashFunction } from "../ApiService";

jest.mock("../ApiService");

describe("CounterSignature Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders initial search input correctly", () => {
    render(<CounterSignature />);
    expect(screen.getByPlaceholderText("Enter company name")).toBeInTheDocument();
  });

  it("handles search with more than 2 characters", async () => {
    const mockAgreements = [
      {
        description: "Test Agreement",
        files: "base64data",
        timestamp: "2023-01-01T00:00:00Z",
        hash: "testHash123",
      },
    ];

    agreementHashFunction.mockResolvedValueOnce({
      status: "success",
      agreements: mockAgreements,
    });

    render(<CounterSignature />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Enter company name"), {
        target: { value: "Test Company" },
      });
    });

    expect(screen.getByText("Test Agreement")).toBeInTheDocument();
  });

  it("shows error message when search fails", async () => {
    agreementHashFunction.mockResolvedValueOnce({
      status: "error",
      message: "Company not found",
    });

    render(<CounterSignature />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Enter company name"), {
        target: { value: "Invalid Company" },
      });
    });

    expect(screen.getByText("Company not found")).toBeInTheDocument();
  });

  it("clears results when search term is less than 3 characters", async () => {
    const mockAgreements = [
      {
        description: "Test Agreement",
        files: "base64data",
        timestamp: "2023-01-01T00:00:00Z",
        hash: "testHash123",
      },
    ];

    agreementHashFunction.mockResolvedValueOnce({
      status: "success",
      agreements: mockAgreements,
    });

    render(<CounterSignature />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Enter company name"), {
        target: { value: "Test Company" },
      });
    });

    expect(screen.getByText("Test Agreement")).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Enter company name"), {
        target: { value: "Te" },
      });
    });

    expect(screen.queryByText("Test Agreement")).not.toBeInTheDocument();
  });

  it("handles file download correctly", async () => {
    const mockAgreements = [
      {
        description: "Test Agreement",
        files: "base64data",
        timestamp: "2023-01-01T00:00:00Z",
        hash: "testHash123",
      },
    ];

    agreementHashFunction.mockResolvedValueOnce({
      status: "success",
      agreements: mockAgreements,
    });

    const mockCreateObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;

    render(<CounterSignature />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Enter company name"), {
        target: { value: "Test Company" },
      });
    });

    const downloadButton = screen.getByText("Download PDF");
    expect(downloadButton).toBeInTheDocument();
  });

  it("displays timestamp and blockchain explorer link when results are present", async () => {
    const mockAgreements = [
      {
        description: "Test Agreement",
        files: "base64data",
        timestamp: "2023-01-01T00:00:00Z",
        hash: "testHash123",
      },
    ];

    agreementHashFunction.mockResolvedValueOnce({
      status: "success",
      agreements: mockAgreements,
    });

    render(<CounterSignature />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Enter company name"), {
        target: { value: "Test Company" },
      });
    });

    // Check if timestamp is displayed
    expect(screen.getByText(/2023/)).toBeInTheDocument();

    // Check if blockchain explorer link is present
    expect(screen.getByText(/blockchain explorer/)).toBeInTheDocument();
  });
});