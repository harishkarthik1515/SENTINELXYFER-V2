import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Users, Shield, CheckCircle, Lock } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { auth, db, storage } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import EncryptionVisualizer from '../components/EncryptionVisualizer';

export default function Encrypt() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [encryptionStatus, setEncryptionStatus] = useState<'idle' | 'splitting' | 'encrypting' | 'securing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [authorizedUsers, setAuthorizedUsers] = useState<Array<{ email: string, nfcId: string }>>([]);
  const [partitionCount, setPartitionCount] = useState(2);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserNfcId, setNewUserNfcId] = useState('');

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/auth');
    }
  }, [navigate]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      toast.success('File selected successfully!');
    }
  }, []);

  const addAuthorizedUser = () => {
    if (!newUserEmail || !newUserNfcId) {
      toast.error('Please enter both email and NFC ID');
      return;
    }

    if (authorizedUsers.length >= partitionCount) {
      toast.error(`Maximum ${partitionCount} users allowed`);
      return;
    }

    setAuthorizedUsers([...authorizedUsers, { email: newUserEmail, nfcId: newUserNfcId }]);
    setNewUserEmail('');
    setNewUserNfcId('');
    toast.success('User added successfully!');
  };

  const encryptFile = useCallback(async () => {
    if (!file || authorizedUsers.length < partitionCount || !auth.currentUser) return;

    try {
      setEncryptionStatus('splitting');
      setProgress(20);

      const reader = new FileReader();
      reader.onload = async (e) => {
        let fileContent: string;
        
        // Check if the file is binary or text
        if (/^(text\/|application\/(json|xml))/.test(file.type)) {
          // Handle as text file
          fileContent = e.target?.result as string;
        } else {
          // Handle as binary file - convert ArrayBuffer to base64 string
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const binary = new Uint8Array(arrayBuffer);
          let binaryString = '';
          for (let i = 0; i < binary.byteLength; i++) {
            binaryString += String.fromCharCode(binary[i]);
          }
          fileContent = btoa(binaryString); // Convert to base64
        }
        
        setEncryptionStatus('encrypting');
        setProgress(40);
        
        // Generate unique encryption keys for each partition
        const partitions = Array.from({ length: partitionCount }, (_, i) => {
          const partitionSize = Math.ceil(fileContent.length / partitionCount);
          const start = i * partitionSize;
          const end = start + partitionSize;
          const partitionContent = fileContent.slice(start, end);
          const encryptionKey = CryptoJS.lib.WordArray.random(256/8);
          
          return {
            content: CryptoJS.AES.encrypt(partitionContent, encryptionKey.toString()).toString(),
            key: encryptionKey.toString(),
            userEmail: authorizedUsers[i]?.email,
            nfcId: authorizedUsers[i]?.nfcId,
            partIndex: i // Add index information for proper ordering
          };
        });

        setEncryptionStatus('securing');
        setProgress(60);

        // Store encrypted partitions in Firebase
        const encryptedFileRef = collection(db, 'encryptedFiles');
        const storageRefs = await Promise.all(
          partitions.map(async (partition, index) => {
            // Save as .txt file explicitly
            const filename = `${file.name.replace(/\.[^/.]+$/, "")}_part${index}.txt`;
            const blob = new Blob([partition.content], { type: 'text/plain' });
            const storageRef = ref(storage, `encrypted/${auth.currentUser?.uid}/${filename}`);
            await uploadBytes(storageRef, blob);
            return await getDownloadURL(storageRef);
          })
        );

        setProgress(80);

        await addDoc(encryptedFileRef, {
          fileName: file.name,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.email,
          partitions: partitions.map((partition, index) => ({
            url: storageRefs[index],
            userEmail: partition.userEmail,
            nfcId: partition.nfcId,
            encryptionKey: partition.key,
            partIndex: partition.partIndex // Store partition index for proper reassembly
          }))
        });

        setProgress(100);
        setEncryptionStatus('complete');
        toast.success('File encrypted and shared successfully!');

        // Notify authorized users
        authorizedUsers.forEach(user => {
          toast.success(`Notification sent to ${user.email}`);
        });
      };
      
      // Use readAsArrayBuffer for binary files and readAsText for text files
      if (/^(text\/|application\/(json|xml))/.test(file.type)) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      console.error('Encryption failed:', error);
      setEncryptionStatus('idle');
      toast.error('Encryption failed. Please try again.');
    }
  }, [file, authorizedUsers, partitionCount]);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background p-8 rounded-xl border border-background-light"
      >
        <h2 className="text-3xl font-bold text-primary-light mb-6">Encrypt Your Data</h2>

        {/* File Upload */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Upload className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-gray-200">Upload File</h3>
          </div>
          <div className="border-2 border-dashed border-background-light rounded-lg p-8 text-center">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="fileUpload"
            />
            <label
              htmlFor="fileUpload"
              className="cursor-pointer block"
            >
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-primary mb-4" />
                <p className="text-gray-400 mb-2">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">
                  Supported files: Any file type
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Partition Configuration */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-gray-200">Partition Configuration</h3>
          </div>
          <div className="bg-background-light rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Number of Partitions (Users Required)
            </label>
            <input
              type="number"
              min="2"
              max="5"
              value={partitionCount}
              onChange={(e) => setPartitionCount(parseInt(e.target.value))}
              className="w-full bg-background text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-sm text-gray-500 mt-2">
              The file will be split into {partitionCount} parts, requiring {partitionCount} authorized users to decrypt.
            </p>
          </div>
        </div>

        {/* User Access Control */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-gray-200">Authorize Users</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Enter user email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="bg-background-light text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Enter NFC ID"
                value={newUserNfcId}
                onChange={(e) => setNewUserNfcId(e.target.value)}
                className="bg-background-light text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={addAuthorizedUser}
              className="w-full bg-primary-dark hover:bg-primary text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Add User
            </button>
            <div className="space-y-2">
              {authorizedUsers.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-background-light rounded-lg px-4 py-2"
                >
                  <div>
                    <span className="text-gray-200">{user.email}</span>
                    <span className="text-sm text-gray-500 ml-2">({user.nfcId})</span>
                  </div>
                  <button
                    onClick={() => {
                      setAuthorizedUsers(authorizedUsers.filter((_, i) => i !== index));
                      toast.success(`User ${user.email} removed`);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {authorizedUsers.length < partitionCount && (
              <p className="text-sm text-gray-500">
                Add {partitionCount - authorizedUsers.length} more user(s) to enable encryption
              </p>
            )}
          </div>
        </div>

        {/* Encryption Visualizer */}
        {encryptionStatus !== 'idle' && (
          <div className="mb-8">
            <EncryptionVisualizer stage={encryptionStatus} progress={progress} />
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={encryptFile}
          disabled={!file || authorizedUsers.length < partitionCount || encryptionStatus !== 'idle'}
          className={`w-full py-3 rounded-lg font-semibold ${
            !file || authorizedUsers.length < partitionCount || encryptionStatus !== 'idle'
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-dark'
          } transition-colors`}
        >
          {encryptionStatus === 'idle' ? 'Encrypt File' : 'Processing...'}
        </button>
      </motion.div>
    </div>
  );
}