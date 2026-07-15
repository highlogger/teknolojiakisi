import Link from "next/link";
import type { Metadata } from "next";
import {
  generateContactPageLd,
  generateBreadcrumbLd,
  pageMetadata,
  JsonLd,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import ContactForm from "./ContactForm";

export const metadata: Metadata = pageMetadata(
  "İletişim",
  "TeknolojiAkışı ile iletişime geçin. Soru, görüş ve önerileriniz için bize ulaşın.",
  "/iletisim"
);

export default function ContactPage() {
  return (
    <div className="container-custom py-8">
      {/* JSON-LD Structured Data */}
      <JsonLd data={generateContactPageLd() as unknown as Record<string, unknown>} />
      <JsonLd data={generateBreadcrumbLd([
        { name: "İletişim", url: `${SITE_URL}/iletisim` },
      ]) as unknown as Record<string, unknown>} />

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Ana Sayfa
        </Link>
        <span>/</span>
        <span className="text-gray-400">İletişim</span>
      </nav>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            İletişim
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Soru, görüş ve önerileriniz için bizimle iletişime geçebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-1">E-posta</h3>
              <p className="text-sm text-gray-500">info@teknolojiakisi.com.tr</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-1">Adres</h3>
              <p className="text-sm text-gray-500">İstanbul, Türkiye</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
