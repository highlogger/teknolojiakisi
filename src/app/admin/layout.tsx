import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar
        user={{
          name: user?.name ?? null,
          email: user?.email ?? null,
          role: user?.role ?? null,
        }}
      />
      <main className="flex-1 p-3 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
