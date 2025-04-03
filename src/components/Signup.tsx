import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Shield, Loader } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'admin'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: formData.email,
        role: formData.role,
        createdAt: new Date().toISOString(),
        nfcId: `NFC-${Math.random().toString(36).substr(2, 9)}`
      });

      navigate('/encrypt');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full bg-background-light text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full bg-background-light text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full bg-background-light text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Account Type</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
            className={`p-4 rounded-lg border-2 transition-colors ${
              formData.role === 'user'
                ? 'border-primary bg-primary bg-opacity-10'
                : 'border-background-light hover:border-primary'
            }`}
          >
            <UserPlus className="w-6 h-6 mx-auto mb-2 text-primary" />
            <span className="block text-sm font-medium text-gray-200">User</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
            className={`p-4 rounded-lg border-2 transition-colors ${
              formData.role === 'admin'
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
        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <UserPlus className="w-5 h-5" />
        <span>Create Account</span>
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader className="w-5 h-5" />
          </motion.div>
        )}
      </button>
    </form>
  );
}