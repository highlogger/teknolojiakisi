import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_CATEGORIES, BOT_AUTHORS, DEFAULT_SOURCES } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Veritabanı seed işlemi başlıyor...\n");

  // 1. Admin kullanıcısı oluştur
  const passwordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@teknolojiakisi.com" },
    update: {},
    create: {
      email: "admin@teknolojiakisi.com",
      name: "Site Yöneticisi",
      passwordHash,
      role: "admin",
    },
  });
  console.log(`✅ Admin kullanıcısı: ${admin.email} / admin123`);

  // 2. Kategoriler
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { color: cat.color, sortOrder: cat.sortOrder },
      create: {
        name: cat.name,
        slug: cat.slug,
        color: cat.color,
        sortOrder: cat.sortOrder,
      },
    });
  }
  console.log(`✅ ${DEFAULT_CATEGORIES.length} kategori oluşturuldu`);

  // 3. Bot yazarları
  for (const author of BOT_AUTHORS) {
    await prisma.author.upsert({
      where: { slug: author.slug },
      update: {},
      create: {
        name: author.name,
        slug: author.slug,
        bio: author.bio,
        specialty: author.specialty,
        isBot: true,
      },
    });
  }
  console.log(`✅ ${BOT_AUTHORS.length} bot yazar oluşturuldu`);

  // 4. Haber kaynakları
  for (const source of DEFAULT_SOURCES) {
    const category = await prisma.category.findUnique({
      where: { slug: source.categoryName },
    });

    await prisma.source.upsert({
      where: { id: source.name.toLowerCase().replace(/\s+/g, "-") },
      update: { feedUrl: source.feedUrl, priority: source.priority },
      create: {
        id: source.name.toLowerCase().replace(/\s+/g, "-"),
        name: source.name,
        url: source.url,
        feedUrl: source.feedUrl,
        type: source.type,
        language: source.language,
        categoryId: category?.id,
        isActive: true,
        priority: source.priority,
      },
    });
  }
  console.log(`✅ ${DEFAULT_SOURCES.length} haber kaynağı oluşturuldu`);

  // 5. Varsayılan site ayarları
  const defaultSettings: Record<string, string> = {
    siteName: "TeknolojiAkışı",
    siteDescription:
      "Teknoloji dünyasından en güncel haberler, incelemeler ve analizler",
    autoPublish: "false",
    postsPerPage: "12",
    siteUrl: "https://teknolojiakisi.com.tr",
    defaultOgImage: "",
    googleAnalyticsId: "",
    googleVerificationCode: "",
    socialTwitter: "",
    socialFacebook: "",
    socialInstagram: "",
    socialYoutube: "",
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log(`✅ ${Object.keys(defaultSettings).length} site ayarı oluşturuldu`);

  console.log("\n🎉 Seed işlemi tamamlandı!");
  console.log("📧 Admin: admin@teknolojiakisi.com / admin123");
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
