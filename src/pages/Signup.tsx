import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Shield, ArrowRight } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        role,
        createdAt: new Date().toISOString()
      });

      // Redirect based on role
      navigate(role === 'admin' ? '/admin' : '/encrypt');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background p-8 rounded-xl border border-background-light"
      >
        <div className="flex items-center space-x-3 mb-6">
          <UserPlus className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-primary-light">Create Account</h2>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Account Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  role === 'user'
                    ? 'border-primary bg-primary bg-opacity-10'
                    : 'border-background-light hover:border-primary'
                }`}
              >
                <UserPlus className="w-6 h-6 mx-auto mb-2 text-primary" />
                <span className="block text-sm font-medium text-gray-200">User</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  role === 'admin'
                    ? 'border-primary bg-primary bg-opacity-10'
                    : 'border-background-light hover:border-primary'
                }`}
              >
                <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                <span className="block text-sm font-medium text-gray-200">Admin</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>Create Account</span>
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}