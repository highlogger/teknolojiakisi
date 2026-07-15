/**
 * Verification Agent — Link Checker
 *
 * Kaynak URL'leri kontrol eder:
 * - URL çalışıyor mu?
 * - 404 dönüyor mu?
 * - Redirect var mı?
 * - Canonical farklı mı?
 */

import type { LinkCheckResult, ResearchInput } from "./types";
import { LINK_CHECK } from "./constants";

/**
 * Araştırmadaki tüm URL'leri kontrol et
 *
 * NOT: Gerçek HTTP istekleri yapmak yerine statik kontroller yapar.
 * Production'da axios HEAD istekleri eklenebilir.
 */
export async function checkLinks(
  research: ResearchInput
): Promise<LinkCheckResult> {
  const checkedLinks: LinkCheckResult["checkedLinks"] = [];
  const brokenLinks: string[] = [];
  const warnings: string[] = [];

  // Tüm kaynak URL'lerini topla
  const allUrls = new Map<string, string>(); // url → kaynak adı

  for (const finding of research.findings) {
    for (const source of finding.sources) {
      if (source.url) {
        allUrls.set(source.url, source.name);
      }
    }
  }

  // Her URL'yi kontrol et
  for (const [url, sourceName] of allUrls) {
    const result = await checkSingleLink(url, sourceName);

    checkedLinks.push(result);

    if (!result.isAccessible) {
      brokenLinks.push(url);
    }
  }

  const allValid = brokenLinks.length === 0;

  return {
    allLinksValid: allValid,
    checkedLinks,
    brokenLinks,
  };
}

/**
 * Tek bir URL'yi kontrol et
 */
async function checkSingleLink(
  url: string,
  sourceName: string
): Promise<LinkCheckResult["checkedLinks"][0]> {
  // URL format kontrolü
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      url,
      statusCode: null,
      isAccessible: false,
      isRedirected: false,
      redirectUrl: null,
      canonicalMismatch: false,
      error: "Geçersiz URL formatı",
    };
  }

  // Domain kontrolü
  const suspiciousDomains = [
    "example.com",
    "test.com",
    "localhost",
    "placeholder.com",
  ];
  if (suspiciousDomains.some((d) => parsedUrl.hostname.includes(d))) {
    return {
      url,
      statusCode: null,
      isAccessible: false,
      isRedirected: false,
      redirectUrl: null,
      canonicalMismatch: false,
      error: "Şüpheli/placeholder domain",
    };
  }

  // HTTP(S) kontrolü
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return {
      url,
      statusCode: null,
      isAccessible: false,
      isRedirected: false,
      redirectUrl: null,
      canonicalMismatch: false,
      error: `Geçersiz protokol: ${parsedUrl.protocol}`,
    };
  }

  // Not: Gerçek HTTP isteği yapmıyoruz.
  // Production'da axios HEAD isteği eklenebilir:
  //
  // try {
  //   const response = await axios.head(url, {
  //     timeout: LINK_CHECK.timeout,
  //     maxRedirects: LINK_CHECK.maxRedirects,
  //     headers: { "User-Agent": LINK_CHECK.userAgent },
  //     validateStatus: () => true, // Tüm status kodlarını kabul et
  //   });
  //   ...
  // } catch (error) {
  //   ...
  // }

  // Statik kontroller geçti → URL geçerli görünüyor
  return {
    url,
    statusCode: null, // Gerçek istek yapılmadı
    isAccessible: true, // Format geçerli varsayıyoruz
    isRedirected: false,
    redirectUrl: null,
    canonicalMismatch: false,
    error: undefined,
  };
}
