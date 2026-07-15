"use client";

import { useState } from "react";

export default function SettingsForm({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const form = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    form.forEach((value, key) => {
      if (key === "autoPublish") {
        data[key] = value === "on" ? "true" : "false";
      } else {
        data[key] = value as string;
      }
    });

    // autoPublish checkbox'tan gelmezse false
    if (!data.autoPublish) data.autoPublish = "false";

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setMessage("✅ Ayarlar kaydedildi!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Kaydetme başarısız!");
      }
    } catch {
      setMessage("❌ Bağlantı hatası!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Site Adı
        </label>
        <input
          name="siteName"
          defaultValue={settings.siteName || "TeknolojiAkışı"}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Site Açıklaması
        </label>
        <textarea
          name="siteDescription"
          defaultValue={
            settings.siteDescription ||
            "Teknoloji dünyasından en güncel haberler"
          }
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sayfa Başına Haber
        </label>
        <input
          name="postsPerPage"
          type="number"
          defaultValue={settings.postsPerPage || "12"}
          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">SEO &amp; Site</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Site URL</label>
            <input
              name="siteUrl"
              defaultValue={settings.siteUrl || "https://teknolojiakisi.com.tr"}
              placeholder="https://teknolojiakisi.com.tr"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Varsayılan OG Görsel URL</label>
            <input
              name="defaultOgImage"
              defaultValue={settings.defaultOgImage || ""}
              placeholder="https://teknolojiakisi.com.tr/og-default.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Google Analytics ID</label>
            <input
              name="googleAnalyticsId"
              defaultValue={settings.googleAnalyticsId || ""}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Google Doğrulama Kodu</label>
            <input
              name="googleVerificationCode"
              defaultValue={settings.googleVerificationCode || ""}
              placeholder="google-site-verification-code"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Sosyal Medya
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["socialTwitter", "socialFacebook", "socialInstagram", "socialYoutube"].map(
            (key) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">
                  {key.replace("social", "")} URL
                </label>
                <input
                  name={key}
                  defaultValue={settings[key] || ""}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            name="autoPublish"
            type="checkbox"
            defaultChecked={settings.autoPublish === "true"}
            className="w-4 h-4 rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm text-gray-700">
            Bot otomatik yayınlasın (kapalıysa taslak olarak kaydedilir)
          </span>
        </label>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {message && (
          <span className="text-sm font-medium text-green-700">{message}</span>
        )}
      </div>
    </form>
  );
}
