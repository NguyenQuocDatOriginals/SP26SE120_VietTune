import { Link, useNavigate } from "react-router-dom";
import { Search, Upload, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { APP_NAME } from "@/config/constants";
import logo from "@/components/image/VietTune logo.png";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 pt-4 px-4">
      <nav className="bg-white rounded-full shadow-lg border border-gray-100">
        <div className="px-6 py-2.5">
          <div className="grid grid-cols-3 items-center">
            {/* Logo */}
            <div className="flex items-center justify-start">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  src={logo}
                  alt="VietTune Logo"
                  className="h-9 w-9 object-contain rounded-lg"
                />
                <span className="text-xl font-bold text-primary-600">
                  {APP_NAME}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:flex-nowrap lg:items-center lg:justify-center lg:space-x-4">
              <Link
                to="/upload"
                className="text-secondary-700 text-sm font-medium hover:text-primary-600 active:text-primary-700 transition-colors whitespace-nowrap"
              >
                Đóng góp bản thu
              </Link>
              <Link
                to="/instruments"
                className="text-secondary-700 text-sm font-medium hover:text-primary-600 active:text-primary-700 transition-colors whitespace-nowrap"
              >
                Nhạc cụ truyền thống
              </Link>
              <Link
                to="/ethnicities"
                className="text-secondary-700 text-sm font-medium hover:text-primary-600 active:text-primary-700 transition-colors whitespace-nowrap"
              >
                Dân tộc Việt Nam
              </Link>
              <Link
                to="/masters"
                className="text-secondary-700 text-sm font-medium hover:text-primary-600 active:text-primary-700 transition-colors whitespace-nowrap"
              >
                Nghệ nhân âm nhạc
              </Link>
              <Link
                to="/about"
                className="text-secondary-700 text-sm font-medium hover:text-primary-600 active:text-primary-700 transition-colors whitespace-nowrap"
              >
                Giới thiệu VietTune
              </Link>
            </div>

            {/* Right side buttons */}
            <div className="hidden lg:flex lg:items-center lg:justify-end lg:space-x-3">
              <Link
                to="/search"
                className="p-2 text-secondary-600 hover:text-primary-600 active:text-primary-700 transition-colors"
              >
                <Search className="h-5 w-5" />
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/upload"
                    className="btn-liquid-glass-primary inline-flex items-center gap-1.5 text-sm px-4 py-2"
                  >
                    <Upload className="h-4 w-4" />
                    Tải lên
                  </Link>
                  <div className="relative group">
                    <button className="btn-liquid-glass-secondary flex items-center gap-1.5 text-sm px-4 py-2">
                      <User className="h-4 w-4 text-secondary-600" />
                      <span className="text-xs font-medium text-secondary-700">
                        {user?.username}
                      </span>
                    </button>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 hidden group-hover:block">
                      <Link
                        to="/profile"
                        className="block px-4 py-3 text-sm font-medium text-secondary-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        Hồ sơ
                      </Link>
                      {user?.role === "ADMIN" && (
                        <Link
                          to="/admin"
                          className="block px-4 py-3 text-sm font-medium text-secondary-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                          Quản trị hệ thống
                        </Link>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm text-secondary-700 font-semibold hover:text-primary-600 active:text-primary-700 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="btn-liquid-glass-primary text-sm px-4 py-2"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center justify-end">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 text-secondary-600 hover:text-primary-600 active:text-primary-700 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden pt-4 mt-4 space-y-2 border-t border-gray-100">
              <Link
                to="/upload"
                className="block px-4 py-3 text-secondary-700 font-medium hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Đóng góp
              </Link>
              <Link
                to="/instruments"
                className="block px-4 py-3 text-secondary-700 font-medium hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Nhạc cụ truyền thống
              </Link>
              <Link
                to="/ethnicities"
                className="block px-4 py-3 text-secondary-700 font-medium hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dân tộc Việt Nam
              </Link>
              <Link
                to="/masters"
                className="block px-4 py-3 text-secondary-700 font-medium hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Nghệ nhân âm nhạc
              </Link>
              <Link
                to="/about"
                className="block px-4 py-3 text-secondary-700 font-medium hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Về VietTune
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/upload"
                    className="block px-4 py-3 text-secondary-700 font-medium hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tải lên
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-secondary-700 font-medium hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Hồ sơ
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Link
                      to="/admin"
                      className="block px-4 py-3 text-secondary-700 font-medium hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Quản trị hệ thống
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-secondary-700 font-medium hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
