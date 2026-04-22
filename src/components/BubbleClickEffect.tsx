import { useEffect, useRef } from "react";

/**
 * Global bubble / ripple effect on every click.
 * Mounts a fixed full-screen overlay and spawns expanding bubbles
 * at the click coordinate. Pointer events are disabled so it never
 * blocks interactions.
 */
export default function BubbleClickEffect() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--accent))",
      "hsl(var(--lavender-deep))",
      "hsl(var(--cyan))",
    ];

    const handleClick = (e: MouseEvent) => {
      // Spawn 1 main ripple + 4 small bubbles
      const x = e.clientX;
      const y = e.clientY;

      // Main ripple
      const ripple = document.createElement("span");
      ripple.className = "lv-ripple";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      layer.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);

      // Floating bubbles
      for (let i = 0; i < 5; i++) {
        const bubble = document.createElement("span");
        bubble.className = "lv-bubble";
        const size = 6 + Math.random() * 14;
        const dx = (Math.random() - 0.5) * 120;
        const dy = -40 - Math.random() * 90;
        bubble.style.left = `${x}px`;
        bubble.style.top = `${y}px`;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.background = colors[i % colors.length];
        bubble.style.setProperty("--dx", `${dx}px`);
        bubble.style.setProperty("--dy", `${dy}px`);
        bubble.style.animationDelay = `${i * 40}ms`;
        layer.appendChild(bubble);
        setTimeout(() => bubble.remove(), 1100);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    />
  );
}
