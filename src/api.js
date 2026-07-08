// Thin fetch wrapper for the Worker API (worker/index.js). Same-origin in
// production; proxied via vite.config.js `server.proxy` in dev.

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  register: (email, password, name) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  getProjects: () => request('/projects'),
  createProject: (name) => request('/projects', { method: 'POST', body: JSON.stringify({ name }) }),
  updateProject: (id, patch) => request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  createInvite: (projectId) => request(`/projects/${projectId}/invite`, { method: 'POST' }),
  acceptInvite: (code) => request(`/invites/${code}/accept`, { method: 'POST' }),
  getMembers: (projectId) => request(`/projects/${projectId}/members`),

  getCheckins: () => request('/checkins'),
  postCheckin: (checkin) => request('/checkins', { method: 'POST', body: JSON.stringify(checkin) }),
};
