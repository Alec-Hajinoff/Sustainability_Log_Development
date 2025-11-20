import { render, screen } from "@testing-library/react";
import React from "react";
import Main from "../Main.js";

test("Main component renders without crashing", () => {
  const { container } = render(<Main />);
  expect(container).toBeInTheDocument();
});

test("Main component contains the correct introductory text", () => {
  render(<Main />);
  const textElement = screen.getByText(
    /Sustainability Log is a web application that helps/i
  );
  expect(textElement).toBeInTheDocument();
});

test("Main component displays all sustainability steps", () => {
  render(<Main />);
  expect(
    screen.getByText(/Step 1: Log your sustainability actions/i)
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Step 2: Add Digital Product Passport information/i)
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Step 3: Link suppliers as required/i)
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Step 4: Automatically anchored on the blockchain/i)
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Step 5: Share your sustainability story/i)
  ).toBeInTheDocument();
});

test("Main component renders the sustainability timeline image", () => {
  render(<Main />);
  const timelineImage = screen.getByAltText(/Sustainability timeline/i);
  expect(timelineImage).toBeInTheDocument();
  expect(timelineImage).toHaveAttribute("src", "/TimelineSample.png");
});
