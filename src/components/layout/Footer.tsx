import { Link } from "react-router-dom";
import { Mail, Facebook, Youtube } from "lucide-react";
import { APP_NAME } from "@/config/constants";
import logo from "@/components/image/VietTune logo.png";
import toast from "react-hot-toast";

export default function Footer() {
  const handleCopyEmail = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const email = "contact@viettune.com";

    navigator.clipboard.writeText(email).then(() => {
      toast.success("Đã sao chép địa chỉ email thành công!", {
        duration: 2000,
      });
    }).catch(() => {
      toast.error("Không thể copy email. Vui lòng thử lại!");
    });
  };
  return (
    <footer className="pb-4 px-4">
      <div className="bg-primary-700 rounded-2xl px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-48">
          {/* About */}
          <div className="min-w-[350px]">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={logo}
                alt="VietTune Logo"
                className="h-10 w-10 object-contain rounded-xl"
              />
              <span className="text-xl font-bold text-white">
                {APP_NAME}
              </span>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              Hệ thống lưu giữ âm nhạc truyền thống Việt Nam
              <br />
              qua nền tảng chia sẻ và lưu trữ cộng đồng
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">
              Liên kết nhanh
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/upload"
                  className="text-white/90 font-medium hover:text-secondary-300 active:text-secondary-400 transition-colors"
                >
                  Đóng góp bản thu
                </Link>
              </li>
              <li>
                <Link
                  to="/instruments"
                  className="text-white/90 font-medium hover:text-secondary-300 active:text-secondary-400 transition-colors"
                >
                  Nhạc cụ truyền thống
                </Link>
              </li>
              <li>
                <Link
                  to="/ethnicities"
                  className="text-white/90 font-medium hover:text-secondary-300 active:text-secondary-400 transition-colors"
                >
                  Dân tộc Việt Nam
                </Link>
              </li>
              <li>
                <Link
                  to="/masters"
                  className="text-white/90 font-medium hover:text-secondary-300 active:text-secondary-400 transition-colors"
                >
                  Nghệ nhân âm nhạc
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">
              Về VietTune
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-white/90 font-medium hover:text-secondary-300 active:text-secondary-400 transition-colors"
                >
                  Giới thiệu VietTune
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-white/90 font-medium hover:text-secondary-300 active:text-secondary-400 transition-colors"
                >
                  Điều khoản và Điều kiện
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">
              Kết nối
            </h3>
            <div className="flex space-x-4 mb-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white/10 text-white rounded-full hover:bg-secondary-500 hover:text-white transition-colors"
                title="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white/10 text-white rounded-full hover:bg-secondary-500 hover:text-white transition-colors"
                title="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white/10 text-white rounded-full hover:bg-secondary-500 hover:text-white transition-colors"
                title="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <div className="space-y-2">
              <p className="text-white text-sm font-medium">
                Email:
              </p>
              <a
                href="mailto:contact@viettune.com"
                onClick={handleCopyEmail}
                className="text-white/90 text-sm hover:text-secondary-300 transition-colors cursor-pointer"
                title="Click để copy email"
              >
                contact@viettune.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-8 text-center">
          <p className="text-white/90 text-sm font-medium">
            Bản quyền © {new Date().getFullYear()} {APP_NAME}. Tất cả quyền được
            bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}