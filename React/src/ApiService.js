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

// createAgreementFunction() is the API call to send to the backend the agreement text + the file submitted by the user.

export const createAgreementFunction = async (formData) => {
  try {
    const response = await fetch(
      "http://localhost:8001/Sustainability_Log_Development/create_agreement.php",
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in createAgreementFunction:", error);
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

// agreementHashFunction() checks a company's name in the database, as the user types it, and when there is a match fetches company data.

export const agreementHashFunction = async (searchTerm) => {
  try {
    const response = await fetch(
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

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to search for agreements");
  }
};

// userDashboard() fetches data from the database to populate the company-user dashboard in CreateAgreement.js.

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
