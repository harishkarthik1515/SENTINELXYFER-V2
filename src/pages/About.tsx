import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Smartphone, Users, FileText, Key } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const features = [
    {
      icon: <Lock className="w-8 h-8 text-primary" />,
      title: "Military-Grade Encryption",
      description: "AES-256 encryption ensures your data remains secure and private."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-primary" />,
      title: "NFC Authentication",
      description: "Advanced NFC-based authentication for enhanced security."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Multi-User Access",
      description: "Control and manage access permissions for multiple users."
    },
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: "File Partitioning",
      description: "Split encrypted files into secure partitions for distributed access."
    },
    {
      icon: <Key className="w-8 h-8 text-primary" />,
      title: "Key Management",
      description: "Secure key distribution and management system."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Audit Logging",
      description: "Comprehensive logging of all encryption and decryption activities."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold text-primary-light mb-6">
          Secure NFC-Based Encryption System
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          A cutting-edge solution for secure data encryption and access control,
          combining NFC technology with advanced cryptographic algorithms.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-background p-6 rounded-xl border border-background-light hover:border-primary transition-colors"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-primary-light mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background p-8 rounded-xl border border-background-light mb-16"
      >
        <h2 className="text-2xl font-bold text-primary-light mb-6">
          How It Works
        </h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-semibold">1</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                Upload & Encrypt
              </h3>
              <p className="text-gray-400">
                Upload your files and select authorized users. The system automatically
                encrypts and partitions your data using AES-256 encryption.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-semibold">2</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                NFC Assignment
              </h3>
              <p className="text-gray-400">
                Each authorized user receives a unique NFC ID that's cryptographically
                linked to their encrypted file partitions.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-semibold">3</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                Secure Access
              </h3>
              <p className="text-gray-400">
                Users can access their files by providing their NFC ID. The system
                verifies permissions and decrypts the data in real-time.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-primary-light mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-gray-400 mb-8">
          Create an account now and experience the future of secure data encryption.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/auth"
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Sign Up Now
          </Link>
          <Link
            to="/encrypt"
            className="bg-background-light hover:bg-opacity-80 text-gray-200 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Try Demo
          </Link>
        </div>
      </motion.div>
    </div>
  );
}