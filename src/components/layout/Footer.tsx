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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div>
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
              Preserving Vietnam's rich musical heritage through collaborative
              documentation and intelligent archiving.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white drop-shadow-lg">
              Quick links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/recordings"
                  className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                >
                  Recordings
                </Link>
              </li>
              <li>
                <Link
                  to="/instruments"
                  className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                >
                  Traditional instruments
                </Link>
              </li>
              <li>
                <Link
                  to="/ethnicities"
                  className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                >
                  Vietnamese ethnicities
                </Link>
              </li>
              <li>
                <Link
                  to="/masters"
                  className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                >
                  Master musicians
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white drop-shadow-lg">
              Resources
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                >
                  About VietTune
                </Link>
              </li>
              <li>
                <Link
                  to="/upload"
                  className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                >
                  Contribute
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                >
                  Documentation
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
              Connect
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
            Copyright © {new Date().getFullYear()} {APP_NAME}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
