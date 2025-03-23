const API_URL = 'http://127.0.0.1:8000';
export async function login(email, password) {
  const res = await fetch(`${API_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  console.log("Login response:", data); // 🛠 Debugging

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  console.log("User data before saving:", data.user); // 🛠 Debugging

  if (!data.user) {
    console.error("❌ User info is missing in response!");
    return;
  }

  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refreshToken", data.refresh);
  localStorage.setItem("userInfo", JSON.stringify(data.user)); // ✅ Make sure this exists

  return data;
}

export async function signUp(formData) {
  const formDataToSend = new FormData();
  formDataToSend.append("user.username", formData.username);
  formDataToSend.append("user.email", formData.email);
  formDataToSend.append("user.password", formData.password);
  formDataToSend.append("user.phone_number", formData.phone_number);
  formDataToSend.append("first_name", formData.first_name);
  formDataToSend.append("last_name", formData.last_name);
  formDataToSend.append("country", formData.country);
  formDataToSend.append("city", formData.city);
  formDataToSend.append("birthdate", formData.birthdate);
  formDataToSend.append("gender", formData.gender);
  formDataToSend.append("favorite_currency", formData.favorite_currency);

  if (formData.profile_picture) {
    formDataToSend.append("profile_picture", formData.profile_picture);
  }

  const res = await fetch(`${API_URL}/register/`, {
    method: "POST",
    body: formDataToSend,
  });

  const data = await res.json();
  console.log("Signup response:", data); // 🛠 Debugging

  if (!res.ok) {
    throw new Error(data.error || "Sign-up failed");
  }

  console.log("User data before saving:", data.user); // 🛠 Debugging


  localStorage.setItem("userInfo", formDataToSend); // ✅ Make sure this exists
  return data;
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    return null; // No refresh token available
  }

  try {
    const response = await fetch(`${API_URL}/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    localStorage.setItem("accessToken", data.access); // Update access token
    return data.access; // Return the new access token
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null; // Return null if refresh fails
  }
}
export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userInfo");
  // Optionally, you can redirect the user to the login page
  window.location.href = "/";
}