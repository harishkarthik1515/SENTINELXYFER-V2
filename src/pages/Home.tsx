import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Upload, Download, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold mb-4 text-primary-light">
          Secure NFC-Based Encryption System
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Encrypt your files with military-grade security, control access with NFC authentication,
          and manage your data with confidence.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Encrypt Section */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-background p-6 rounded-xl border border-background-light hover:border-primary transition-colors"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Upload className="w-8 h-8 text-primary" />
            <h3 className="text-xl font-semibold text-primary-light">Encrypt Data</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Upload files, assign NFC access permissions, and secure your data with advanced encryption.
          </p>
          <Link to="/encrypt" className="block">
            <button className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Start Encryption
            </button>
          </Link>
        </motion.div>

        {/* Decrypt Section */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-background p-6 rounded-xl border border-background-light hover:border-primary transition-colors"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Download className="w-8 h-8 text-primary" />
            <h3 className="text-xl font-semibold text-primary-light">Decrypt Data</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Scan your NFC tag to verify access and decrypt your secured files instantly.
          </p>
          <Link to="/decrypt" className="block">
            <button className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Start Decryption
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Security Features */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-center text-primary-light mb-8">
          Enterprise-Grade Security Features
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Lock className="w-6 h-6 text-primary" />,
              title: "End-to-End Encryption",
              description: "AES-256 and RSA-4096 encryption for maximum security"
            },
            {
              icon: <Shield className="w-6 h-6 text-primary" />,
              title: "NFC Authentication",
              description: "Multi-factor authentication with NFC verification"
            },
            {
              icon: <Lock className="w-6 h-6 text-primary" />,
              title: "Access Control",
              description: "Role-based permissions and detailed audit logging"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-background p-6 rounded-lg border border-background-light"
            >
              <div className="flex items-center space-x-3 mb-4">
                {feature.icon}
                <h4 className="text-lg font-semibold text-primary-light">{feature.title}</h4>
              </div>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}