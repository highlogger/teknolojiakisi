import Link from "next/link";
import type { Metadata } from "next";
import {
  generateAboutPageLd,
  generateBreadcrumbLd,
  pageMetadata,
  JsonLd,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata(
  "Hakkımızda",
  "TeknolojiAkışı, yapay zeka destekli editörler tarafından hazırlanan, teknoloji dünyasından en güncel haberleri sunan bir haber platformudur.",
  "/hakkimizda"
);

export default function AboutPage() {
  return (
    <div className="container-custom py-8">
      {/* JSON-LD Structured Data */}
      <JsonLd data={generateAboutPageLd() as unknown as Record<string, unknown>} />
      <JsonLd data={generateBreadcrumbLd([
        { name: "Hakkımızda", url: `${SITE_URL}/hakkimizda` },
      ]) as unknown as Record<string, unknown>} />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Ana Sayfa
        </Link>
        <span>/</span>
        <span className="text-gray-400">Hakkımızda</span>
      </nav>

      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">TA</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            TeknolojiAkışı Hakkında
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Teknoloji dünyasındaki en son gelişmeleri, yapay zeka destekli
            editörlerimizle anlık olarak sizlere ulaştırıyoruz.
          </p>
        </div>

        <div className="space-y-10">
          {/* Vizyonumuz */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full" />
              Vizyonumuz
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Teknoloji dünyası her geçen gün daha hızlı değişiyor ve gelişiyor.
              Biz, TeknolojiAkışı olarak, bu değişimi yakından takip ediyor ve
              okuyucularımıza en güncel, doğru ve kaliteli teknoloji haberlerini
              sunmayı hedefliyoruz. Yapay zeka teknolojilerini kullanarak haber
              üretim sürecini hızlandırıyor, böylece hiçbir önemli gelişmeyi
              kaçırmamanızı sağlıyoruz.
            </p>
          </section>

          {/* Nasıl Çalışıyor */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-purple-600 rounded-full" />
              Nasıl Çalışıyoruz?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Toplama</h3>
                <p className="text-sm text-gray-500">
                  Dünyanın önde gelen teknoloji haber kaynaklarından RSS
                  beslemeleri aracılığıyla anlık haber akışı sağlıyoruz.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">2. İşleme</h3>
                <p className="text-sm text-gray-500">
                  Toplanan haberler, yapay zeka modellerimiz tarafından analiz
                  edilir, özetlenir ve Türkçe olarak yeniden yazılır.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Yayınlama</h3>
                <p className="text-sm text-gray-500">
                  Hazırlanan haberler kategorilerine göre düzenlenir ve
                  okuyucularımıza sunulmak üzere otomatik olarak yayınlanır.
                </p>
              </div>
            </div>
          </section>

          {/* Neden TeknolojiAkışı */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-600 rounded-full" />
              Neden TeknolojiAkışı?
            </h2>
            <ul className="space-y-4">
              {[
                {
                  title: "Güncel Haberler",
                  desc: "Yüzlerce kaynaktan 7/24 beslenen haber akışımız sayesinde teknoloji dünyasındaki gelişmeleri anında öğrenin.",
                },
                {
                  title: "Yapay Zeka Destekli İçerik",
                  desc: "Yapay zeka teknolojileriyle desteklenen editörlerimiz, haberleri hızlı ve doğru bir şekilde Türkçe olarak hazırlar.",
                },
                {
                  title: "Kapsamlı Kategoriler",
                  desc: "Yapay zekadan mobil teknolojilere, oyun dünyasından bilime kadar geniş bir yelpazede haber içeriği.",
                },
                {
                  title: "Ücretsiz ve Hızlı",
                  desc: "TeknolojiAkışı tamamen ücretsizdir. Herhangi bir üyelik gerektirmeden tüm haberlere anında erişebilirsiniz.",
                },
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Kategoriler */}
          <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Kategoriler
            </h2>
            <p className="text-gray-600 mb-4">
              Teknoloji dünyasının her alanını kapsayan geniş kategori
              yelpazemizle ilginizi çeken konuları kolayca takip edebilirsiniz.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Yapay Zeka", color: "#8B5CF6" },
                { name: "Mobil", color: "#3B82F6" },
                { name: "Web", color: "#10B981" },
                { name: "Donanım", color: "#F59E0B" },
                { name: "Yazılım", color: "#EC4899" },
                { name: "Oyun", color: "#EF4444" },
                { name: "Bilim", color: "#06B6D4" },
                { name: "Güvenlik", color: "#F97316" },
                { name: "Sosyal Medya", color: "#6366F1" },
                { name: "Otomotiv", color: "#84CC16" },
              ].map((cat) => (
                <Link
                  key={cat.name}
                  href={`/kategori/${cat.name
                    .toLowerCase()
                    .replace(/ /g, "-")
                    .replace(/ı/g, "i")
                    .replace(/ü/g, "u")
                    .replace(/ö/g, "o")
                    .replace(/ç/g, "c")
                    .replace(/ğ/g, "g")
                    .replace(/ş/g, "s")}`}
                  className="px-3 py-1.5 text-xs font-medium rounded-full text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>

          {/* İletişim */}
          <section className="text-center py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bize Ulaşın
            </h2>
            <p className="text-gray-600 mb-4">
              Soru, görüş ve önerileriniz için bizimle iletişime geçebilirsiniz.
            </p>
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              İletişim Formu
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
