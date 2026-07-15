"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/giris" })}
      className="w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors text-left"
    >
      Çıkış Yap
    </button>
  );
}
