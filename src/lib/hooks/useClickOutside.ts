import { useEffect, type RefObject } from "react";

export function useClickOutside(
  refs: RefObject<HTMLElement>[],
  onOutsideClick: () => void,
  isActive: boolean = true,
) {
  useEffect(() => {
    if (!isActive) return;

    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInside = refs.some((ref) => ref.current?.contains(target));
      if (!clickedInside) onOutsideClick();
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [refs, onOutsideClick, isActive]);
}
