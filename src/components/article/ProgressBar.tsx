"use client";

import { useState, useEffect } from "react";

export function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div className="fixed top-0 left-0 w-full h-0.5 z-50 bg-gray-100"><div className="h-full bg-blue-600 transition-all duration-150" style={{ width: `${progress}%` }} /></div>;
}
