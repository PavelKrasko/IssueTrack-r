import { API_URL, request, upload } from "./client";

/**
 * Авторизация (backend: internal/httpapi/auth.go, users.go)
 *   GET    /auth/me                       → User | 401
 *   POST   /auth/register                 { name, email, password } → User
 *   POST   /auth/login                    { email, password } → User
 *   POST   /auth/logout
 *   GET    /auth/oauth/{google|github}    → редирект к провайдеру (?mode=link — привязать к текущему аккаунту)
 *   PATCH  /users/me                      { name, jobTitle, about } → User
 *   POST   /users/me/password             { current, next }
 *   DELETE /users/me/providers/{provider} → User
 *   POST   /users/me/avatar               multipart { file } → User
 *   DELETE /users/me/avatar               → User
 */
export const authApi = {
  me: async () => {
    try {
      return await request("/auth/me");
    } catch (e) {
      if (e.status === 401) return null;
      throw e;
    }
  },
  login: (data) => request("/auth/login", { method: "POST", body: data }),
  register: (data) => request("/auth/register", { method: "POST", body: data }),
  logout: () => request("/auth/logout", { method: "POST" }).catch(() => null),

  /** Уходим со страницы к Google/GitHub; вернёмся на /app/board (или /app/profile при привязке) */
  oauth: (provider, { link = false } = {}) => {
    window.location.assign(`${API_URL}/auth/oauth/${provider}${link ? "?mode=link" : ""}`);
    return new Promise(() => {});
  },

  updateProfile: (patch) => request("/users/me", { method: "PATCH", body: patch }),
  changePassword: (data) => request("/users/me/password", { method: "POST", body: data }),
  disconnectProvider: (provider) => request(`/users/me/providers/${provider}`, { method: "DELETE" }),
  uploadAvatar: (file) => upload("/users/me/avatar", { file }),
  deleteAvatar: () => request("/users/me/avatar", { method: "DELETE" }),
};
