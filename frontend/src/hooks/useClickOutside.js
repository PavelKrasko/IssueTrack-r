import { useEffect } from "react";

/** Вызывает handler при клике/тапе вне всех переданных ref */
export function useClickOutside(refs, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onPointerDown = (e) => {
      const inside = refs.some((r) => r.current?.contains(e.target));
      if (!inside) handler(e);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, handler]);
}
