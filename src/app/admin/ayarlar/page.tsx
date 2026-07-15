import prisma from "@/lib/db";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settingsData = await prisma.siteSetting.findMany();
  const settings: Record<string, string> = {};
  for (const s of settingsData) {
    settings[s.key] = s.value;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Site Ayarları</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
