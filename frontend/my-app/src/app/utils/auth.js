import { API_URL } from "./constants";

// Public endpoints (no auth required)

/**
 * Fetches the current user's profile information
 * @returns {Promise<Object>} Profile data
 */
export async function getMyProfile() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.warn("No access token found. User is not authenticated.");
    return { success: false, error: "No access token found" };
  }

  try {
    const response = await authFetch(`${API_URL}/my_profile/`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch profile");
    }

    const Profile = await response.json();
    console.log(Profile)
    return {
      success: true,
      profile: Profile,
      token: token,
      isAdmin: (Profile.years_of_experience ? true : false),
    };
  } catch (error) {
    console.error("Profile fetch error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch profile",
    };
  }
}



/**
 * Fetches another user's profile by ID
 * @param {number|string} userId - ID of the user to fetch
 * @returns {Promise<Object>} Profile data
 */
export async function getUserProfile(userId) {
  try {
    const response = await authFetch(`${API_URL}/view_profile/${userId}/`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch user profile");
    }

    const profileData = await response.json();
    return {
      success: true,
      profile: profileData,
    };
  } catch (error) {
    console.error("User profile fetch error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch user profile",
    };
  }
}

/**
 * Updates the current user's profile
 * @param {Object} updatedData - The updated profile data
 * @returns {Promise<Object>} Update result
 */
export async function updateMyProfile(updatedData) {
  try {
    const response = await authFetch(`${API_URL}/my_profile/`, {
      method: "PUT",
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || errorData.error || "Profile update failed"
      );
    }

    const result = await response.json();
    console.log(result)
    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      error: error.message || "Profile update failed",
    };
  }
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const textResponse = await res.text(); // Log raw response


  const data = JSON.parse(textResponse); // Try parsing JSON
  console.log("Parsed JSON Response:", data);

  if (!res.ok) {
    alert(data.error);
  }

  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refreshToken", data.refresh);

  return res;

}

export async function signUp(formData) {
  const formDataToSend = new FormData();

  // Append user data
  Object.entries({
    "user.username": formData.username,
    "user.email": formData.email,
    "user.password": formData.password,
    "user.phone_number": formData.phone_number,
    first_name: formData.first_name,
    last_name: formData.last_name,
    country: formData.country,
    city: formData.city,
    birthdate: formData.birthdate,
    gender: formData.gender,
    favorite_currency: formData.favorite_currency,
    is_admin: false
  }).forEach(([key, value]) => value && formDataToSend.append(key, value));

  // Append profile picture if exists
  if (formData.profile_picture) {
    formDataToSend.append("profile_picture", formData.profile_picture);
  }

  const res = await fetch(`${API_URL}/register/`, {
    method: "POST",
    body: formDataToSend,
  });
  try {
    const data = await res.json();

    if (data.user && res.ok) {
      localStorage.setItem("userInfo", JSON.stringify(data.user));
    }
    if (data.access && data.refresh && res.ok) {
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
    }
  } catch (err) {
    alert(err);
  }
  return res;
}

export async function addAdmin(formData) {
  const formDataToSend = new FormData();

  // Append user data
  Object.entries({
    "user.username": formData.username,
    "user.email": formData.email,
    "user.password": formData.password,
    "user.phone_number": formData.phone_number,
    first_name: formData.first_name,
    last_name: formData.last_name,
    country: formData.country,
    city: formData.city,
    birthdate: formData.birthdate,
    gender: formData.gender,
    favorite_currency: formData.favorite_currency,
  }).forEach(([key, value]) => value && formDataToSend.append(key, value));

  // Append profile picture if exists
  if (formData.profile_picture) {
    formDataToSend.append("profile_picture", formData.profile_picture);
  }

  const res = await fetch(`${API_URL}/register/`, {
    method: "POST",
    body: formDataToSend,
  });
  try {
    const data = await res.json();

    if (data.user && res.ok) {
      localStorage.setItem("userInfo", JSON.stringify(data.user));
    }
    if (data.access && data.refresh && res.ok) {
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
    }
  } catch (err) {
    alert(err);
  }
  return res;
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
      ...(token && { Authorization: `Bearer ${token}` }),
    },
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
          Authorization: `Bearer ${newToken}`,
        },
      });
    }
    logout(); // Force logout if refresh fails
    throw new Error("Session expired");
  }

  return response;
};


export const fetchAllFlights = async () => {
  try {
    const response = await fetch(`${API_URL}/all_trips/`);

    if (!response.ok) {
      // Try to get error details from response
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Fetch flights error:', error);
    // Return a consistent error structure
    return {
      success: false,
      error: error.message,
      status: error.response?.status
    };
  }
};

export const fetchFavourites = async () => {
  try {
    const token = localStorage.getItem('accessToken')
    const response = await fetch(`http://127.0.0.1:8000/favorites/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });


    const favourites = await response.json()
    const success = response.ok
    return {
      favourites, success, token

    }
  } catch (err) {
    alert(err)
  }
}