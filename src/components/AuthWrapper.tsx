import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, UserPlus, Shield, Home } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

type AuthMode = 'login' | 'signup';

export default function AuthWrapper() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', user.uid), {
          email,
          isAdmin,
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back to Home */}
        <Link
          to="/"
          className="flex items-center space-x-2 text-primary-light mb-6 hover:text-primary transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        {/* Auth Mode Selector */}
        <div className="bg-background rounded-t-xl p-4 border border-background-light">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setAuthMode('login')}
              className={`p-4 rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-primary bg-opacity-20 border-2 border-primary'
                  : 'bg-background-light hover:bg-opacity-80'
              }`}
            >
              <Lock className="w-6 h-6 mx-auto mb-2 text-primary" />
              <span className="block text-sm font-medium text-gray-200">Login</span>
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`p-4 rounded-lg transition-all ${
                authMode === 'signup'
                  ? 'bg-primary bg-opacity-20 border-2 border-primary'
                  : 'bg-background-light hover:bg-opacity-80'
              }`}
            >
              <UserPlus className="w-6 h-6 mx-auto mb-2 text-primary" />
              <span className="block text-sm font-medium text-gray-200">Sign Up</span>
            </button>
          </div>
        </div>

        {/* Auth Form */}
        <motion.div
          key={authMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-background rounded-b-xl border-x border-b border-background-light p-6"
        >
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background-light text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background-light text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-background-light text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isAdmin" className="text-sm text-gray-400">
                    Register as Admin
                  </label>
                </div>
              </>
            )}

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {authMode === 'login' ? (
                <Lock className="w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              <span>{authMode === 'login' ? 'Login' : 'Create Account'}</span>
              {loading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}