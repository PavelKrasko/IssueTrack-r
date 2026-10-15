import { request } from "./client";

/**
 * Уведомления (backend: internal/httpapi/notify.go)
 *
 * Notification: { id, kind: assigned|mentioned|commented|status, projectId, issueId,
 *                 actorId, actorName, actorAvatarUrl, read, createdAt,
 *                 payload: { issueKey, title, text?, from?, to? } }
 */
export const notificationsApi = {
  /** → { items, unread } */
  list: ({ unread = false, limit = 50 } = {}) => request(`/notifications?limit=${limit}${unread ? "&unread=1" : ""}`),
  /** → { unread } */
  read: (ids) => request("/notifications/read", { method: "POST", body: ids === "all" ? { all: true } : { ids } }),
};

/**
 * Telegram: { available, botUsername, linked, enabled, username }
 * link() → { url: "https://t.me/<бот>?start=<код>", expiresAt } — ссылка живёт 15 минут
 */
export const telegramApi = {
  get: () => request("/users/me/telegram"),
  link: () => request("/users/me/telegram/link", { method: "POST" }),
  setEnabled: (enabled) => request("/users/me/telegram", { method: "PATCH", body: { enabled } }),
  unlink: () => request("/users/me/telegram", { method: "DELETE" }),
};
