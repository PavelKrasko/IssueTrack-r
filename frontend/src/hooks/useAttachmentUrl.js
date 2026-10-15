/**
 * Адрес картинки вложения: { url, status }.
 * att: { url } — сохранённый на сервере файл, или { localUrl } — файл, выбранный, но ещё не загруженный.
 * Файлы с сервера отдаются по cookie-сессии, поэтому обычный <img src> работает.
 */
export function useAttachmentUrl(att) {
  const url = att?.localUrl ?? att?.url ?? null;
  return { url, status: url ? "ready" : "error" };
}
