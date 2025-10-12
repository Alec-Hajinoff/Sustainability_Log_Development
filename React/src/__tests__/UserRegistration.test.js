/**
 * @fileoverview Tests the essential flows of the UserRegistration component.
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserRegistration from "../UserRegistration";
import { registerUser } from "../ApiService";
import { useNavigate } from "react-router-dom";

// Mock the API layer so we can control success/failure outcomes.
jest.mock("../ApiService", () => ({
  registerUser: jest.fn(),
}));

// Reuse a single navigate mock for all tests.
const mockNavigate = jest.fn();

// Mock react-router's navigation hook while preserving other exports.
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("UserRegistration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Each test needs the mocked navigate function returned by the hook.
    useNavigate.mockReturnValue(mockNavigate);
  });

  test("shows an error when the password is shorter than 8 characters", async () => {
    render(<UserRegistration />);

    // Populate required fields with valid values except for the password.
    fireEvent.change(screen.getByPlaceholderText("Company name"), {
      target: { value: "Example Co" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        "Choose a strong password (minimum 8 characters)"
      ),
      { target: { value: "short" } }
    );

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText("Password must be at least 8 characters long")
    ).toBeInTheDocument();
    expect(registerUser).not.toHaveBeenCalled();
  });

  test("submits valid data and navigates on success", async () => {
    registerUser.mockResolvedValue({ success: true });

    render(<UserRegistration />);

    // Fill the form with valid values prior to submission.
    fireEvent.change(screen.getByPlaceholderText("Company name"), {
      target: { value: "Example Co" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        "Choose a strong password (minimum 8 characters)"
      ),
      { target: { value: "supersecure" } }
    );

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() =>
      expect(registerUser).toHaveBeenCalledWith({
        name: "Example Co",
        email: "user@example.com",
        password: "supersecure",
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/RegisteredPage");
  });

  test("shows an error when registration fails on the server", async () => {
    registerUser.mockResolvedValue({ success: false });

    render(<UserRegistration />);

    // Populate the form with valid data so the failure comes from the API.
    fireEvent.change(screen.getByPlaceholderText("Company name"), {
      target: { value: "Example Co" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        "Choose a strong password (minimum 8 characters)"
      ),
      { target: { value: "supersecure" } }
    );

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText("Registration failed. Please try again.")
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows an error when registration throws an exception", async () => {
    registerUser.mockRejectedValue(new Error("Network issue"));

    render(<UserRegistration />);

    // Provide valid inputs so the thrown error surfaces in the UI.
    fireEvent.change(screen.getByPlaceholderText("Company name"), {
      target: { value: "Example Co" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        "Choose a strong password (minimum 8 characters)"
      ),
      { target: { value: "supersecure" } }
    );

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText("Network issue")).toBeInTheDocument();
  });
});
