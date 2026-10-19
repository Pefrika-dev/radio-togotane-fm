import { Outlet, Link, useLocation } from "react-router-dom";
import { Radio, Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/listen", label: "Listen Live" },
    { to: "/programs", label: "Programs" },
    { to: "/presenters", label: "Presenters" },
    { to: "/news", label: "News" },
    { to: "/podcasts", label: "Podcasts" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg">Radio Togotane FM</span>
                <span className="text-red-500 text-sm ml-1">88.3</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.to ? "text-red-500" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/listen"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Listen Live
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-300"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2 text-sm font-medium ${
                    location.pathname === link.to ? "text-red-500" : "text-gray-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">Radio Togotane FM</span>
              </div>
              <p className="text-gray-400 text-sm">88.3 FM - Voice of the Community. Broadcasting from Kehancha, Migori County, Kenya.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <Link to="/programs" className="block hover:text-white">Programs</Link>
                <Link to="/presenters" className="block hover:text-white">Presenters</Link>
                <Link to="/news" className="block hover:text-white">News</Link>
                <Link to="/podcasts" className="block hover:text-white">Podcasts</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Kehancha, Migori County</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> +254 700 000 000</div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@radiotogotane.co.ke</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Listen</h3>
              <Link to="/listen" className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium">
                Listen Live
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © 2026 Radio Togotane FM 88.3. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
