/**
 * Merkezi Validation Kütüphanesi
 *
 * Tüm API endpoint'leri için Zod şemaları ve standart hata response yardımcıları.
 */

import { z } from "zod";
import { NextResponse } from "next/server";

// ─── Yardımcı Fonksiyonlar ─────────────────────────────────

/** Standart validation hatası response'u */
export function validationErrorResponse(error: z.ZodError) {
  return NextResponse.json(
    {
      error: "Validation Error",
      details: error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    },
    { status: 400 }
  );
}

/** Standart başarı response'u */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/** Standart hata response'u */
export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

/** Standart unauthorized response */
export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Standart not found response */
export function notFoundResponse(resource = "Kaynak") {
  return NextResponse.json({ error: `${resource} bulunamadı` }, { status: 404 });
}

/** Pagination response yardımcısı */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

/** Body'yi Zod şeması ile validate et, hata varsa otomatik response döndür */
export async function validateBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return { success: false, response: validationErrorResponse(result.error) };
    }
    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      ),
    };
  }
}

/** Query parametrelerini Zod şeması ile validate et */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);
  if (!result.success) {
    return { success: false, response: validationErrorResponse(result.error) };
  }
  return { success: true, data: result.data };
}

/** Params'ları Zod şeması ile validate et */
export function validateParams<T>(
  params: Record<string, string>,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(params);
  if (!result.success) {
    return { success: false, response: validationErrorResponse(result.error) };
  }
  return { success: true, data: result.data };
}

// ─── ID / Param Şemaları ───────────────────────────────────

export const CuidParamsSchema = z.object({
  id: z.string().min(1, "ID parametresi zorunludur"),
});

// ─── Pagination Şeması ─────────────────────────────────────

export const PaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => {
      const n = parseInt(v || "1");
      return isNaN(n) || n < 1 ? 1 : n;
    }),
  pageSize: z
    .string()
    .optional()
    .transform((v) => {
      const n = parseInt(v || "20");
      return isNaN(n) || n < 1 ? 20 : Math.min(n, 100);
    }),
});

export const ArticleListQuerySchema = PaginationSchema.extend({
  status: z.enum(["draft", "published", "archived"]).optional(),
  search: z
    .string()
    .optional()
    .transform((v) => (v && v.length >= 2 ? v : undefined)),
  categoryId: z.string().optional(),
});

// ─── Search Şeması ─────────────────────────────────────────

export const SearchQuerySchema = PaginationSchema.extend({
  q: z
    .string()
    .min(2, "Arama terimi en az 2 karakter olmalıdır")
    .max(200, "Arama terimi 200 karakterden uzun olamaz"),
});

// ─── Article Şemaları ──────────────────────────────────────

export const ArticleCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Başlık zorunludur")
    .max(300, "Başlık 300 karakterden uzun olamaz"),
  content: z
    .string()
    .min(1, "İçerik zorunludur"),
  excerpt: z.string().max(500).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  authorId: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featuredImage: z
    .string()
    .url("Geçerli bir URL giriniz")
    .optional()
    .nullable()
    .or(z.literal("")),
  metaTitle: z.string().max(70, "Meta başlık 70 karakterden uzun olamaz").optional().nullable(),
  metaDescription: z.string().max(160, "Meta açıklama 160 karakterden uzun olamaz").optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
  tags: z.array(z.string().max(50)).max(20, "En fazla 20 etiket eklenebilir").optional().default([]),
});

export const ArticleUpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  authorId: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  featuredImage: z
    .string()
    .url("Geçerli bir URL giriniz")
    .optional()
    .nullable()
    .or(z.literal("")),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

// ─── Source Şemaları ───────────────────────────────────────

export const SourceCreateSchema = z.object({
  name: z.string().min(1, "Kaynak adı zorunludur").max(100),
  url: z.string().url("Geçerli bir URL giriniz"),
  type: z.enum(["rss", "web"]).default("rss"),
  feedUrl: z.string().url("Geçerli bir feed URL giriniz").optional().nullable(),
  language: z.enum(["tr", "en"]).default("tr"),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(1).max(10).default(5),
  fetchIntervalMin: z.number().int().min(1).default(180),
  selectorTitle: z.string().optional().nullable(),
  selectorContent: z.string().optional().nullable(),
  selectorImage: z.string().optional().nullable(),
  selectorLink: z.string().optional().nullable(),
});

// ─── Category Şeması ───────────────────────────────────────

export const CategoryCreateSchema = z.object({
  name: z.string().min(1, "Kategori adı zorunludur").max(100),
  description: z.string().max(500).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir hex renk kodu giriniz (#RRGGBB)")
    .optional()
    .default("#3B82F6"),
  sortOrder: z.number().int().min(0).optional().default(0),
});

// ─── Author Şeması ─────────────────────────────────────────

export const AuthorCreateSchema = z.object({
  name: z.string().min(1, "Yazar adı zorunludur").max(100),
  avatar: z.string().url("Geçerli bir URL giriniz").optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  isBot: z.boolean().default(false),
  specialty: z.string().max(200).optional().nullable(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").optional().nullable(),
});

// ─── Tag Şeması ────────────────────────────────────────────

export const TagCreateSchema = z.object({
  name: z.string().min(1, "Etiket adı zorunludur").max(50),
});

// ─── Settings Şeması ───────────────────────────────────────

export const SettingsUpdateSchema = z.record(
  z.string().min(1),
  z.string()
);

// ─── Bot Log Query Şeması ──────────────────────────────────

export const BotLogQuerySchema = PaginationSchema;
