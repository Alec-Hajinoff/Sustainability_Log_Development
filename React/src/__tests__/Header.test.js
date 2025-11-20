import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../Header";

test("renders the Header component", () => {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

  const logo = screen.getByAltText(/a company logo/i);
  expect(logo).toBeInTheDocument();
  expect(logo).toHaveAttribute("title", "A company logo");
  expect(logo.getAttribute("src")).toMatch(/LogoSampleCopy/i);
});
