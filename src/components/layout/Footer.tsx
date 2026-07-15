import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 mt-8 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">TA</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-white">
                Teknoloji<span className="text-blue-400">Akışı</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed text-gray-500">
              Teknoloji dünyasından en güncel haberler, yapay zeka rehberleri ve derinlemesine analizler.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm">Sayfalar</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Ana Sayfa</Link></li>
              <li><Link href="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
              <li><Link href="/arama" className="hover:text-white transition-colors">Haber Ara</Link></li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div>
            <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm">Kategoriler</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li><Link href="/kategori/yapay-zeka" className="hover:text-white transition-colors">Yapay Zeka</Link></li>
              <li><Link href="/kategori/mobil" className="hover:text-white transition-colors">Mobil</Link></li>
              <li><Link href="/kategori/donanim" className="hover:text-white transition-colors">Donanım</Link></li>
              <li><Link href="/kategori/yazilim" className="hover:text-white transition-colors">Yazılım</Link></li>
              <li><Link href="/kategori/guvenlik" className="hover:text-white transition-colors">Güvenlik</Link></li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm">Takip Et</h4>
            <div className="flex gap-2 sm:gap-3 mb-3">
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors" aria-label="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors" aria-label="RSS">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.18 15.64a2.18 2.18 0 010 4.36 2.18 2.18 0 010-4.36M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93v-2.83z" /></svg>
              </a>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-600">info@teknolojiakisi.com.tr</p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-gray-600">
          <p>&copy; {currentYear} TeknolojiAkışı. Tüm hakları saklıdır.</p>
          <p>Haber içerikleri yapay zeka destekli botlar tarafından oluşturulmaktadır.</p>
        </div>
      </div>
    </footer>
  );
}
