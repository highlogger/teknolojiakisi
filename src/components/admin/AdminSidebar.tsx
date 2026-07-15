"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/newsroom", label: "AI Newsroom", icon: "🤖" },
  { href: "/admin/haberler", label: "Haberler", icon: "📰" },
  { href: "/admin/bot", label: "Scout Kontrol", icon: "🔍" },
  { href: "/admin/bot/kaynaklar", label: "Kaynaklar", icon: "📡" },
  { href: "/admin/bot/loglar", label: "Scout Logları", icon: "📋" },
  { href: "/admin/yazarlar", label: "Yazarlar", icon: "✍️" },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: "🏷️" },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: "⚙️" },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobil hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-900 text-white p-2 rounded-md"
        aria-label="Menüyü Aç/Kapa"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay mobil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-700">
          <Link href="/admin" className="text-xl font-bold tracking-tight">
            <span className="text-blue-400">Teknoloji</span>Akışı
          </Link>
          <p className="text-xs text-gray-400 mt-1">Yönetim Paneli</p>
        </div>

        {/* Navigasyon */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${
                  isActive(item.href)
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Kullanıcı Bilgisi */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold uppercase">
              {user?.name ? user.name.charAt(0) : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Kullanıcı"}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
              <span className="inline-block text-[10px] uppercase tracking-wider text-blue-400 font-semibold mt-0.5">
                {user?.role === "admin" ? "Yönetici" : "Editör"}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/giris" })}
            className="mt-3 w-full text-left text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5 px-1 py-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Çıkış Yap
          </button>
        </div>
      </aside>
    </>
  );
}
