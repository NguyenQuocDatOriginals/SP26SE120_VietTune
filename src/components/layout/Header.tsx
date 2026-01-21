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
      <nav className="bg-primary-700 rounded-full">
        <div className="px-6 py-2.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  src={logo}
                  alt="VietTune Logo"
                  className="h-9 w-9 object-contain rounded-lg"
                />
                <span className="text-xl font-bold text-white">
                  {APP_NAME}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:justify-center lg:gap-3 xl:gap-4 flex-1 mx-4">
              <Link
                to="/upload"
                className="text-white text-sm font-medium hover:text-secondary-300 active:text-secondary-400 transition-colors whitespace-nowrap px-2 py-1"
              >
                Đóng góp bản thu
              </Link>
              <Link
                to="/instruments"
                className="text-white text-sm font-medium hover:text-secondary-300 active:text-secondary-400 transition-colors whitespace-nowrap px-2 py-1"
              >
                Nhạc cụ truyền thống
              </Link>
              <Link
                to="/ethnicities"
                className="text-white text-sm font-medium hover:text-secondary-300 active:text-secondary-400 transition-colors whitespace-nowrap px-2 py-1"
              >
                Dân tộc Việt Nam
              </Link>
              <Link
                to="/masters"
                className="text-white text-sm font-medium hover:text-secondary-300 active:text-secondary-400 transition-colors whitespace-nowrap px-2 py-1"
              >
                Nghệ nhân âm nhạc
              </Link>
              <Link
                to="/about"
                className="text-white text-sm font-medium hover:text-secondary-300 active:text-secondary-400 transition-colors whitespace-nowrap px-2 py-1"
              >
                Giới thiệu VietTune
              </Link>
            </div>

            {/* Right side buttons */}
            <div className="hidden lg:flex lg:items-center lg:space-x-3 flex-shrink-0">
              <Link
                to="/search"
                className="p-2 text-white hover:text-secondary-300 active:text-secondary-400 transition-colors"
              >
                <Search className="h-5 w-5" />
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-1.5 text-sm px-4 py-2 bg-secondary-500 text-white font-semibold rounded-full hover:bg-secondary-600 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Tải lên
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center gap-1.5 text-sm px-4 py-2 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-colors shadow-md hover:shadow-lg">
                      <User className="h-4 w-4" />
                      <span className="text-xs font-medium">
                        {user?.username}
                      </span>
                    </button>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 hidden group-hover:block">
                      <Link
                        to="/profile"
                        className="block px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                      >
                        Hồ sơ
                      </Link>
                      {user?.role === "ADMIN" && (
                        <Link
                          to="/admin"
                          className="block px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        >
                          Quản trị hệ thống
                        </Link>
                      )}
                      <div className="border-t border-neutral-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-primary-600 hover:bg-primary-50 hover:text-primary-700 flex items-center transition-colors shadow-sm hover:shadow-md"
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
                    className="px-4 py-2 text-sm text-white font-semibold hover:text-secondary-300 active:text-secondary-400 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm px-4 py-2 bg-secondary-500 text-white font-semibold rounded-full hover:bg-secondary-600 transition-colors"
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
                className="p-1.5 text-white hover:text-secondary-300 active:text-secondary-400 transition-colors"
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
            <div className="lg:hidden pt-4 mt-4 space-y-2 border-t border-white/20">
              <Link
                to="/upload"
                className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Đóng góp
              </Link>
              <Link
                to="/instruments"
                className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Nhạc cụ truyền thống
              </Link>
              <Link
                to="/ethnicities"
                className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dân tộc Việt Nam
              </Link>
              <Link
                to="/masters"
                className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Nghệ nhân âm nhạc
              </Link>
              <Link
                to="/about"
                className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Về VietTune
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/upload"
                    className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tải lên
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Hồ sơ
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Link
                      to="/admin"
                      className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
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
                    className="w-full text-left px-4 py-3 text-secondary-300 font-medium hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 text-secondary-300 font-medium hover:bg-white/10 rounded-lg transition-colors"
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