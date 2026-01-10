import { Link } from "react-router-dom";
import { Mail, Facebook, Youtube } from "lucide-react";
import { APP_NAME } from "@/config/constants";
import logo from "@/components/image/VietTune logo.png";
import { useEffect, useRef } from "react";
import { addSpotlightEffect } from "@/utils/spotlight";

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    if (footerRef.current)
      cleanupFunctions.push(addSpotlightEffect(footerRef.current));
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }, []);

  return (
    <footer className="pb-4 px-4">
      <div
        ref={footerRef}
        className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 px-8 py-12"
        style={{
          boxShadow:
            "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-48">
          {/* About */}
          <div className="min-w-[350px]">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={logo}
                alt="VietTune Logo"
                className="h-10 w-10 object-contain rounded-xl"
              />
              <span className="text-xl font-bold text-white drop-shadow-lg">
                {APP_NAME}
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed drop-shadow">
              Hệ thống lưu giữ âm nhạc truyền thống Việt Nam
              <br />
              qua nền tảng chia sẻ và lưu trữ cộng đồng
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white drop-shadow-lg">
              Liên kết nhanh
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/upload"
                  className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                >
                  Đóng góp
                </Link>
              </li>
              <li>
                <Link
                  to="/instruments"
                  className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                >
                  Nhạc cụ truyền thống
                </Link>
              </li>
              <li>
                <Link
                  to="/ethnicities"
                  className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                >
                  Dân tộc Việt Nam
                </Link>
              </li>
              <li>
                <Link
                  to="/masters"
                  className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                >
                  Nghệ nhân âm nhạc
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white drop-shadow-lg">
              Tài nguyên
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                >
                  Về VietTune
                </Link>
              </li>
              <li>
                <Link
                  to="/upload"
                  className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                >
                  Đóng góp
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                >
                  Tài liệu
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                >
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white drop-shadow-lg">
              Kết nối
            </h3>
            <div className="flex space-x-4 mb-6">
              <a
                href="#"
                className="btn-liquid-glass-secondary p-2.5 hover:text-emerald-300"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="btn-liquid-glass-secondary p-2.5 hover:text-emerald-300"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@viettune.com"
                className="btn-liquid-glass-secondary p-2.5 hover:text-emerald-300"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <div className="space-y-2">
              <p className="text-white text-sm font-medium drop-shadow">
                Email:
              </p>
              <a
                href="mailto:contact@viettune.com"
                className="text-white text-sm hover:text-emerald-300 transition-colors drop-shadow"
              >
                contact@viettune.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/30 mt-10 pt-8 text-center">
          <p className="text-white text-sm font-medium drop-shadow">
            Bản quyền © {new Date().getFullYear()} {APP_NAME}. Tất cả quyền được
            bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
