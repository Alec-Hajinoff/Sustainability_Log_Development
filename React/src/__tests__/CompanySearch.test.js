import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CompanySearch from "../CompanySearch";
import { companySearchFunction } from "../ApiService";

// Mock the ApiService
jest.mock("../ApiService");

// Prevent tooltip crash in test environment
beforeAll(() => {
  window.bootstrap = {
    Tooltip: jest.fn(() => ({
      dispose: jest.fn(),
    })),
  };
});

describe("CompanySearch Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders initial state correctly", () => {
    render(<CompanySearch />);
    expect(
      screen.getByPlaceholderText("Enter company name")
    ).toBeInTheDocument();
    expect(screen.getByText("Search for a company:")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  test("handles search input correctly", async () => {
    render(<CompanySearch />);
    const searchInput = screen.getByPlaceholderText("Enter company name");

    fireEvent.change(searchInput, { target: { value: "ab" } });
    expect(searchInput.value).toBe("ab");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    const mockData = {
      status: "success",
      agreements: [
        {
          description: "Test Agreement",
          files: "base64data",
          timestamp: "2023-01-01T00:00:00Z",
          hash: "testhash123",
          category: "Sourcing",
        },
      ],
    };
    companySearchFunction.mockResolvedValue(mockData);

    fireEvent.change(searchInput, { target: { value: "abc" } });

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByText("Test Agreement")).toBeInTheDocument();
      expect(screen.getByText("[SOURCING]")).toBeInTheDocument();
    });
  });

  test("displays error message when API call fails", async () => {
    render(<CompanySearch />);
    const searchInput = screen.getByPlaceholderText("Enter company name");

    companySearchFunction.mockResolvedValue({
      status: "error",
      agreements: [],
      message: "Company not found",
    });

    fireEvent.change(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      const error = screen.getByText("Company not found");
      expect(error).toBeInTheDocument();
      expect(error.closest("div")).toHaveClass("alert", "alert-danger");
    });
  });

  test("handles network error correctly", async () => {
    render(<CompanySearch />);
    const searchInput = screen.getByPlaceholderText("Enter company name");

    companySearchFunction.mockRejectedValue(new Error("Network error"));

    fireEvent.change(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      const error = screen.getByText("Network error");
      expect(error).toBeInTheDocument();
      expect(error.closest("div")).toHaveClass("alert", "alert-danger");
    });
  });

  test("displays agreements data correctly", async () => {
    render(<CompanySearch />);
    const searchInput = screen.getByPlaceholderText("Enter company name");

    const mockAgreements = [
      {
        description: "Test Agreement 1",
        files: "base64data1",
        timestamp: "2023-01-01T00:00:00Z",
        hash: "hash1",
        category: "Impact",
      },
      {
        description: "Test Agreement 2",
        files: "base64data2",
        timestamp: "2023-01-02T00:00:00Z",
        hash: "hash2",
        category: "Operations",
      },
    ];

    companySearchFunction.mockResolvedValue({
      status: "success",
      agreements: mockAgreements,
    });

    fireEvent.change(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByText("Test Agreement 1")).toBeInTheDocument();
      expect(screen.getByText("Test Agreement 2")).toBeInTheDocument();
      expect(screen.getAllByText("Download PDF")).toHaveLength(2);
      expect(screen.getByText("[IMPACT]")).toBeInTheDocument();
      expect(screen.getByText("[OPERATIONS]")).toBeInTheDocument();
    });
  });

  test("clears results when search term is less than 3 characters", async () => {
    render(<CompanySearch />);
    const searchInput = screen.getByPlaceholderText("Enter company name");

    companySearchFunction.mockResolvedValue({
      status: "success",
      agreements: [{ description: "Test Agreement" }],
    });

    fireEvent.change(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: "te" } });

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});
