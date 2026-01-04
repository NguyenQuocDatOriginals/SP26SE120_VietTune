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
    <header
      className="shadow-sm border-b border-secondary-200 sticky top-0 z-50"
      style={{ backgroundColor: "#EFE8DB" }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src={logo}
                alt="VietTune Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold text-primary-800">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              to="/recordings"
              className="text-secondary-700 hover:text-emerald-700 transition-colors"
            >
              Recordings
            </Link>
            <Link
              to="/instruments"
              className="text-secondary-700 hover:text-emerald-700 transition-colors"
            >
              Traditional Instruments
            </Link>
            <Link
              to="/ethnicities"
              className="text-secondary-700 hover:text-emerald-700 transition-colors"
            >
              Vietnamese Ethnicities
            </Link>
            <Link
              to="/masters"
              className="text-secondary-700 hover:text-emerald-700 transition-colors"
            >
              Master Musicians
            </Link>
            <Link
              to="/about"
              className="text-secondary-700 hover:text-emerald-700 transition-colors"
            >
              About
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              to="/search"
              className="p-2 text-secondary-600 hover:text-emerald-700 transition-colors"
            >
              <Search className="h-5 w-5" />
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/upload"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100 transition-colors">
                    <User className="h-5 w-5 text-secondary-600" />
                    <span className="text-sm text-secondary-700">
                      {user?.username}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                    >
                      Profile
                    </Link>
                    {user?.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-secondary-100 flex items-center"
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
                  className="px-4 py-2 text-secondary-700 hover:text-emerald-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-secondary-600 hover:text-emerald-700"
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
          <div className="md:hidden py-4 space-y-2 border-t border-secondary-200">
            <Link
              to="/recordings"
              className="block px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded"
            >
              Recordings
            </Link>
            <Link
              to="/instruments"
              className="block px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded"
            >
              Instruments
            </Link>
            <Link
              to="/ethnicities"
              className="block px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded"
            >
              Ethnicities
            </Link>
            <Link
              to="/masters"
              className="block px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded"
            >
              Masters
            </Link>
            <Link
              to="/about"
              className="block px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded"
            >
              About
            </Link>
            <Link
              to="/search"
              className="block px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded"
            >
              Search
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/upload"
                  className="block px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded"
                >
                  Upload
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-primary-700 hover:bg-secondary-100 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-emerald-700 hover:bg-secondary-100 rounded"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
