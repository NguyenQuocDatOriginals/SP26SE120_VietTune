import { useEffect, useRef } from "react";
import { addSpotlightEffect } from "@/utils/spotlight";

export default function UploadPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    if (containerRef.current)
      cleanupFunctions.push(addSpotlightEffect(containerRef.current));
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Tải lên bản ghi</h1>

        <div
          ref={containerRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <p className="text-white">
            Biểu mẫu tải lên sẽ được triển khai ở đây với tính năng tải lên tệp,
            trường metadata và xác thực biểu mẫu.
          </p>
        </div>
      </div>
    </div>
  );
}
