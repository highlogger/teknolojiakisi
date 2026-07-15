import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BreakingTicker from "@/components/news/BreakingTicker";
import AdBanner from "@/components/news/AdBanner";
import prisma from "@/lib/db";

async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true, color: true },
    });
  } catch {
    return [];
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <BreakingTicker />
      <Header categories={categories} />
      <div className="container-custom py-3 hidden sm:block">
        <AdBanner position="top" />
      </div>
      <main className="flex-1">{children}</main>
      <div className="container-custom py-4 hidden sm:block">
        <AdBanner position="bottom" />
      </div>
      <Footer />
    </div>
  );
}
