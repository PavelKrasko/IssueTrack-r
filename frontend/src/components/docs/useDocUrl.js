/** Адрес документа: у ссылки — сама ссылка, у файла — /api/projects/{pid}/docs/{id}/content */
export function useDocUrl(doc) {
  return { url: doc.url ?? null };
}

/** Ссылка «Скачать»: сервер отдаст файл с Content-Disposition: attachment */
export const downloadUrl = (doc) => (doc.kind === "link" ? doc.url : `${doc.url}?download=1`);
