/**
 * @fileoverview Ensures the API helpers issue the right fetch calls and handle success/error paths.
 */
import {
  registerUser,
  loginUser,
  createActionFunction,
  logoutUser,
  userDashboard,
  searchCompanyNames,
  fetchTimeline,
  fetchCompanyMap,
  fetchUserTimelineUrlQr,
} from "../ApiService";

describe("ApiService helpers", () => {
  const originalFetch = global.fetch;
  let consoleErrorSpy;

  beforeEach(() => {
    global.fetch = jest.fn();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test("registerUser posts JSON payload and returns parsed data", async () => {
    const formData = {
      name: "ACME",
      email: "test@example.com",
      password: "secret",
    };
    const mockBody = { success: true };

    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockBody),
    });

    const result = await registerUser(formData);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8001/Sustainability_Log_Development/form_capture.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      }
    );
    expect(result).toEqual(mockBody);
  });

  test("registerUser converts fetch rejection into a generic error", async () => {
    global.fetch.mockRejectedValue(new Error("Network down"));

    await expect(registerUser({})).rejects.toThrow("An error occurred.");
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test("loginUser posts credentials and returns parsed payload", async () => {
    const formData = { email: "user@example.com", password: "Password123" };
    const mockBody = { status: "success" };

    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockBody),
    });

    const result = await loginUser(formData);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8001/Sustainability_Log_Development/login_capture.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      }
    );
    expect(result).toEqual(mockBody);
  });

  test("loginUser rethrows generic error on failure", async () => {
    global.fetch.mockRejectedValue(new Error("Server offline"));

    await expect(loginUser({})).rejects.toThrow("An error occurred.");
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test("createActionFunction posts form data and returns parsed JSON", async () => {
    const formData = new FormData();
    formData.append("key", "value");
    const mockBody = { success: true };

    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockBody),
    });

    const result = await createActionFunction(formData);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8001/Sustainability_Log_Development/create_action.php",
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );
    expect(result).toEqual(mockBody);
  });

  test("createActionFunction forwards detailed error message", async () => {
    global.fetch.mockRejectedValue(new Error("Upload failed"));

    await expect(createActionFunction(new FormData())).rejects.toThrow(
      "Failed to create agreement: Upload failed"
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test("logoutUser succeeds when backend responds OK", async () => {
    global.fetch.mockResolvedValue({ ok: true });

    await expect(logoutUser()).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8001/Sustainability_Log_Development/logout_component.php",
      {
        method: "POST",
        credentials: "include",
      }
    );
  });

  test("logoutUser throws when backend response is not OK", async () => {
    global.fetch.mockResolvedValue({ ok: false });

    await expect(logoutUser()).rejects.toThrow(
      "An error occurred during logout."
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test("userDashboard posts request and returns parsed data", async () => {
    const mockBody = { stats: {} };

    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockBody),
    });

    const result = await userDashboard();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8001/Sustainability_Log_Development/user_dashboard.php",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    expect(result).toEqual(mockBody);
  });

  test("userDashboard wraps fetch rejection into dashboard-specific error", async () => {
    global.fetch.mockRejectedValue(new Error("Connection reset"));

    await expect(userDashboard()).rejects.toThrow(
      "Failed to fetch dashboard data"
    );
  });

  test("searchCompanyNames posts search term and returns results", async () => {
    const mockBody = { suggestions: ["Acme Corp"] };

    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockBody),
    });

    const result = await searchCompanyNames("Acme");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8001/Sustainability_Log_Development/company_name_search.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ searchTerm: "Acme" }),
      }
    );
    expect(result).toEqual(mockBody);
  });

  test("searchCompanyNames throws on failure", async () => {
    global.fetch.mockRejectedValue(new Error("Search failed"));

    await expect(searchCompanyNames("Acme")).rejects.toThrow(
      "Failed to search for companies"
    );
  });

  test("fetchTimeline gets timeline data by slug", async () => {
    const mockBody = { timeline: [] };

    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockBody),
    });

    const result = await fetchTimeline("acme-corp");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8001/Sustainability_Log_Development/get_timeline.php?slug=acme-corp",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    expect(result).toEqual(mockBody);
  });

  test("fetchTimeline throws on failure", async () => {
    global.fetch.mockRejectedValue(new Error("Timeline error"));

    await expect(fetchTimeline("acme-corp")).rejects.toThrow(
      "Failed to load timeline"
    );
  });

  test("fetchCompanyMap fetches company URLs", async () => {
    const mockBody = { urls: { acme: "https://acme.com" } };

    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockBody),
    });

    const result = await fetchCompanyMap();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8001/Sustainability_Log_Development/get_company_urls.php",
      {
        method: "GET",
        credentials: "include",
      }
    );
    expect(result).toEqual(mockBody);
  });

  test("fetchUserTimelineUrlQr fetches timeline URL and QR code", async () => {
    const mockBody = {
      status: "success",
      timeline_url: "https://example.com/timeline",
      qr_code: "/qr/example.png",
    };

    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockBody),
    });

    const result = await fetchUserTimelineUrlQr();

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8001/Sustainability_Log_Development/get_user_company_url_qr.php",
      {
        method: "GET",
        credentials: "include",
      }
    );
    expect(result).toEqual(mockBody);
  });

  test("fetchUserTimelineUrlQr throws on failure", async () => {
    global.fetch.mockRejectedValue(new Error("Timeline QR error"));

    await expect(fetchUserTimelineUrlQr()).rejects.toThrow(
      "Failed to fetch user timeline URL and QR code"
    );
  });

  test("fetchCompanyMap throws on failure", async () => {
    global.fetch.mockRejectedValue(new Error("Map error"));

    await expect(fetchCompanyMap()).rejects.toThrow(
      "Failed to fetch company URLs"
    );
  });
});
