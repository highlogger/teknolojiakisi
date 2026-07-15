"use client";

import { useState } from "react";

export default function BotTriggerButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleTrigger() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/bot/trigger", { method: "POST" });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        if (res.status === 401 || res.redirected) {
          setResult("Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.");
        } else {
          setResult("Sunucu hatası: Bot yanıtı alınamadı (HTTP " + res.status + "). Lütfen tekrar deneyin.");
        }
        return;
      }
      const data = await res.json();
      if (data.success) {
        setResult("✅ " + data.message);
      } else {
        setResult("Hata: " + (data.error || "Bilinmeyen hata"));
      }
    } catch (err) {
      setResult("Bağlantı hatası: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleTrigger}
        disabled={loading}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Çalışıyor...
          </>
        ) : (
          "🔍 Scout Çalıştır"
        )}
      </button>
      {result && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          {result}
        </div>
      )}
    </div>
  );
}
