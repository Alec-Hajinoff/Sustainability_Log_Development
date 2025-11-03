/**
 * @fileoverview Validates the critical user flows of the CreateAction component.
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateAction from "../CreateAction";
import { createActionFunction, userDashboard } from "../ApiService";

jest.mock("../ApiService", () => ({
  createActionFunction: jest.fn(),
  userDashboard: jest.fn(),
}));

jest.mock("../LogoutComponent", () => () => (
  <div data-testid="logout-component" />
));

describe("CreateAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    window.bootstrap = {
      Tooltip: jest.fn(() => ({
        dispose: jest.fn(),
      })),
    };
  });

  test("loads and displays agreements returned from the dashboard service", async () => {
    const agreements = [
      {
        description: "Installed rooftop solar array",
        files: "cGRmLWZpbGUtY29udGVudA==",
        timestamp: "2024-05-01T12:00:00Z",
        hash: "0xabc123",
        category: "Sourcing",
      },
    ];

    userDashboard.mockResolvedValue({
      status: "success",
      agreements,
    });

    render(<CreateAction />);

    await waitFor(() => expect(userDashboard).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByText("Installed rooftop solar array")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /download pdf/i })
    ).toBeInTheDocument();
    expect(screen.getByText("[SOURCING]")).toBeInTheDocument();
  });

  test("updates category selection when radio button is clicked", async () => {
    userDashboard.mockResolvedValue({ status: "success", agreements: [] });
    render(<CreateAction />);

    await waitFor(() => expect(userDashboard).toHaveBeenCalled());

    const sourcingRadio = screen.getByDisplayValue("Sourcing");
    fireEvent.click(sourcingRadio);
    expect(sourcingRadio).toBeChecked();
  });

  test("updates file input when a file is selected", async () => {
    userDashboard.mockResolvedValue({ status: "success", agreements: [] });
    render(<CreateAction />);

    await waitFor(() => expect(userDashboard).toHaveBeenCalled());

    const fileInput = screen.getByLabelText(/upload a supporting document/i);
    const mockFile = new File(["dummy content"], "test.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    fireEvent.change(screen.getByLabelText(/^For example:/i), {
      target: { value: "Switched facility lighting to LEDs" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => expect(createActionFunction).toHaveBeenCalled());

    const submittedFormData = createActionFunction.mock.calls[0][0];
    expect(submittedFormData.get("file")).toBe(mockFile);
  });

  test("submits form data and shows the returned hash when the API reports success", async () => {
    userDashboard.mockResolvedValue({ status: "success", agreements: [] });
    createActionFunction.mockResolvedValue({
      success: true,
      hash: "hash_987654321",
    });

    render(<CreateAction />);

    await waitFor(() => expect(userDashboard).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText(/^For example:/i), {
      target: { value: "Switched facility lighting to LEDs" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => expect(createActionFunction).toHaveBeenCalledTimes(1));

    expect(await screen.findByText(/hash_987654321/i)).toBeInTheDocument();
  });

  test("shows loading message while submitting", async () => {
    userDashboard.mockResolvedValue({ status: "success", agreements: [] });

    let resolveSubmit;
    createActionFunction.mockImplementation(
      () => new Promise((resolve) => (resolveSubmit = resolve))
    );

    render(<CreateAction />);

    await waitFor(() => expect(userDashboard).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText(/^For example:/i), {
      target: { value: "Test loading state" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText(/please wait/i)).toBeInTheDocument();

    resolveSubmit({ success: true, hash: "0xloadingtest" });
  });

  test("displays the error message when submission throws", async () => {
    userDashboard.mockResolvedValue({ status: "success", agreements: [] });
    createActionFunction.mockRejectedValue(new Error("Upload failed"));

    render(<CreateAction />);

    await waitFor(() => expect(userDashboard).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText(/^For example:/i), {
      target: { value: "Implemented paper recycling program" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByText("Upload failed")).toBeInTheDocument();
  });
});
