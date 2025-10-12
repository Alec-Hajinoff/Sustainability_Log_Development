import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CompanySearch from "../CompanySearch";
import { companySearchFunction } from "../ApiService";

// Mock the ApiService
jest.mock("../ApiService");

describe("CompanySearch Component", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("renders initial state correctly", () => {
    render(<CompanySearch />);

    // Check if search input is present
    expect(
      screen.getByPlaceholderText("Enter company name")
    ).toBeInTheDocument();
    expect(screen.getByText("Search for a company:")).toBeInTheDocument();

    // Check if table and error message are not present initially
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  test("handles search input correctly", async () => {
    render(<CompanySearch />);
    const searchInput = screen.getByPlaceholderText("Enter company name");

    // Type less than 3 characters
    fireEvent.change(searchInput, { target: { value: "ab" } });
    expect(searchInput.value).toBe("ab");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    // Type 3 characters
    const mockData = {
      status: "success",
      agreements: [
        {
          description: "Test Agreement",
          files: "base64data",
          timestamp: "2023-01-01T00:00:00Z",
          hash: "testhash123",
        },
      ],
    };
    companySearchFunction.mockResolvedValue(mockData);

    fireEvent.change(searchInput, { target: { value: "abc" } });

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByText("Test Agreement")).toBeInTheDocument();
    });
  });

  test("displays error message when API call fails", async () => {
    render(<CompanySearch />);
    const searchInput = screen.getByPlaceholderText("Enter company name");

    const mockError = {
      status: "success", // Component expects status: "success"
      agreements: [], // Empty array when no agreements found
      message: "Company not found", // This will be displayed as error
    };
    companySearchFunction.mockResolvedValue({
      status: "error",
      agreements: [],
      message: "Company not found",
    });

    fireEvent.change(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByText("Company not found")).toBeInTheDocument();
      // Check for the error message container by its text
      expect(screen.getByText("Company not found").closest("div")).toHaveClass(
        "alert",
        "alert-danger"
      );
    });
  });

  test("handles network error correctly", async () => {
    render(<CompanySearch />);
    const searchInput = screen.getByPlaceholderText("Enter company name");

    const errorMessage = "Network error";
    companySearchFunction.mockRejectedValue(new Error(errorMessage));

    fireEvent.change(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      // Check for the error message container by its text
      expect(screen.getByText(errorMessage).closest("div")).toHaveClass(
        "alert",
        "alert-danger"
      );
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
      },
      {
        description: "Test Agreement 2",
        files: "base64data2",
        timestamp: "2023-01-02T00:00:00Z",
        hash: "hash2",
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
    });
  });

  test("clears results when search term is less than 3 characters", async () => {
    render(<CompanySearch />);
    const searchInput = screen.getByPlaceholderText("Enter company name");

    // First search with valid term
    companySearchFunction.mockResolvedValue({
      status: "success",
      agreements: [{ description: "Test Agreement" }],
    });

    fireEvent.change(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    // Clear search
    fireEvent.change(searchInput, { target: { value: "te" } });

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});
