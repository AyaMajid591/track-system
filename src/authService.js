const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_FALLBACK_URL = process.env.REACT_APP_API_FALLBACK_URL || "http://localhost:5050";

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const error = new Error("Backend did not return JSON. Check that the TRACK backend server is running.");
    error.isConnectionError = true;
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || "Request failed. Please try again.");
    error.isHttpError = true;
    throw error;
  }

  return data;
};

export const getToken = () => localStorage.getItem("track_token");

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("track_user") || "null");
  } catch {
    return null;
  }
};

export const isLoggedIn = () => Boolean(getToken());

export const logoutUser = () => {
  localStorage.removeItem("track_token");
  localStorage.removeItem("track_user");
};

export const apiRequest = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requestOptions = {
    ...options,
    headers,
  };

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, requestOptions);
    return await parseResponse(response);
  } catch (err) {
    if (!err.isHttpError && API_FALLBACK_URL && API_FALLBACK_URL !== API_BASE_URL) {
      response = await fetch(`${API_FALLBACK_URL}${path}`, requestOptions);
      return parseResponse(response);
    }

    throw err;
  }
};

export const loginUser = async ({ email, password }) => {
  const data = await apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem("track_token", data.token);
  localStorage.setItem("track_user", JSON.stringify(data.user));

  return data;
};

export const registerUser = ({ name, email, password }) => {
  return apiRequest("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
};

export const requestPasswordReset = ({ email }) => {
  return apiRequest("/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const saveRememberedEmail = (email, rememberEmail) => {
  if (rememberEmail) {
    localStorage.setItem("track_user_email", email);
  } else {
    localStorage.removeItem("track_user_email");
  }
};
