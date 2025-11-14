import React from "react";
import userEvent from "@testing-library/user-event";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import CreateAction from "../CreateAction";
import {
  createActionFunction,
  userDashboard,
  searchCompanyNames,
  fetchCompanyMap,
} from "../ApiService";

jest.mock("../ApiService", () => ({
  createActionFunction: jest.fn(),
  userDashboard: jest.fn(),
  searchCompanyNames: jest.fn(),
  fetchCompanyMap: jest.fn(),
}));

jest.mock("../LogoutComponent", () => () => (
  <div data-testid="logout-component" />
));

beforeAll(() => {
  window.bootstrap = {
    Tooltip: jest.fn(() => ({
      dispose: jest.fn(),
    })),
  };
});

beforeAll(() => {
  Object.defineProperty(window.Document.prototype, "getSelection", {
    configurable: true,
    value: () => ({
      removeAllRanges: () => {},
      addRange: () => {},
    }),
  });
});

describe("CreateAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loads and displays agreements returned from the dashboard service", async () => {
    userDashboard.mockResolvedValue({
      status: "success",
      agreements: [
        {
          description: "Installed rooftop solar array",
          files: btoa("PDF content"),
          timestamp: "2024-05-01T12:00:00Z",
          hash: "0xabc123",
          category: "Sourcing",
        },
      ],
    });

    fetchCompanyMap.mockResolvedValue({
      status: "success",
      companies: [{ name: "Acme", timeline_url: "/timeline/acme" }],
    });

    render(<CreateAction />);

    expect(
      await screen.findByText("Installed rooftop solar array")
    ).toBeInTheDocument();
    expect(screen.getByText("[SOURCING]")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /download pdf/i })
    ).toBeInTheDocument();
  });

  test("shows error message if dashboard fetch fails", async () => {
    userDashboard.mockRejectedValue(new Error("Dashboard error"));
    render(<CreateAction />);
    expect(
      await screen.findByText("Failed to load agreements")
    ).toBeInTheDocument();
  });

  test("updates category selection when radio button is clicked", async () => {
    userDashboard.mockResolvedValue({ status: "success", agreements: [] });
    render(<CreateAction />);
    const sourcingRadio = await screen.findByDisplayValue("Sourcing");
    fireEvent.click(sourcingRadio);
    expect(sourcingRadio).toBeChecked();
  });

  test("updates file input when a file is selected", async () => {
    userDashboard.mockResolvedValue({ status: "success", agreements: [] });
    render(<CreateAction />);
    const fileInput = await screen.findByLabelText(
      /upload a supporting document/i
    );
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
    fireEvent.change(await screen.findByLabelText(/^For example:/i), {
      target: { value: "Switched facility lighting to LEDs" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByText(/hash_987654321/i)).toBeInTheDocument();
  });

  test("shows loading message while submitting", async () => {
    userDashboard.mockResolvedValue({ status: "success", agreements: [] });

    let resolveSubmit;
    createActionFunction.mockImplementation(
      () => new Promise((res) => (resolveSubmit = res))
    );

    render(<CreateAction />);
    fireEvent.change(await screen.findByLabelText(/^For example:/i), {
      target: { value: "Test loading state" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText(/please wait/i)).toBeInTheDocument();
    act(() => resolveSubmit({ success: true, hash: "0xloadingtest" }));
  });

  test("displays the error message when submission throws", async () => {
    userDashboard.mockResolvedValue({ status: "success", agreements: [] });
    createActionFunction.mockRejectedValue(new Error("Upload failed"));

    render(<CreateAction />);
    fireEvent.change(await screen.findByLabelText(/^For example:/i), {
      target: { value: "Implemented paper recycling program" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByText("Upload failed")).toBeInTheDocument();
  });

  test("renders mention suggestions when typing @company", async () => {
    userDashboard.mockResolvedValue({ status: "success", agreements: [] });
    searchCompanyNames.mockResolvedValue({
      status: "success",
      companies: [{ name: "Acme Corp" }],
    });

    render(<CreateAction />);
    const textarea = await screen.findByLabelText(/^For example:/i);

    // Simulate real typing
    await userEvent.type(textarea, "We worked with @Acm");

    // Wait for debounce + API call
    await waitFor(() => {
      expect(searchCompanyNames).toHaveBeenCalledWith("Acm");
    });

    // Suggestion should appear
    expect(await screen.findByText("Acme Corp")).toBeInTheDocument();
  });

  test("inserts selected mention into textarea", async () => {
    window.getSelection = () => ({
      removeAllRanges: () => {},
    });

    userDashboard.mockResolvedValue({ status: "success", agreements: [] });
    searchCompanyNames.mockResolvedValue({
      status: "success",
      companies: [{ name: "Acme Corp" }],
    });

    render(<CreateAction />);
    const textarea = await screen.findByLabelText(/^For example:/i);

    await userEvent.clear(textarea);
    await userEvent.type(textarea, "We worked with @Acm");

    await waitFor(() => {
      expect(searchCompanyNames).toHaveBeenCalledWith("Acm");
    });

    const suggestion = await screen.findByText(/Acme Corp/);
    fireEvent.mouseDown(suggestion);

    fireEvent.mouseDown(suggestion);

    expect(textarea.value).toContain("@Acme Corp ");
  });

  test("triggers file download when clicking download button", async () => {
    jest.useFakeTimers();

    userDashboard.mockResolvedValue({
      status: "success",
      agreements: [
        {
          description: "Solar panels",
          files: btoa("PDF content"),
          timestamp: "2024-05-01T12:00:00Z",
          hash: "0xabc123",
          category: "Impact",
        },
      ],
    });

    fetchCompanyMap.mockResolvedValue({ status: "success", companies: [] });

    global.URL.createObjectURL = jest.fn(() => "blob:url");
    global.URL.revokeObjectURL = jest.fn();

    const anchor = document.createElement("a");
    const clickSpy = jest.spyOn(anchor, "click").mockImplementation(() => {});
    const originalCreateElement = document.createElement;

    jest.spyOn(document, "createElement").mockImplementation((tag) => {
      return tag === "a" ? anchor : originalCreateElement.call(document, tag);
    });

    render(<CreateAction />);
    const downloadBtn = await screen.findByRole("button", {
      name: /download pdf/i,
    });
    fireEvent.click(downloadBtn);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(clickSpy).toHaveBeenCalled();
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
