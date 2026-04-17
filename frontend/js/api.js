const API_BASE_URL = "http://localhost:3000";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("arcanjo_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Erro na requisição");
  }

  return data;
}

const Api = {
  get: (endpoint) => apiRequest(endpoint, { method: "GET" }),
  post: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    }),
  put: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(body)
    }),
  delete: (endpoint) =>
    apiRequest(endpoint, {
      method: "DELETE"
    })
};