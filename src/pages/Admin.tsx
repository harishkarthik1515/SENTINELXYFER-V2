import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Shield, Settings, Lock } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

interface EncryptedFile {
  id: string;
  fileName: string;
  createdAt: Timestamp;
  createdBy: string;
  partitions: Array<{
    userEmail: string;
    nfcId: string;
    url: string;
  }>;
}

interface AccessLog {
  id: string;
  action: string;
  user: string;
  timestamp: Timestamp;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'users' | 'files' | 'logs'>('users');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [encryptedFiles, setEncryptedFiles] = useState<EncryptedFile[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        subscribeToFiles();
        subscribeToLogs();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const subscribeToFiles = () => {
    const filesRef = collection(db, 'encryptedFiles');
    const q = query(filesRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const files = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EncryptedFile[];
      
      setEncryptedFiles(files);
    });
  };

  const subscribeToLogs = () => {
    const logsRef = collection(db, 'accessLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AccessLog[];
      
      setAccessLogs(logs);
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background p-8 rounded-xl border border-background-light"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-primary-light">Admin Login</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-background-light text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-background-light text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background p-8 rounded-xl border border-background-light"
      >
        <div className="flex items-center space-x-3 mb-8">
          <Settings className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold text-primary-light">Admin Dashboard</h2>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-background-light">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'users'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Users className="w-5 h-5 inline-block mr-2" />
            Users & NFC
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'files'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <FileText className="w-5 h-5 inline-block mr-2" />
            Encrypted Files
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'logs'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Shield className="w-5 h-5 inline-block mr-2" />
            Access Logs
          </button>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          {activeTab === 'files' && (
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-background-light">
                  <th className="pb-3 text-gray-400">File Name</th>
                  <th className="pb-3 text-gray-400">Created By</th>
                  <th className="pb-3 text-gray-400">Created At</th>
                  <th className="pb-3 text-gray-400">Authorized Users</th>
                </tr>
              </thead>
              <tbody>
                {encryptedFiles.map((file) => (
                  <tr key={file.id} className="border-b border-background-light">
                    <td className="py-4 text-gray-200">{file.fileName}</td>
                    <td className="py-4 text-gray-200">{file.createdBy}</td>
                    <td className="py-4 text-gray-200">
                      {file.createdAt.toDate().toLocaleString()}
                    </td>
                    <td className="py-4 text-gray-200">
                      {file.partitions.map(p => p.userEmail).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'logs' && (
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-background-light">
                  <th className="pb-3 text-gray-400">Action</th>
                  <th className="pb-3 text-gray-400">User</th>
                  <th className="pb-3 text-gray-400">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {accessLogs.map((log) => (
                  <tr key={log.id} className="border-b border-background-light">
                    <td className="py-4 text-gray-200">{log.action}</td>
                    <td className="py-4 text-gray-200">{log.user}</td>
                    <td className="py-4 text-gray-200">
                      {log.timestamp.toDate().toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}