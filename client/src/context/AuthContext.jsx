import React, { createContext, useContext, useState } from 'react';
import {
  ClerkProvider,
  useAuth as useClerkAuth,
  UserButton as ClerkUserButton,
  SignInButton as ClerkSignInButton,
  SignIn as ClerkSignIn,
  SignUp as ClerkSignUp,
} from '@clerk/clerk-react';
import { User, LogIn, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const rawKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
export const isClerkConfigured = Boolean(
  rawKey &&
    (rawKey.startsWith('pk_test_') || rawKey.startsWith('pk_live_')) &&
    !rawKey.includes('...')
);

// Fallback Mock Auth Context when Clerk API key is not configured
const MockAuthContext = createContext({
  isLoaded: true,
  isSignedIn: true,
  userId: 'demo_user_001',
  sessionId: 'demo_session_001',
  user: {
    id: 'demo_user_001',
    firstName: 'Demo',
    fullName: 'Demo Candidate',
    primaryEmailAddress: { emailAddress: 'candidate@demo.com' },
  },
});

export const useAuth = () => {
  if (isClerkConfigured) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useClerkAuth();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useContext(MockAuthContext);
};

export const UserButton = (props) => {
  if (isClerkConfigured) {
    return <ClerkUserButton {...props} />;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-200">
      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
        D
      </div>
      <span className="hidden sm:inline">Demo Candidate</span>
    </div>
  );
};

export const SignInButton = ({ children, mode }) => {
  if (isClerkConfigured) {
    return <ClerkSignInButton mode={mode}>{children}</ClerkSignInButton>;
  }

  return <Link to="/dashboard">{children}</Link>;
};

export const SignIn = (props) => {
  if (isClerkConfigured) {
    return <ClerkSignIn {...props} />;
  }

  return (
    <div className="glass-panel max-w-md w-full p-8 rounded-2xl text-center space-y-4 border border-white/10">
      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
        <LogIn className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-white font-heading">
        Demo Mode Active
      </h2>
      <p className="text-xs text-slate-400 leading-relaxed">
        Authentication is simulated because <code>VITE_CLERK_PUBLISHABLE_KEY</code> is not set in <code>client/.env</code>.
      </p>
      <Link
        to="/dashboard"
        className="block w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
      >
        Continue to Dashboard
      </Link>
    </div>
  );
};

export const SignUp = (props) => {
  if (isClerkConfigured) {
    return <ClerkSignUp {...props} />;
  }
  return <SignIn {...props} />;
};

/**
 * Top Provider: Wraps with real ClerkProvider if key is present,
 * or mock AuthProvider with a helpful banner otherwise.
 */
export const AuthProvider = ({ children }) => {
  if (isClerkConfigured) {
    return (
      <ClerkProvider publishableKey={rawKey}>
        {children}
      </ClerkProvider>
    );
  }

  return (
    <MockAuthContext.Provider
      value={{
        isLoaded: true,
        isSignedIn: true,
        userId: 'demo_user_001',
        sessionId: 'demo_session_001',
        user: {
          id: 'demo_user_001',
          firstName: 'Demo',
          fullName: 'Demo Candidate',
          primaryEmailAddress: { emailAddress: 'candidate@demo.com' },
        },
      }}
    >
      {/* Friendly Non-Blocking Banner when running without Clerk credentials */}
      <div className="bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 border-b border-amber-500/30 px-4 py-1.5 text-center text-xs text-amber-200 font-medium flex items-center justify-center gap-2">
        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
        <span>
          <strong>Preview Mode:</strong> Add your <code>VITE_CLERK_PUBLISHABLE_KEY</code> to <code>client/.env</code> to enable live Clerk user sign-in.
        </span>
      </div>
      {children}
    </MockAuthContext.Provider>
  );
};

export default AuthProvider;
