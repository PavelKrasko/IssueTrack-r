/** Помощники для спринтов и иерархии задач */

export const SPRINT_STATE = { active: "активный", planned: "запланирован", closed: "завершён" };

/** Варианты для выбора спринта: без завершённых (кроме текущего — чтобы было видно, где задача) */
export function sprintOptions(sprints, currentId) {
  return sprints
    .filter((s) => s.state !== "closed" || s.id === currentId)
    .map((s) => ({ value: s.id, label: `${s.name} (${SPRINT_STATE[s.state]})`, disabled: s.state === "closed" }));
}

/** Все потомки задачи (подзадачи подзадач и т.д.) */
export function descendants(id, childrenOf) {
  const out = [];
  const stack = [...(childrenOf[id] ?? [])];
  while (stack.length) {
    const i = stack.pop();
    out.push(i);
    stack.push(...(childrenOf[i.id] ?? []));
  }
  return out;
}
