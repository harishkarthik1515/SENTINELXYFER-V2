import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Home, Upload, Download, Info, UserCircle, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Breadcrumbs from './Breadcrumbs';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigation = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Encrypt', path: '/encrypt', icon: Upload },
    { name: 'Decrypt', path: '/decrypt', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-background-dark text-gray-100 flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background py-4 border-b border-background-light backdrop-blur-sm bg-opacity-90">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary-light">SentinalXYfer</h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 ${
                      location.pathname === item.path
                        ? 'text-primary-light'
                        : 'text-gray-300 hover:text-primary-light'
                    } transition-colors`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-primary-light">
                    <UserCircle className="w-5 h-5" />
                    <span className="max-w-[150px] truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <UserCircle className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content with padding for fixed header */}
      <main className="container mx-auto px-4 py-8 flex-grow mt-20">
        <Breadcrumbs />
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-background py-8 border-t border-background-light mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold text-primary-light">SentinalXYfer</span>
              </div>
              <p className="text-gray-400">
                Secure your data with military-grade encryption and NFC authentication.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-light mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="text-gray-400 hover:text-primary-light transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-light mb-4">Contact</h3>
              <p className="text-gray-400">
                Have questions? Contact our support team for assistance.
              </p>
              <Link
                to="/about"
                className="inline-block mt-4 text-primary-light hover:text-primary transition-colors"
              >
                Learn More →
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-background-light text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} SentinalXYfer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}