import { useEffect, useRef, useState, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Animation variant */
  variant?: "fade-up" | "fade" | "zoom" | "slide-left" | "slide-right";
  /** Delay in ms */
  delay?: number;
  /** Replay every time it enters viewport */
  repeat?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Scroll-reveal wrapper using IntersectionObserver.
 * Adds an "in-view" class when the element enters the viewport.
 */
export default function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  repeat = false,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (!repeat) observer.unobserve(entry.target);
          } else if (repeat) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [repeat]);

  const Component = Tag as any;
  return (
    <Component
      ref={ref}
      style={{ transitionDelay: `${delay}ms`, animationDelay: `${delay}ms` }}
      className={`reveal reveal-${variant} ${visible ? "in-view" : ""} ${className}`}
    >
      {children}
    </Component>
  );
}
