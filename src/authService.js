const normalizeBaseUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

const API_BASE_URL =
  normalizeBaseUrl(process.env.REACT_APP_API_URL) || "http://localhost:5050";
const API_FALLBACK_URL = normalizeBaseUrl(process.env.REACT_APP_API_FALLBACK_URL);

const createConnectionError = () => {
  const error = new Error(
    "Cannot reach the TRACK backend. Start the backend on port 5050 and make sure PostgreSQL is running on port 5432."
  );
  error.isConnectionError = true;
  return error;
};

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
  let lastError;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, requestOptions);
    return await parseResponse(response);
  } catch (err) {
    lastError = err;
    if (!err.isHttpError && API_FALLBACK_URL && API_FALLBACK_URL !== API_BASE_URL) {
      try {
        response = await fetch(`${API_FALLBACK_URL}${path}`, requestOptions);
        return await parseResponse(response);
      } catch (fallbackErr) {
        lastError = fallbackErr;
      }
    }
  }

  if (!lastError?.isHttpError) {
    throw createConnectionError();
  }

  throw lastError;
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
