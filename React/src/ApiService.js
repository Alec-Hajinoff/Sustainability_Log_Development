//Frontend - backend communication must happen over HTTPS on production

export const registerUser = async (formData) => {
  try {
    const response = await fetch(
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred.");
  }
};

export const loginUser = async (formData) => {
  try {
    const response = await fetch(
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred.");
  }
};

// createActionFunction() is the API call to send to the backend the agreement text + the file submitted by the user.

export const createActionFunction = async (formData) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Sustainability_Log_Development/create_action.php",
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in createActionFunction:", error);
    throw new Error(`Failed to create agreement: ${error.message}`);
  }
};

export const logoutUser = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/Climate_Bind_Development/logout_component.php",
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Logout failed");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    throw new Error("An error occurred during logout.");
  }
};

// userDashboard() fetches data from the database to populate the company-user dashboard in CreateAction.js.

export const userDashboard = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/Sustainability_Log_Development/user_dashboard.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to fetch dashboard data");
  }
};

// searchCompanyNames() fetches company name suggestions for @mentions

export const searchCompanyNames = async (searchTerm) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Sustainability_Log_Development/company_name_search.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ searchTerm }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to search for companies");
  }
};

// fetchTimeline() retrieves public sustainability actions for a company by slug.

export const fetchTimeline = async (slug) => {
  try {
    const response = await fetch(
      `http://localhost:8001/Sustainability_Log_Development/get_timeline.php?slug=${slug}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to load timeline");
  }
};

// fetchCompanyMap() fetches URLs from the database to make mentions clickable.

export const fetchCompanyMap = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/Sustainability_Log_Development/get_company_urls.php",
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data = await response.json();
    return data;
  } catch (err) {
    throw new Error("Failed to fetch company URLs");
  }
};

// fetchUserTimelineUrlQr() fetches company URL which is displayed just above the timeline.

export const fetchUserTimelineUrlQr = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/Sustainability_Log_Development/get_user_company_url_qr.php",
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data = await response.json();
    return data;
  } catch (err) {
    throw new Error("Failed to fetch user timeline URL and QR code");
  }
};

