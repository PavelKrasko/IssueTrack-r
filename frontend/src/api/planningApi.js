import { request } from "./client";

/**
 * Спринты и версии (backend: internal/httpapi/planning.go)
 *
 * Sprint:  { id, name, goal, state: planned|active|closed, startDate, endDate, closedAt,
 *            issuesTotal, issuesDone, pointsTotal, pointsDone }
 * Version: { id, name, description, releaseDate, released, releasedAt, issuesTotal, issuesDone }
 */
const p = (pid) => `/projects/${pid}`;

export const sprintsApi = {
  list: (pid) => request(`${p(pid)}/sprints`),
  create: (pid, data) => request(`${p(pid)}/sprints`, { method: "POST", body: data }),
  update: (pid, id, patch) => request(`${p(pid)}/sprints/${id}`, { method: "PATCH", body: patch }),
  remove: (pid, id) => request(`${p(pid)}/sprints/${id}`, { method: "DELETE" }),
  /** { startDate?, endDate? } — по умолчанию сегодня и +14 дней */
  start: (pid, id, data = {}) => request(`${p(pid)}/sprints/${id}/start`, { method: "POST", body: data }),
  /** { moveTo: sprintId | null } → { sprint, movedIssues } */
  complete: (pid, id, moveTo = null) => request(`${p(pid)}/sprints/${id}/complete`, { method: "POST", body: { moveTo } }),
  /** → { unit: "points"|"issues", total, days: [{ date, remaining|null, ideal }] } */
  burndown: (pid, id) => request(`${p(pid)}/sprints/${id}/burndown`),
};

export const versionsApi = {
  list: (pid) => request(`${p(pid)}/versions`),
  create: (pid, data) => request(`${p(pid)}/versions`, { method: "POST", body: data }),
  update: (pid, id, patch) => request(`${p(pid)}/versions/${id}`, { method: "PATCH", body: patch }),
  remove: (pid, id) => request(`${p(pid)}/versions/${id}`, { method: "DELETE" }),
};

/** Списанное время по людям и дням: → { from, to, rows: [{ userId, date, minutes }] } */
export const timeReportApi = (pid, { from, to } = {}) => {
  const q = new URLSearchParams();
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  return request(`${p(pid)}/time-report${q.toString() ? `?${q}` : ""}`);
};
