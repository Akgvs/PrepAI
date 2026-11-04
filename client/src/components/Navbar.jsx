import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, SignInButton, useAuth } from '../context/AuthContext.jsx';
import { Terminal, Menu, X, LayoutDashboard } from 'lucide-react';
import { NAV_LINKS } from '../utils/constants.js';

const Navbar = () => {
  const { pathname } = useLocation();
  const { isSignedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0c0e14]/95 backdrop-blur-md border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Brand Logo - Flat & Technical */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#161a24] border border-white/10 flex items-center justify-center text-white shrink-0">
              <Terminal className="h-3.5 w-3.5 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-white">
                PrepAI
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                v2.4
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#12151e] p-1 rounded-lg border border-white/8">
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                pathname === '/dashboard'
                  ? 'bg-[#1c2130] text-white border border-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="h-3 w-3" />
              Dashboard
            </Link>

            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.path || pathname.startsWith(`${link.path}/`);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-[#1c2130] text-white border border-white/10'
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
              <div className="flex items-center gap-3 pl-2 border-l border-white/8">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-7 h-7 ring-1 ring-white/15',
                    },
                  }}
                />
              </div>
            ) : (
              <SignInButton mode="redirect">
                <button className="bg-white hover:bg-slate-100 text-slate-950 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/20 transition-colors cursor-pointer">
                  Sign in
                </button>
              </SignInButton>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 space-y-1 border-t border-white/8">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
              Dashboard
            </Link>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  pathname === link.path
                    ? 'bg-[#1c2130] text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-2 px-1 border-t border-white/8 flex items-center justify-between">
              {isSignedIn ? (
                <div className="flex items-center gap-2">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-xs text-slate-400">Account</span>
                </div>
              ) : (
                <SignInButton mode="redirect">
                  <button className="w-full bg-white text-slate-950 py-2 rounded-lg text-xs font-semibold">
                    Sign in
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
