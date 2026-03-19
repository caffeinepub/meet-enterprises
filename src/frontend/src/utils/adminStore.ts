// Simple module-level store for the verified admin token.
// Set once after the user enters the correct 4-digit code in the admin panel.
// Persisted in sessionStorage so it survives hot-reloads but clears on tab close.

let _adminToken = "";

export function setAdminToken(token: string): void {
  _adminToken = token;
  try {
    sessionStorage.setItem("meetAdminToken", token);
  } catch {}
}

export function getAdminToken(): string {
  if (_adminToken) return _adminToken;
  try {
    const stored = sessionStorage.getItem("meetAdminToken");
    if (stored) {
      _adminToken = stored;
      return stored;
    }
  } catch {}
  return "";
}

export function clearAdminToken(): void {
  _adminToken = "";
  try {
    sessionStorage.removeItem("meetAdminToken");
  } catch {}
}
