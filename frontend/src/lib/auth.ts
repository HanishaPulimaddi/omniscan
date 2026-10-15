// Reads the username out of the JWT for display only — the backend still
// verifies the token on every request, so nothing here is trusted.
export function getUsername(): string | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const data = JSON.parse(atob(payload));
    return typeof data.username === "string" ? data.username : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
}
