import { Link } from "react-router-dom";
import { Mail, Facebook, Youtube } from "lucide-react";
import { APP_NAME } from "@/config/constants";
import logo from "@/components/image/VietTune logo.png";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#EFE8DB" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src={logo}
                alt="VietTune Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-bold text-primary-800">
                {APP_NAME}
              </span>
            </div>
            <p className="text-secondary-700 text-sm">
              Preserving Vietnam's rich musical heritage through collaborative
              documentation and intelligent archiving.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-secondary-900">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/recordings"
                  className="text-secondary-700 hover:text-emerald-700 transition-colors"
                >
                  Recordings
                </Link>
              </li>
              <li>
                <Link
                  to="/instruments"
                  className="text-secondary-700 hover:text-emerald-700 transition-colors"
                >
                  Traditional Instruments
                </Link>
              </li>
              <li>
                <Link
                  to="/ethnicities"
                  className="text-secondary-700 hover:text-emerald-700 transition-colors"
                >
                  Vietnamese Ethnicities
                </Link>
              </li>
              <li>
                <Link
                  to="/masters"
                  className="text-secondary-700 hover:text-emerald-700 transition-colors"
                >
                  Master Musicians
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-secondary-900">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-secondary-700 hover:text-emerald-700 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/upload"
                  className="text-secondary-700 hover:text-emerald-700 transition-colors"
                >
                  Contribute
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary-700 hover:text-emerald-700 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary-700 hover:text-emerald-700 transition-colors"
                >
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-secondary-900">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <a
                href="#"
                className="text-secondary-700 hover:text-emerald-700 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-secondary-700 hover:text-emerald-700 transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@viettune.com"
                className="text-secondary-700 hover:text-emerald-700 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-secondary-700 text-sm">
              Email: contact@viettune.com
            </p>
          </div>
        </div>

        <div className="border-t border-secondary-300 mt-8 pt-8 text-center text-sm text-secondary-600">
          <p>
            Copyright © {new Date().getFullYear()} {APP_NAME}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
