import React from "react";
import { render, screen, within } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import MainRegLog from "../MainRegLog";

describe("MainRegLog Component", () => {
  test("renders Main, UserRegistration, and UserLogin components with correct text", () => {
    render(
      <Router>
        <MainRegLog />
      </Router>
    );

    expect(
      screen.getByText(
        /Sustainability Log is a web application that helps ethical organisations/i
      )
    ).toBeInTheDocument();

    const registrationSection = screen.getByText(
      /New user\? Please register:/i
    ).nextElementSibling;
    expect(
      within(registrationSection).getByPlaceholderText(/Company name/i)
    ).toBeInTheDocument();
    expect(
      within(registrationSection).getByPlaceholderText(/Email address/i)
    ).toBeInTheDocument();
    expect(
      within(registrationSection).getByPlaceholderText(
        /Choose a strong password/i
      )
    ).toBeInTheDocument();

    const loginSection = screen.getByText(
      /Existing user\? Please login:/i
    ).nextElementSibling;
    expect(
      within(loginSection).getByPlaceholderText(/Email address/i)
    ).toBeInTheDocument();
    expect(
      within(loginSection).getByPlaceholderText(/Password/i)
    ).toBeInTheDocument();
  });
});
