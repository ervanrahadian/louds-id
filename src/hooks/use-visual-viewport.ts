import { useEffect, useState } from "react";

interface VisualViewportRect {
  top: number;
  height: number;
}

function readViewport(): VisualViewportRect {
  const viewport = window.visualViewport;
  if (!viewport) {
    return { top: 0, height: window.innerHeight };
  }
  return { top: viewport.offsetTop, height: viewport.height };
}

/** Visible viewport box, including when the mobile keyboard is open. */
export function useVisualViewportRect(): VisualViewportRect {
  const [rect, setRect] = useState<VisualViewportRect>(() =>
    typeof window === "undefined" ? { top: 0, height: 0 } : readViewport(),
  );

  useEffect(() => {
    const viewport = window.visualViewport;

    const sync = () => {
      setRect(readViewport());
      window.scrollTo(0, 0);
    };

    sync();
    viewport?.addEventListener("resize", sync);
    viewport?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);

    return () => {
      viewport?.removeEventListener("resize", sync);
      viewport?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return rect;
}
