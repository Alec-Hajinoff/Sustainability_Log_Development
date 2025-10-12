/**
 * @fileoverview Verifies the essential flows of the UserLogin component.
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserLogin from "../UserLogin";
import { loginUser } from "../ApiService";
import { useNavigate } from "react-router-dom";

// Mock the API function so we can control outcomes.
jest.mock("../ApiService", () => ({
  loginUser: jest.fn(),
}));

// Reuse a shared navigate mock across all tests.
const mockNavigate = jest.fn();

// Mock the react-router hook while leaving other exports untouched.
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("UserLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure every test receives the mocked navigate function.
    useNavigate.mockReturnValue(mockNavigate);
  });

  test("submits credentials and navigates on successful response", async () => {
    loginUser.mockResolvedValue({ status: "success" });

    render(<UserLogin />);

    // Fill the form with valid values.
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "ValidPass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() =>
      expect(loginUser).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "ValidPass123",
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/CreateAction");
  });

  test("shows an error message when the API returns a failure status", async () => {
    loginUser.mockResolvedValue({ status: "failure" });

    render(<UserLogin />);

    // Provide valid credentials so the error comes from the API response.
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "ValidPass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(
      await screen.findByText("Sign in failed. Please try again.")
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("displays the thrown error message when the API call rejects", async () => {
    loginUser.mockRejectedValue(new Error("Network problem"));

    render(<UserLogin />);

    // Ensure input fields are valid so the thrown error is surfaced in the UI.
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "ValidPass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText("Network problem")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
