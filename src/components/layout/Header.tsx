"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export default function Header({ categories }: { categories: Category[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white border-b transition-shadow ${
          scrolled ? "shadow-md border-gray-200" : "shadow-sm border-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Sol - Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
                <span className="text-white font-bold text-sm">TA</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-extrabold text-gray-900">
                  Teknoloji<span className="text-blue-600">Akışı</span>
                </span>
              </div>
            </Link>

            {/* Orta - Kategoriler (Desktop) */}
            <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto">
              {categories.slice(0, 7).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
              {categories.length > 7 && (
                <Link
                  href="/kategori/genel"
                  className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  +{categories.length - 7}
                </Link>
              )}
            </nav>

            {/* Sağ - İkonlar */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/arama"
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                aria-label="Ara"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
              {/* Mobil Menü Butonu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                aria-label="Menü"
              >
                {mobileOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobil Menü Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl overflow-y-auto animate-slide-in">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <span className="font-bold text-gray-900">Menü</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-1">
              <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
                🏠 Ana Sayfa
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </Link>
              ))}
              <hr className="my-3" />
              <Link href="/arama" className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50">
                🔍 Haber Ara
              </Link>
              <Link href="/hakkimizda" className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50">
                📖 Hakkımızda
              </Link>
              <Link href="/iletisim" className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50">
                ✉️ İletişim
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
