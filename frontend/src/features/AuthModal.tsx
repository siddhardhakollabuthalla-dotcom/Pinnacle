import React, { useState } from 'react';
import { LogIn, UserPlus, KeyRound } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { api } from '../api/client';
import type { User } from '../types';

export const AuthModal: React.FC<{
  onAuthSuccess: (user: User) => void;
  onBack?: () => void;
  initialMode?: 'login' | 'signup';
}> = ({ onAuthSuccess, onBack, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Google sign in state for asking desired password
  const [googleUser, setGoogleUser] = useState<{ email: string; name: string } | null>(null);
  const [googlePassword, setGooglePassword] = useState('');

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user.email) {
        const userEmail = user.email;
        const displayName = user.displayName || userEmail.split('@')[0];
        setGoogleUser({ email: userEmail, name: displayName });
      } else {
        throw new Error('Google sign-in failed to retrieve email.');
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteGoogleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser || !googlePassword) return;
    setError(null);
    setLoading(true);

    try {
      // First try logging in with Google email & chosen password
      try {
        const loginRes = await api.login({
          username_or_email: googleUser.email,
          password: googlePassword,
        });
        onAuthSuccess(loginRes.user);
        return;
      } catch (loginErr) {
        // If login fails (user not created yet), create new account with Google email + chosen password
        const cleanUsername = googleUser.name.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 15) || 'hero';
        const signupUser = await api.signup({
          email: googleUser.email,
          username: `${cleanUsername}_${Math.floor(Math.random() * 1000)}`,
          password: googlePassword,
        });
        onAuthSuccess(signupUser);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login({ username_or_email: username || email, password });
        onAuthSuccess(res.user);
      } else {
        const user = await api.signup({ email, username, password });
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black relative">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white font-mono text-xs font-bold transition-all flex items-center gap-2"
        >
          ← BACK TO OVERVIEW
        </button>
      )}

      <div className="w-full max-w-md bg-gray-900/80 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <img src="/logo.png" alt="Pinnacle Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
            PINNACLE
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">Gamify your daily tasks & level up real-world skills</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Google Password Setup Step */}
        {googleUser ? (
          <form onSubmit={handleCompleteGoogleAuth} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <span>Google Email Authenticated: <strong>{googleUser.email}</strong></span>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 uppercase mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Choose Password For Pinnacle Account *</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={googlePassword}
                onChange={(e) => setGooglePassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-zinc-500 font-mono mt-1">
                You can use this password to log in directly via email in the future.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !googlePassword}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black uppercase tracking-wider text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'SAVING ACCOUNT...' : 'CONFIRM PASSWORD & ENTER GAME'}
            </button>

            <button
              type="button"
              onClick={() => setGoogleUser(null)}
              className="w-full text-xs text-zinc-500 hover:text-zinc-300 font-mono text-center block pt-1"
            >
              Cancel Google Login
            </button>
          </form>
        ) : (
          <>
            {/* Continue with Google Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full py-3 mb-4 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-100 transition-all text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-3 border border-zinc-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>CONTINUE WITH GOOGLE</span>
            </button>

            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-gray-900 px-3 text-[10px] font-mono text-gray-500 uppercase">OR WITH EMAIL</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-1">
                  {isLogin ? 'Username or Email' : 'Username'}
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isLogin ? "Enter your username or email" : "Choose a username"}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black uppercase tracking-wider text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {loading ? 'PROCESSING...' : isLogin ? 'LOG IN TO CHARACTER' : 'CREATE AVATAR'}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-gray-400 hover:text-amber-400 transition-colors font-mono"
          >
            {isLogin ? "Don't have a character? Create one" : 'Already registered? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};
