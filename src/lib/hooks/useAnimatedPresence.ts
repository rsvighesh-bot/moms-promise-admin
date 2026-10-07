import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

interface AnimationConfig {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
  duration?: number;
  exitDuration?: number;
}

export function useAnimatedPresence<T extends HTMLElement>(
  isOpen: boolean,
  config: AnimationConfig,
) {
  const ref = useRef<T>(null);
  const [shouldRender, setShouldRender] = useState(isOpen);

  // Mount the moment it opens
  useLayoutEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  // Animate in/out; only unmount after the exit animation finishes
  useLayoutEffect(() => {
    if (!shouldRender || !ref.current) return;

    if (isOpen) {
      gsap.fromTo(ref.current, config.from, {
        ...config.to,
        duration: config.duration ?? 0.15,
        ease: "power2.out",
      });
    } else {
      gsap.to(ref.current, {
        ...config.from,
        duration: config.exitDuration ?? 0.12,
        ease: "power1.in",
        onComplete: () => setShouldRender(false),
      });
    }
  }, [isOpen, shouldRender]);

  return { ref, shouldRender };
}
