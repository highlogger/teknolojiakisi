export function StatsCard({ label, value, icon, trend, color = "blue" }: {
  label: string; value: string | number; icon: string; trend?: string; color?: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700", green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700", orange: "bg-orange-50 text-orange-700",
    red: "bg-red-50 text-red-700", teal: "bg-teal-50 text-teal-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{label}</span>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${colors[color] || colors.blue}`}>{icon}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{typeof value === "number" ? value.toLocaleString() : value}</div>
      {trend && <div className="text-xs text-gray-400 mt-1">{trend}</div>}
    </div>
  );
}
