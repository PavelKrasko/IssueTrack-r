import { request } from "./client";

/**
 * Команды (backend: internal/httpapi/teams.go)
 * Team: { id, name, description, createdAt, members: [{ id (userId), name, email, avatarUrl, role }] }
 * В команду можно добавить только участника проекта.
 */
const base = (pid) => `/projects/${pid}/teams`;

export const teamsApi = {
  list: (pid) => request(base(pid)),
  create: (pid, data) => request(base(pid), { method: "POST", body: data }),
  update: (pid, id, data) => request(`${base(pid)}/${id}`, { method: "PATCH", body: data }),
  remove: (pid, id) => request(`${base(pid)}/${id}`, { method: "DELETE" }),
  addMember: (pid, teamId, { userId, role }) => request(`${base(pid)}/${teamId}/members`, { method: "POST", body: { userId, role } }),
  removeMember: (pid, teamId, userId) => request(`${base(pid)}/${teamId}/members/${userId}`, { method: "DELETE" }),
};
