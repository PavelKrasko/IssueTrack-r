import { request, upload } from "./client";

/**
 * Документация проекта (backend: internal/httpapi/docs.go)
 * Doc: { id, kind: "file" | "link", name, size, type, url, category, description,
 *        issueId, uploadedBy, createdAt, updatedAt }
 * Для файлов url = /api/projects/{pid}/docs/{id}/content (?download=1 — скачать).
 */
const base = (pid) => `/projects/${pid}/docs`;

export const docsApi = {
  list: (pid) => request(base(pid)),
  upload: (pid, file, { category, description, issueId } = {}) => upload(base(pid), { file, category, description, issueId }),
  addLink: (pid, meta) => request(`${base(pid)}/links`, { method: "POST", body: meta }),
  update: (pid, id, meta) => request(`${base(pid)}/${id}`, { method: "PATCH", body: meta }),
  remove: (pid, id) => request(`${base(pid)}/${id}`, { method: "DELETE" }),
};
