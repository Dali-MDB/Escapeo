const API_URL = 'http://127.0.0.1:8000/';

export async function login(username, password) {
  const res = await fetch(`${API_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refreshToken", data.refresh);
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

  if (!res.ok) {
    throw new Error(data.error || "Sign-up failed");
  }

  return data;
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/get_refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  const data = await res.json();

  if (!res.ok) {
    logout();
    return null;
  }

  localStorage.setItem("accessToken", data.access);
  return data.access;
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/log/login";
}