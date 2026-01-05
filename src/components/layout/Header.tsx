import { Link, useNavigate } from "react-router-dom";
import { Search, Upload, User, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { APP_NAME } from "@/config/constants";
import logo from "@/components/image/VietTune logo.png";
import { addSpotlightEffect } from "@/utils/spotlight";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    if (headerRef.current)
      cleanupFunctions.push(addSpotlightEffect(headerRef.current));
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 pt-4 px-4">
      <nav
        ref={headerRef}
        className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40"
        style={{
          boxShadow:
            "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
        }}
      >
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <img
                  src={logo}
                  alt="VietTune Logo"
                  className="h-12 w-12 object-contain rounded-xl"
                />
                <span className="text-2xl font-bold text-white drop-shadow-lg">
                  {APP_NAME}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              <Link
                to="/recordings"
                className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
              >
                Recordings
              </Link>
              <Link
                to="/instruments"
                className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
              >
                Traditional instruments
              </Link>
              <Link
                to="/ethnicities"
                className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
              >
                Vietnamese ethnicities
              </Link>
              <Link
                to="/masters"
                className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
              >
                Master musicians
              </Link>
              <Link
                to="/about"
                className="text-white font-medium hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
              >
                About VietTune
              </Link>
            </div>

            {/* Right side buttons */}
            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              <Link
                to="/search"
                className="p-2 text-white hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
              >
                <Search className="h-6 w-6" />
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/upload"
                    className="btn-liquid-glass-primary inline-flex items-center gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    Upload
                  </Link>
                  <div className="relative group">
                    <button className="btn-liquid-glass-secondary flex items-center gap-2">
                      <User className="h-5 w-5 text-white" />
                      <span className="text-sm font-medium text-white">
                        {user?.username}
                      </span>
                    </button>
                    <div
                      className="absolute right-0 mt-2 w-56 backdrop-blur-xl bg-white/90 rounded-xl shadow-2xl border border-white/40 py-2 hidden group-hover:block"
                      style={{
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.3)",
                      }}
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-3 text-sm font-medium text-secondary-700 hover:bg-emerald-100 hover:text-emerald-900 transition-colors"
                      >
                        Profile
                      </Link>
                      {user?.role === "ADMIN" && (
                        <Link
                          to="/admin"
                          className="block px-4 py-3 text-sm font-medium text-secondary-700 hover:bg-emerald-100 hover:text-emerald-900 transition-colors"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <div className="border-t border-secondary-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-white font-semibold hover:text-emerald-300 active:text-emerald-400 transition-colors drop-shadow"
                  >
                    Login
                  </Link>
                  <Link to="/register" className="btn-liquid-glass-primary">
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white hover:text-emerald-300 active:text-emerald-400 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-7 w-7" />
                ) : (
                  <Menu className="h-7 w-7" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden pt-4 mt-4 space-y-2 border-t border-white/30">
              <Link
                to="/recordings"
                className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Recordings
              </Link>
              <Link
                to="/instruments"
                className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Traditional instruments
              </Link>
              <Link
                to="/ethnicities"
                className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Vietnamese ethnicities
              </Link>
              <Link
                to="/masters"
                className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Master musicians
              </Link>
              <Link
                to="/about"
                className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About VietTune
              </Link>
              <Link
                to="/search"
                className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Search
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/upload"
                    className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Upload
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Link
                      to="/admin"
                      className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-red-300 font-medium hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-white font-medium hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 text-emerald-300 font-medium hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
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
