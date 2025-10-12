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

  test("loads and displays agreements returned from the dashboard service", async () => {
    const agreements = [
      {
        description: "Installed rooftop solar array",
        files: "cGRmLWZpbGUtY29udGVudA==",
        timestamp: "2024-05-01T12:00:00Z",
        hash: "0xabc123",
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
    expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
  });

  test("submits form data and shows the returned hash when the API reports success", async () => {
    userDashboard.mockResolvedValue({ status: "success", agreements: [] });
    createActionFunction.mockResolvedValue({
      success: true,
      hash: "hash_987654321",
    });

    render(<CreateAction />);

    await waitFor(() => expect(userDashboard).toHaveBeenCalledTimes(1));

    const descriptionField = screen.getByLabelText(/^For example:/i);
    fireEvent.change(descriptionField, {
      target: { value: "Switched facility lighting to LEDs" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() =>
      expect(createActionFunction).toHaveBeenCalledTimes(1)
    );

    const submittedFormData = createActionFunction.mock.calls[0][0];
    expect(submittedFormData).toBeInstanceOf(FormData);
    expect(Array.from(submittedFormData.entries())).toEqual([
      ["agreement_text", "Switched facility lighting to LEDs"],
    ]);

    expect(await screen.findByText(/Record hash:/i)).toBeInTheDocument();
    expect(screen.getByText("hash_987654321")).toBeInTheDocument();
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

    await waitFor(() =>
      expect(createActionFunction).toHaveBeenCalledTimes(1)
    );

    expect(await screen.findByText("Upload failed")).toBeInTheDocument();
  });
});
