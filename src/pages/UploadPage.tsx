import { useEffect, useRef, useState } from "react";
import { addSpotlightEffect } from "@/utils/spotlight";
import UploadMusic from "@/components/features/UploadMusic";

export default function UploadPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sloganRef = useRef<HTMLParagraphElement>(null);
  const [sloganFontSize, setSloganFontSize] = useState<number>(18);

  useEffect(() => {
    const fitSlogan = () => {
      const el = sloganRef.current;
      if (!el) return;
      let fontSize = 18;
      const minSize = 10;
      while (fontSize >= minSize) {
        el.style.fontSize = `${fontSize}px`;
        if (el.scrollWidth <= el.clientWidth) break;
        fontSize -= 1;
      }
      setSloganFontSize(fontSize);
    };
    fitSlogan();
    window.addEventListener("resize", fitSlogan);
    return () => window.removeEventListener("resize", fitSlogan);
  }, []);

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    if (containerRef.current)
      cleanupFunctions.push(addSpotlightEffect(containerRef.current));
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-0">
        <h1 className="text-3xl font-bold text-white mb-8">Tải lên bản nhạc</h1>
        <div
          ref={containerRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 flex flex-col items-center text-center"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Tải lên bản nhạc
          </h2>
          <p
            ref={sloganRef}
            className="text-white leading-relaxed mb-4 w-full whitespace-nowrap overflow-hidden tracking-tight"
            style={{ fontSize: `${sloganFontSize}px` }}
          >
            Đóng góp bản nhạc truyền thống Việt Nam của bạn cho cộng đồng. Hệ
            thống sẽ tự động phân tích và gợi ý phân loại bản nhạc.
          </p>
          <div className="w-full max-w-2xl">
            <UploadMusic />
          </div>
        </div>
      </div>
    </div>
  );
}
