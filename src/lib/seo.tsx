/**
 * TeknolojiAkışı — Merkezi SEO / JSON-LD kütüphanesi
 *
 * Google, Google News, ChatGPT, Perplexity ve diğer AI arama
 * araçlarının site içeriğini doğru şekilde keşfetmesi için
 * yapılandırılmış veri (JSON-LD) ve meta yardımcıları.
 */

import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import type { Metadata } from "next";

// ─── Site Kimliği ────────────────────────────────────────────
export const SITE_LOCALE = "tr_TR";
export const SITE_REGION = "TR";
export const SITE_GEO_PLACENAME = "Türkiye";
export const SITE_GEO_POSITION = "39.0;35.0"; // Türkiye merkez
export const SITE_GEO_REGION = "TR-06"; // Ankara
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
export const SITE_TWITTER_HANDLE = "@teknolojiakisi";

// ─── Metadata tabanı ────────────────────────────────────────
export const metadataBase: Metadata = {
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_TWITTER_HANDLE,
    creator: SITE_TWITTER_HANDLE,
    images: [DEFAULT_OG_IMAGE],
  },
};

// ─── JSON-LD Üreteçleri ─────────────────────────────────────

/** Şirket / Organizasyon bilgisi — tüm sayfalarda kullanılır */
export function generateOrganizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      "https://twitter.com/teknolojiakisi",
      "https://www.facebook.com/teknolojiakisi",
      "https://www.instagram.com/teknolojiakisi",
      "https://www.youtube.com/@teknolojiakisi",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["Turkish"],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "TR",
      addressLocality: "Ankara",
    },
  };
}

/** WebSite + SearchAction şeması — anasayfa için */
export function generateWebSiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "tr-TR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/arama?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/** BreadcrumbList — kategori, haber, yazar sayfaları için */
export function generateBreadcrumbLd(
  items: { name: string; url: string }[]
) {
  const listItems = [
    { "@type": "ListItem" as const, position: 1, name: "Anasayfa", item: SITE_URL },
    ...items.map((item, i) => ({
      "@type": "ListItem" as const,
      position: i + 2,
      name: item.name,
      item: item.url,
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: listItems,
  };
}

/** NewsArticle şeması — haber detay sayfası için */
export function generateNewsArticleLd(article: {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: { name: string; slug: string } | null;
  author: { name: string; slug: string } | null;
  tags: { tag: { name: string; slug: string } }[];
  originalUrl: string | null;
  language: string;
}) {
  const articleUrl = `${SITE_URL}/haber/${article.slug}`;
  const pubDate = article.publishedAt || article.createdAt;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || "",
    articleBody: article.content.replace(/<[^>]*>/g, "").substring(0, 5000),
    image: article.featuredImage || DEFAULT_OG_IMAGE,
    url: articleUrl,
    datePublished: pubDate.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    author: article.author
      ? {
          "@type": "Person",
          name: article.author.name,
          url: `${SITE_URL}/yazar/${article.author.slug}`,
        }
      : {
          "@type": "Organization",
          name: SITE_NAME,
        },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    ...(article.category && {
      articleSection: article.category.name,
    }),
    ...(article.tags.length > 0 && {
      keywords: article.tags.map((t) => t.tag.name).join(", "),
    }),
    ...(article.originalUrl && {
      isBasedOn: article.originalUrl,
    }),
    inLanguage: article.language,
    isAccessibleForFree: true,
    copyrightYear: new Date().getFullYear(),
    spatialCoverage: {
      "@type": "Place",
      name: "Türkiye",
    },
  };
}

/** CollectionPage şeması — kategori / yazar listeleme sayfaları için */
export function generateCollectionPageLd(params: {
  name: string;
  url: string;
  description: string;
  itemCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: params.name,
    url: params.url,
    description: params.description,
    numberOfItems: params.itemCount,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: {
      "@type": "Thing",
      name: params.name,
    },
  };
}

/** ProfilePage / Person şeması — yazar sayfası için */
export function generatePersonLd(author: {
  name: string;
  slug: string;
  bio: string | null;
  avatar: string | null;
  articleCount: number;
}) {
  const authorUrl = `${SITE_URL}/yazar/${author.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: authorUrl,
    description: author.bio || `${author.name} - ${SITE_NAME} yazarı`,
    image: author.avatar || undefined,
    mainEntityOfPage: {
      "@type": "ProfilePage",
      "@id": authorUrl,
      mainEntity: {
        "@type": "Person",
        name: author.name,
      },
    },
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/** AboutPage şeması — hakkımızda sayfası için */
export function generateAboutPageLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `Hakkımızda - ${SITE_NAME}`,
    url: `${SITE_URL}/hakkimizda`,
    description: SITE_DESCRIPTION,
    about: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/** ContactPage şeması — iletişim sayfası için */
export function generateContactPageLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `İletişim - ${SITE_NAME}`,
    url: `${SITE_URL}/iletisim`,
    description: `${SITE_NAME} ile iletişime geçin.`,
    mainEntity: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/** SearchResultsPage şeması — arama sayfası için */
export function generateSearchResultsPageLd(query: string, resultCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: `"${query}" arama sonuçları - ${SITE_NAME}`,
    url: `${SITE_URL}/arama?q=${encodeURIComponent(query)}`,
    description: `${SITE_NAME} üzerinde "${query}" için ${resultCount} sonuç bulundu.`,
    mainEntity: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/arama?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  };
}

// ─── Metadata Yardımcıları ─────────────────────────────────

/** Haber sayfası için metadata */
export function articleMetadata(article: {
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  category: { name: string } | null;
  author: { name: string } | null;
  tags: { tag: { name: string } }[];
}): Metadata {
  const title = article.metaTitle || article.title;
  const description =
    article.metaDescription || article.excerpt || "";
  const pubDate = article.publishedAt || new Date();
  const image = article.featuredImage || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE_URL}/haber/${article.slug}`,
      publishedTime: pubDate.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
      section: article.category?.name,
      ...(article.tags.length > 0 && {
        tag: article.tags.map((t) => t.tag.name),
      }),
      ...(article.author && {
        authors: [article.author.name],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/haber/${article.slug}`,
    },
  };
}

/** Standart sayfa metadata'sı */
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image?: string
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${SITE_URL}${path}`,
      ...(image && { images: [{ url: image, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
    alternates: {
      canonical: `${SITE_URL}${path}`,
    },
  };
}

// ─── JSON-LD Injector (client-safe) ─────────────────────────

/** Sayfaya JSON-LD scripti olarak eklemek için yardımcı */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
