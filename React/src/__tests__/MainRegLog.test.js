import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import MainRegLog from "../MainRegLog";

describe("MainRegLog Component", () => {
  test("renders Main, UserRegistration, and UserLogin components", () => {
    render(
      <Router>
        <MainRegLog />
      </Router>
    );

    const mainElement = screen.getByText(/Sustainability Log is a web application that helps ethical organisations/i);
    expect(mainElement).toBeInTheDocument();

    const registrationText = screen.getByPlaceholderText(/Company name/i);
    expect(registrationText).toBeInTheDocument();
  });
});
