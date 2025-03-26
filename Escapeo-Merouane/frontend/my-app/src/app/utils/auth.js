const API_URL = 'http://127.0.0.1:8000';

// Public endpoints (no auth required)
export const fetchFlights = async (searchParams) => {
  // Clean parameters - remove empty/undefined values
  const cleanedParams = Object.fromEntries(
    Object.entries(searchParams)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );

  try {
    const queryString = new URLSearchParams(cleanedParams).toString();
    const response = await fetch(`${API_URL}/search_trips/?${queryString}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Flight search failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Flight search error:', error);
    return {
      error: error.message,
      results: [],
      status: 'error'
    };
  }
};

// Authentication-related functions
export async function login(email, password) {
  const res = await fetch(`${API_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  if (!data.user || !data.access || !data.refresh) {
    console.error("Invalid response format from server");
    throw new Error("Invalid server response");
  }

  // Store tokens and user info
  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refreshToken", data.refresh);
  localStorage.setItem("userInfo", JSON.stringify(data.user));

  return data;
}

export async function signUp(formData) {
  const formDataToSend = new FormData();
  
  // Append user data
  Object.entries({
    "user.username": formData.username,
    "user.email": formData.email,
    "user.password": formData.password,
    "user.phone_number": formData.phone_number,
    "first_name": formData.first_name,
    "last_name": formData.last_name,
    "country": formData.country,
    "city": formData.city,
    "birthdate": formData.birthdate,
    "gender": formData.gender,
    "favorite_currency": formData.favorite_currency
  }).forEach(([key, value]) => value && formDataToSend.append(key, value));

  // Append profile picture if exists
  if (formData.profile_picture) {
    formDataToSend.append("profile_picture", formData.profile_picture);
  }

  const res = await fetch(`${API_URL}/register/`, {
    method: "POST",
    body: formDataToSend,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Sign-up failed");
  }

  // Store user info if available (note: registration might not return tokens)
  if (data.user) {
    localStorage.setItem("userInfo", JSON.stringify(data.user));
  }

  return data;
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) throw new Error("Failed to refresh token");

    const data = await response.json();
    localStorage.setItem("accessToken", data.access);
    return data.access;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
}

export function logout() {
  // Clear all auth-related data
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userInfo");
  
  // Redirect to home page
  window.location.href = "/";
}

// Helper for authenticated requests
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("accessToken");
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` })
    }
  });

  if (response.status === 401) {
    // Try to refresh token if unauthorized
    const newToken = await refreshAccessToken();
    if (newToken) {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          "Content-Type": "application/json",
          "Authorization": `Bearer ${newToken}`
        }
      });
    }
    logout(); // Force logout if refresh fails
    throw new Error("Session expired");
  }

  return response;
};