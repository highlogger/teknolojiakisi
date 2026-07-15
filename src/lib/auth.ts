import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { authLogger as log } from "@/lib/logger";

// AUTH_SECRET varlığını kontrol et
if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
  throw new Error(
    "AUTH_SECRET environment variable is required and must be at least 32 characters. " +
    "Generate one with: openssl rand -hex 32"
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          return null;
        }

        // Input sanitization — trim and normalize
        const normalizedEmail = email.trim().toLowerCase();

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
          return null;
        }

        // Password minimum length check
        if (password.length < 6) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          log.warn("Login failed: user not found", { email: normalizedEmail });
          return null;
        }

        // Time-constant comparison to prevent timing attacks
        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          log.warn("Login failed: invalid password", { email: normalizedEmail });
          return null;
        }

        log.info("Login successful", { email: normalizedEmail, userId: user.id });
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      // Kullanıcı giriş yaptığında token'a bilgileri ekle
      if (user) {
        token.id = user.id!;
        token.email = user.email!;
        token.name = user.name!;
        token.role = (user as { role?: string }).role || "editor";
      }

      // Session update trigger'ı ile role değişikliğini yansıt
      if (trigger === "update") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, name: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.name = dbUser.name;
          }
        } catch {
          // DB hatasında mevcut token'ı koru
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/admin/giris",
    error: "/admin/giris", // Auth hatalarını login sayfasında göster
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 saat — session süresi
    updateAge: 30 * 60,   // 30 dakika aktivite ile session yenileme
  },

  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // JWT şifreleme
  jwt: {
    maxAge: 8 * 60 * 60, // Token max age — session maxAge ile aynı
  },

  // Secret — env'den al, yoksa hata fırlat (yukarıda kontrol edildi)
  secret: process.env.AUTH_SECRET,

  // Debug — sadece development'da
  debug: process.env.NODE_ENV === "development",
});
