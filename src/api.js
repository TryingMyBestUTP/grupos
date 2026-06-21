const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error del servidor");
  return data;
}

export const api = {
  check:  (code)         => req("POST",   "/api/auth/check",            { code }),
  login:  (code, pin)    => req("POST",   "/api/auth/login",            { code, pin }),
  groups: ()             => req("GET",    "/api/groups"),
  join:   (id, token)    => req("POST",   `/api/groups/${id}/join`,     { token }),
  leave:  (id, token)    => req("DELETE", `/api/groups/${id}/leave`,    { token }),
  export: ()             => `${BASE}/api/export/excel`,
};
