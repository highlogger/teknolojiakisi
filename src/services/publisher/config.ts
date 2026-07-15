/**
 * Publisher Engine — Merkezi Yayıncı Konfigürasyonu
 *
 * Google News ve genel yayıncı metadata'sı için.
 */

export const PUBLISHER = {
  name: "TeknolojiAkışı",
  legalName: "Teknoloji Akışı Dijital Yayıncılık",
  url: "https://teknolojiakisi.com.tr",
  logo: {
    url: "https://teknolojiakisi.com.tr/logo.png",
    width: 400,
    height: 400,
  },
  description: "Teknoloji dünyasından en güncel haberler, yapay zeka rehberleri ve derinlemesine analizler.",
  language: "tr",
  country: "TR",
  category: "Technology",
  founded: 2025,
  email: "info@teknolojiakisi.com.tr",
  social: {
    twitter: "https://twitter.com/teknolojiakisi",
    facebook: "https://www.facebook.com/teknolojiakisi",
    instagram: "https://www.instagram.com/teknolojiakisi",
    youtube: "https://www.youtube.com/@teknolojiakisi",
    linkedin: "",
  },
  googleNews: {
    publicationId: "teknolojiakisi",
    verificationCode: "",
  },
} as const;

export const NEWS_IMAGE_REQUIREMENTS = {
  minWidth: 1200,
  minHeight: 675,
  aspectRatio: "16:9",
  maxSize: "5MB",
  formats: ["JPEG", "PNG", "WebP"],
};
