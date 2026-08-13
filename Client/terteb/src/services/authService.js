const API_URL = "http://localhost:5000/api/auth";

const authService = {
  // ===============================
  // LOGIN
  // ===============================
  loginUser: async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Save token
    localStorage.setItem("token", data.token);

    // Save logged-in user
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  },

  // ===============================
  // REGISTER
  // ===============================
  registerUser: async (name, email, password, role = "ADMIN") => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  },

  // ===============================
  // GET TOKEN
  // ===============================
  getToken: () => {
    return localStorage.getItem("token");
  },

  // ===============================
  // GET CURRENT USER
  // ===============================
  getCurrentUser: () => {
    const user = localStorage.getItem("user");

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch (error) {
      console.error("Invalid user data:", error);
      localStorage.removeItem("user");
      return null;
    }
  },

  // ===============================
  // LOGOUT
  // ===============================
  logoutUser: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // ===============================
  // AUTHORIZATION HEADER
  // ===============================
  getAuthHeader: () => {
    const token = localStorage.getItem("token");

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  },
};

export default authService;