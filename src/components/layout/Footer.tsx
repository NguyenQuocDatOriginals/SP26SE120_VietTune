import { Link } from "react-router-dom";
import { Mail, Facebook, Youtube } from "lucide-react";
import { APP_NAME } from "@/config/constants";
import logo from "@/components/image/VietTune logo.png";
import { useState } from "react";
import TermsAndConditions from "@/components/features/TermsAndConditions";

export default function Footer() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <>
      <footer className="pb-4 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-48">
            {/* About */}
            <div className="min-w-[350px]">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={logo}
                  alt="VietTune Logo"
                  className="h-10 w-10 object-contain rounded-xl"
                />
                <span className="text-xl font-bold text-primary-600">
                  {APP_NAME}
                </span>
              </div>
              <p className="text-secondary-600 text-sm leading-relaxed">
                Hệ thống lưu giữ âm nhạc truyền thống Việt Nam
                <br />
                qua nền tảng chia sẻ và lưu trữ cộng đồng
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-secondary-800">
                Liên kết nhanh
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/upload"
                    className="text-secondary-600 font-medium hover:text-primary-600 active:text-primary-700 transition-colors"
                  >
                    Đóng góp bản thu
                  </Link>
                </li>
                <li>
                  <Link
                    to="/instruments"
                    className="text-secondary-600 font-medium hover:text-primary-600 active:text-primary-700 transition-colors"
                  >
                    Nhạc cụ truyền thống
                  </Link>
                </li>
                <li>
                  <Link
                    to="/ethnicities"
                    className="text-secondary-600 font-medium hover:text-primary-600 active:text-primary-700 transition-colors"
                  >
                    Dân tộc Việt Nam
                  </Link>
                </li>
                <li>
                  <Link
                    to="/masters"
                    className="text-secondary-600 font-medium hover:text-primary-600 active:text-primary-700 transition-colors"
                  >
                    Nghệ nhân âm nhạc
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-secondary-800">
                Về VietTune
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/about"
                    className="text-secondary-600 font-medium hover:text-primary-600 active:text-primary-700 transition-colors"
                  >
                    Giới thiệu VietTune
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setIsTermsOpen(true)}
                    className="text-secondary-600 font-medium hover:text-primary-600 active:text-primary-700 transition-colors text-left"
                  >
                    Điều khoản và Điều kiện
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-secondary-800">
                Kết nối
              </h3>
              <div className="flex space-x-4 mb-6">
                <a
                  href="#"
                  className="p-2.5 bg-gray-100 rounded-full text-secondary-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="p-2.5 bg-gray-100 rounded-full text-secondary-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a
                  href="mailto:contact@viettune.com"
                  className="p-2.5 bg-gray-100 rounded-full text-secondary-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
              <div className="space-y-2">
                <p className="text-secondary-700 text-sm font-medium">
                  Email:
                </p>
                <a
                  href="mailto:contact@viettune.com"
                  className="text-secondary-600 text-sm hover:text-primary-600 transition-colors"
                >
                  contact@viettune.com
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-10 pt-8 text-center">
            <p className="text-secondary-600 text-sm font-medium">
              Bản quyền © {new Date().getFullYear()} {APP_NAME}. Tất cả quyền được
              bảo lưu.
            </p>
          </div>
        </div>
      </footer>

      {/* Terms and Conditions Modal */}
      <TermsAndConditions 
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)} 
      />
    </>
  );
}
