import { request, upload } from "./client";

/**
 * Задачи (backend: internal/httpapi/issues.go, files.go)
 *
 * Issue: { id, key, number, title, description, type, status, priority, assigneeId,
 *          teamId, startDate, dueDate (YYYY-MM-DD), points, reporterId, createdAt, updatedAt, completedAt,
 *          attachments: [{ id, name, size, type, url, createdAt }] }
 *
 * PATCH принимает только изменённые поля; "" или null очищает необязательное поле.
 * Вложения: PNG/JPG/GIF/WebP до 5 МБ, до 10 на задачу (проверяется на сервере).
 */
const base = (pid) => `/projects/${pid}/issues`;

export const issuesApi = {
  list: (pid) => request(base(pid)),
  create: (pid, data) => request(base(pid), { method: "POST", body: data }),
  update: (pid, id, patch) => request(`${base(pid)}/${id}`, { method: "PATCH", body: patch }),
  remove: (pid, id) => request(`${base(pid)}/${id}`, { method: "DELETE" }),
  events: (pid, id) => request(`${base(pid)}/${id}/events`),
  /** → обновлённая задача */
  addAttachment: (pid, id, file) => upload(`${base(pid)}/${id}/attachments`, { file }),
  /** → обновлённая задача */
  removeAttachment: (pid, id, attachmentId) => request(`${base(pid)}/${id}/attachments/${attachmentId}`, { method: "DELETE" }),
};
