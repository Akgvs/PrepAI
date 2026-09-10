import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, SignInButton, useAuth } from '../context/AuthContext.jsx';
import { Sparkles, Menu, X, LayoutDashboard } from 'lucide-react';
import { NAV_LINKS } from '../utils/constants.js';

const Navbar = () => {
  const { pathname } = useLocation();
  const { isSignedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white flex items-center gap-1.5">
                Prep<span className="gradient-title">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-mono tracking-widest text-indigo-400">
                AI Career Suite
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5">
            <Link
              to="/dashboard"
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                pathname === '/dashboard'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>

            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.path || pathname.startsWith(`${link.path}/`);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* User Auth Action */}
          <div className="hidden md:flex items-center gap-3">
            {isSignedIn ? (
              <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9 ring-2 ring-indigo-500/50',
                    },
                  }}
                />
              </div>
            ) : (
              <SignInButton mode="redirect">
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-1.5 border-t border-white/10 animate-fadeIn">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-white/5"
            >
              <LayoutDashboard className="h-4 w-4 text-indigo-400" />
              Dashboard
            </Link>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                  pathname === link.path
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-3 px-2 border-t border-white/10 flex items-center justify-between">
              {isSignedIn ? (
                <div className="flex items-center gap-3">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-xs text-slate-400">Account Settings</span>
                </div>
              ) : (
                <SignInButton mode="redirect">
                  <button className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
