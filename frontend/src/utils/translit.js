export const TRANSLIT = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sh", ы: "y", э: "e", ю: "yu", я: "ya",
};

/** «Не работает вход!» → «ne-rabotaet-vhod» (для имён git-веток) */
export function slugify(text, max = 40) {
  const latin = text
    .toLowerCase()
    .split("")
    .map((c) => TRANSLIT[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return latin.slice(0, max).replace(/-+$/, "");
}

/** Имя ветки для задачи: bugfix/LOC-12-ne-rabotaet-vhod, feature/LOC-7-eksport-csv */
export function branchName(issue) {
  const prefix = issue.type === "bug" ? "bugfix" : "feature";
  const slug = slugify(issue.title);
  return `${prefix}/${issue.key}${slug ? `-${slug}` : ""}`;
}
