/**
 * Упоминания @Имя.
 * На сервере хранятся как @[Имя Фамилия](user:<uuid>) — так их можно надёжно найти и переименование
 * человека ничего не ломает. В поле ввода пользователь видит просто «@Имя Фамилия».
 */

const MARKUP_RE = /@\[([^\]\n]{1,100})\]\(user:([0-9a-fA-F-]{36})\)/g;

/** Текст с разметкой → { text для поля ввода, picked: [{ id, name }] } */
export function fromMarkup(body = "") {
  const picked = [];
  const text = body.replace(MARKUP_RE, (_, name, id) => {
    if (!picked.some((p) => p.id === id)) picked.push({ id, name });
    return `@${name}`;
  });
  return { text, picked };
}

/** Текст из поля ввода + выбранные люди → текст с разметкой. Длинные имена заменяем первыми. */
export function toMarkup(text, picked) {
  let out = text;
  const sorted = [...picked].sort((a, b) => b.name.length - a.name.length);
  for (const p of sorted) {
    const escaped = p.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`(^|[^\\w\\]])@${escaped}(?![\\wа-яё])`, "giu"), `$1@[${p.name}](user:${p.id})`);
  }
  return out;
}

/** Разбивает текст на куски для отображения: { type: "text"|"mention"|"link", value, id } */
export function segments(body = "") {
  const out = [];
  const re = /@\[([^\]\n]{1,100})\]\(user:([0-9a-fA-F-]{36})\)|(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"»])/g;
  let last = 0;
  let m;
  while ((m = re.exec(body))) {
    if (m.index > last) out.push({ type: "text", value: body.slice(last, m.index) });
    if (m[1]) out.push({ type: "mention", value: m[1], id: m[2] });
    else out.push({ type: "link", value: m[3] });
    last = m.index + m[0].length;
  }
  if (last < body.length) out.push({ type: "text", value: body.slice(last) });
  return out;
}

/** Убирает разметку — для превью и поиска */
export const plainText = (body = "") => body.replace(MARKUP_RE, "@$1");
