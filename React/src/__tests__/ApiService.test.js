import {
  registerUser,
  loginUser,
  createAgreementFunction,
  logoutUser,
  agreementHashFunction,
  userDashboard,
} from "../ApiService";

// Mock global fetch
global.fetch = jest.fn();

describe("ApiService", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe("registerUser", () => {
    it("successfully registers a user", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true, message: "User registered" }),
      };
      fetch.mockResolvedValueOnce(mockResponse);

      const formData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const result = await registerUser(formData);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Sustainability_Log_Development/form_capture.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );
      expect(result).toEqual({ success: true, message: "User registered" });
    });

    it("handles registration error", async () => {
      const error = new Error("Network error");
      fetch.mockRejectedValueOnce(error);

      const formData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      await expect(registerUser(formData)).rejects.toThrow("An error occurred.");
    });
  });

  describe("loginUser", () => {
    it("successfully logs in a user", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true, message: "Login successful" }),
      };
      fetch.mockResolvedValueOnce(mockResponse);

      const formData = {
        username: "testuser",
        password: "password123",
      };

      const result = await loginUser(formData);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Sustainability_Log_Development/login_capture.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );
      expect(result).toEqual({ success: true, message: "Login successful" });
    });

    it("handles login error", async () => {
      const error = new Error("Network error");
      fetch.mockRejectedValueOnce(error);

      const formData = {
        username: "testuser",
        password: "password123",
      };

      await expect(loginUser(formData)).rejects.toThrow("An error occurred.");
    });
  });

  describe("createAgreementFunction", () => {
    it("successfully creates an agreement", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true, message: "Agreement created" }),
      };
      fetch.mockResolvedValueOnce(mockResponse);

      const formData = new FormData();
      formData.append("agreementText", "Test agreement");
      formData.append("file", new File(["test"], "test.pdf"));

      const result = await createAgreementFunction(formData);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Sustainability_Log_Development/create_agreement.php",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      expect(result).toEqual({ success: true, message: "Agreement created" });
    });

    it("handles agreement creation error", async () => {
      const error = new Error("Network error");
      fetch.mockRejectedValueOnce(error);

      const formData = new FormData();
      formData.append("agreementText", "Test agreement");

      await expect(createAgreementFunction(formData)).rejects.toThrow(
        "Failed to create agreement: Network error"
      );
    });
  });

  describe("logoutUser", () => {
  it("successfully logs out a user", async () => {
    const mockResponse = {
      ok: true,
    };
    fetch.mockResolvedValueOnce(mockResponse);

    await logoutUser();

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8001/Climate_Bind_Development/logout_component.php",
      {
        method: "POST",
        credentials: "include",
      }
    );
  });

  it("handles logout error", async () => {
    const mockResponse = {
      ok: false,
    };
    fetch.mockResolvedValueOnce(mockResponse);

    await expect(logoutUser()).rejects.toThrow("An error occurred during logout.");
  });
});

  describe("agreementHashFunction", () => {
    it("successfully searches for agreements", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true, agreements: [] }),
      };
      fetch.mockResolvedValueOnce(mockResponse);

      const searchTerm = "Test Company";
      const result = await agreementHashFunction(searchTerm);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Sustainability_Log_Development/agreement_hash.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ searchTerm }),
        }
      );
      expect(result).toEqual({ success: true, agreements: [] });
    });

    it("handles search error", async () => {
      const error = new Error("Network error");
      fetch.mockRejectedValueOnce(error);

      await expect(agreementHashFunction("test")).rejects.toThrow(
        "Failed to search for agreements"
      );
    });
  });

  describe("userDashboard", () => {
    it("successfully fetches dashboard data", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      };
      fetch.mockResolvedValueOnce(mockResponse);

      const result = await userDashboard();

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8001/Sustainability_Log_Development/user_dashboard.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      expect(result).toEqual({ success: true, data: [] });
    });

    it("handles dashboard fetch error", async () => {
      const error = new Error("Network error");
      fetch.mockRejectedValueOnce(error);

      await expect(userDashboard()).rejects.toThrow(
        "Failed to fetch dashboard data"
      );
    });
  });
});