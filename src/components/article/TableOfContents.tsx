"use client";

import { useState, useEffect } from "react";

interface TOCItem { id: string; text: string; level: number }

export function TableOfContents({ content }: { content: string }) {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const headings = doc.querySelectorAll("h2, h3");
    const toc: TOCItem[] = Array.from(headings).map((h, i) => {
      const id = `heading-${i}`;
      h.id = id;
      return { id, text: h.textContent || "", level: parseInt(h.tagName[1]) };
    });
    setItems(toc);

    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { setActiveId(e.target.id); break; }
    }, { rootMargin: "-80px 0px -80% 0px" });
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [content]);

  if (items.length < 2) return null;

  return (
    <nav className="bg-gray-50 rounded-xl p-4 mb-6" aria-label="İçindekiler">
      <h2 className="text-sm font-bold text-gray-900 mb-3">📑 İçindekiler</h2>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: (item.level - 2) * 16 }}>
            <a href={`#${item.id}`} className={`text-xs block py-1 transition-colors ${activeId === item.id ? "text-blue-600 font-semibold" : "text-gray-500 hover:text-gray-900"}`}>
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
