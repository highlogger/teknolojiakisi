import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  DEFAULT_OG_IMAGE,
  SITE_LOCALE,
  SITE_GEO_PLACENAME,
  SITE_GEO_POSITION,
  SITE_GEO_REGION,
  SITE_TWITTER_HANDLE,
  generateOrganizationLd,
  generateWebSiteLd,
} from "@/lib/seo";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import { JsonLd } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SEO_KEYWORDS = [
  "teknoloji haberleri",
  "teknoloji akışı",
  "yapay zeka",
  "internetten para kazanma",
  "yapay zeka ile para kazanma",
  "teknoloji hisseleri",
  "kripto para",
  "ai araçları",
  "ücretsiz yapay zeka",
  "en ucuz ai api",
  "token fiyatları",
  "deepseek vs openai",
  "chatgpt ücretsiz",
  "meta güncellemeleri",
  "instagram yeni özellik",
  "teknoloji yatırım",
  "pasif gelir",
  "online iş fikirleri",
  "mobil haber",
  "bilgisayar donanım",
  "oyun haberleri",
  "uzay teknolojisi",
  "siber güvenlik",
  "sosyal medya güncelleme",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "TeknolojiAkışı - Teknoloji Haberleri | Yapay Zeka, İnternetten Para Kazanma",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SEO_KEYWORDS.join(", "),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Teknoloji Haberleri | Yapay Zeka`,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Teknoloji Haberleri`,
    description: SITE_DESCRIPTION,
    site: SITE_TWITTER_HANDLE,
    creator: SITE_TWITTER_HANDLE,
    images: [DEFAULT_OG_IMAGE],
  },
  verification: {
    google: "google-site-verification-code",
  },
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/sitemap.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <meta name="keywords" content={SEO_KEYWORDS.join(", ")} />
        <meta name="author" content={SITE_NAME} />
        <meta name="theme-color" content="#3B82F6" />
        {/* Geo meta tags */}
        <meta name="geo.region" content={SITE_GEO_REGION} />
        <meta name="geo.placename" content={SITE_GEO_PLACENAME} />
        <meta name="geo.position" content={SITE_GEO_POSITION} />
        <meta name="ICBM" content="39.0, 35.0" />
        <meta name="DC.coverage.spatial" content={SITE_GEO_PLACENAME} />
        <meta name="DC.language" content="tr" />
        <meta name="DC.publisher" content={SITE_NAME} />
        {/* Canonical — sayfa bazında override edilebilir */}
        <link rel="canonical" href={SITE_URL} />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8443346744705985"
          crossOrigin="anonymous"
        />
        {/* JSON-LD: Organization + WebSite */}
        <JsonLd data={generateOrganizationLd() as unknown as Record<string, unknown>} />
        <JsonLd data={generateWebSiteLd() as unknown as Record<string, unknown>} />
      </head>
      <body
        className={`${inter.variable} font-sans bg-white text-gray-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
