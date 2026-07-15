interface AdBannerProps {
  position: "top" | "sidebar" | "in-content" | "bottom";
  className?: string;
}

export default function AdBanner({ position, className = "" }: AdBannerProps) {
  const sizeMap = {
    top: "h-[90px] max-w-[970px]",
    sidebar: "h-[250px] max-w-[300px]",
    "in-content": "h-[90px] max-w-[728px]",
    bottom: "h-[90px] max-w-[970px]",
  };

  const labelMap = {
    top: "Yatay Reklam (970x90)",
    sidebar: "Kare Reklam (300x250)",
    "in-content": "İçerik Reklam (728x90)",
    bottom: "Alt Reklam (970x90)",
  };

  return (
    <div
      className={`mx-auto ${sizeMap[position]} ${className} bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center`}
    >
      <div className="text-center">
        <svg
          className="w-8 h-8 text-gray-300 mx-auto mb-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
          />
        </svg>
        <p className="text-xs text-gray-400">{labelMap[position]}</p>
      </div>
    </div>
  );
}
