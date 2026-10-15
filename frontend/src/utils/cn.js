/** Склеивает классы, пропуская false/null/undefined */
export const cn = (...classes) => classes.filter(Boolean).join(" ");

/** Единое кольцо фокуса для всех интерактивных элементов */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface";
