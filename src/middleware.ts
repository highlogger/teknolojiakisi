import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { middlewareLogger as log } from "@/lib/logger";

// Sadece admin rolünün erişebileceği route'lar
const ADMIN_ONLY_ROUTES = [
  "/admin/ayarlar",
  "/admin/bot",
  "/admin/bot/kaynaklar",
  "/admin/bot/loglar",
  "/admin/yazarlar",
  "/admin/kategoriler",
];

// Hassas API endpoint'leri
const SENSITIVE_API_ROUTES = [
  "/api/articles",
  "/api/authors",
  "/api/bot",
  "/api/categories",
  "/api/settings",
  "/api/sources",
  "/api/tags",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // ─── Admin Route Koruması ───
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/giris")) {
    if (!session?.user) {
      log.warn("Unauthorized admin access attempt", { pathname });
      const loginUrl = new URL("/admin/giris", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin-only route'lar için role kontrolü
    const isAdminOnly = ADMIN_ONLY_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    if (isAdminOnly && session.user.role !== "admin") {
      log.warn("Editor attempted admin-only route", { pathname, userId: session.user.id });
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // ─── API Route Koruması ───
  if (pathname.startsWith("/api/")) {
    const isSensitive = SENSITIVE_API_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    if (isSensitive) {
      // GET istekleri hariç middleware'de kontrol et
      // (Detaylı auth kontrolü API route handler'larında yapılıyor)
      if (req.method !== "GET" && !session?.user) {
        return NextResponse.json(
          { error: "Unauthorized — authentication required" },
          { status: 401 }
        );
      }
    }
  }

  // ─── Login Sayfası ───
  if (pathname === "/admin/giris" && session?.user) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
