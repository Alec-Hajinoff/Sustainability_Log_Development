import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";

beforeAll(() => {
  window.bootstrap = {
    Tooltip: jest.fn(() => ({
      dispose: jest.fn(),
    })),
  };
});

describe("App Router", () => {
  test("renders MainRegLog at root path", () => {
    window.history.pushState({}, "", "/");
    render(<App />);
    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();
  });

  test("renders RegisteredPage at /RegisteredPage", () => {
    window.history.pushState({}, "", "/RegisteredPage");
    render(<App />);
    expect(screen.getByText(/registered/i)).toBeInTheDocument();
  });

  test("renders CreateAction at /CreateAction", () => {
    window.history.pushState({}, "", "/CreateAction");
    render(<App />);
    expect(
      screen.getByText(/to add a sustainability action/i)
    ).toBeInTheDocument();
  });

  test("renders LogoutComponent at /LogoutComponent", () => {
    window.history.pushState({}, "", "/LogoutComponent");
    render(<App />);
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  test("renders CompanySearch at /CompanySearch", () => {
    window.history.pushState({}, "", "/CompanySearch");
    render(<App />);
    expect(screen.getByText(/search for a company/i)).toBeInTheDocument();
  });

  test("renders PublicTimeline at /timeline/:slug", () => {
    window.history.pushState({}, "", "/timeline/acme");
    render(<App />);
    expect(screen.getByText(/timeline/i)).toBeInTheDocument();
  });
});
