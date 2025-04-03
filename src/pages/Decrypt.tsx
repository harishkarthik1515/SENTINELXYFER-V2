import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Shield, CheckCircle, Smartphone, Lock, Users } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { auth, db, storage } from '../lib/firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface FilePartition {
  userEmail: string;
  nfcId: string;
  encryptionKey: string;
  url: string;
  partIndex: number; // Added to ensure correct ordering
  isDecrypted: boolean;
}

interface EncryptedFile {
  id: string;
  fileName: string;
  createdBy: string;
  createdAt: Date;
  totalPartitions: number;
  userPartition: FilePartition;
  allPartitions: FilePartition[];
  allDecrypted: boolean;
}

export default function Decrypt() {
  const navigate = useNavigate();
  const [decryptionStatus, setDecryptionStatus] = useState<'idle' | 'processing' | 'complete'>('idle');
  const [rfidInput, setRfidInput] = useState('');
  const [encryptedFiles, setEncryptedFiles] = useState<EncryptedFile[]>([]);
  const rfidInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/auth');
      return;
    }
    fetchAvailableFiles();

    // Focus the RFID input field
    if (rfidInputRef.current) {
      rfidInputRef.current.focus();
    }
  }, [navigate]);

  const fetchAvailableFiles = async () => {
    if (!auth.currentUser?.email) return;
    
    const userEmail = auth.currentUser.email;
    
    try {
      // Get all files from the collection - we'll filter for user access
      const querySnapshot = await getDocs(collection(db, 'encryptedFiles'));
      
      const files: EncryptedFile[] = [];
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        
        // Find if the current user is in any of the partitions
        const userPartitionIndex = data.partitions.findIndex(
          (p: FilePartition) => p.userEmail === userEmail
        );
        
        const isInPartitions = userPartitionIndex !== -1;
        
        // Only include file if user is in the partitions
        if (isInPartitions) {
          files.push({
            id: doc.id,
            fileName: data.fileName,
            createdBy: data.createdBy,
            createdAt: data.createdAt?.toDate() || new Date(),
            totalPartitions: data.partitions.length,
            userPartition: { ...data.partitions[userPartitionIndex], isDecrypted: false },
            allPartitions: data.partitions.map((p: FilePartition) => ({ ...p, isDecrypted: false })),
            allDecrypted: false
          });
        }
      });
      
      setEncryptedFiles(files);
      
      if (files.length > 0) {
        toast.success(`Found ${files.length} file(s) available for decryption`, {
          duration: 5000,
          icon: '🔒'
        });
      } else {
        toast.info('No files available for decryption', {
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch available files');
    }
  };

  const processRFIDInput = (value: string) => {
    if (!value) return;
    
    const updatedFiles = encryptedFiles.map(file => {
      const matchingPartition = file.allPartitions.find(p => p.nfcId === value);
      if (matchingPartition) {
        const updatedPartitions = file.allPartitions.map(partition => 
          partition.nfcId === value ? { ...partition, isDecrypted: true } : partition
        );
        
        const allDecrypted = updatedPartitions.every(p => p.isDecrypted);
        
        if (allDecrypted && !file.allDecrypted) {
          decryptFile(file, updatedPartitions);
        }

        return {
          ...file,
          userPartition: matchingPartition.nfcId === file.userPartition.nfcId 
            ? { ...file.userPartition, isDecrypted: true }
            : file.userPartition,
          allPartitions: updatedPartitions,
          allDecrypted
        };
      }
      return file;
    });

    setEncryptedFiles(updatedFiles);
  };

  const handleRFIDInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRfidInput(value);
  };

  const handleRFIDSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processRFIDInput(rfidInput);
    setRfidInput(''); // Clear input after processing
    
    // Re-focus the input field for the next scan
    if (rfidInputRef.current) {
      rfidInputRef.current.focus();
    }
  };
  
  // Handle auto-submission when RFID scanner inputs data
  const handleRFIDKeyDown = (e: React.KeyboardEvent) => {
    // Many RFID scanners automatically send Enter key after input
    if (e.key === 'Enter') {
      e.preventDefault();
      processRFIDInput(rfidInput);
      setRfidInput(''); // Clear input after processing
    }
  };

  const decryptFile = async (file: EncryptedFile, partitions: FilePartition[]) => {
    setDecryptionStatus('processing');
    toast.loading('Decrypting file...');

    try {
      // Sort partitions by their partIndex to ensure correct order
      const sortedPartitions = [...partitions].sort((a, b) => a.partIndex - b.partIndex);

      const decryptedParts = await Promise.all(
        sortedPartitions.map(async (partition) => {
          try {
            const response = await fetch(partition.url);
            if (!response.ok) throw new Error(`Failed to fetch partition: ${response.status}`);
            
            const encryptedContent = await response.text();
            const decrypted = CryptoJS.AES.decrypt(
              encryptedContent,
              partition.encryptionKey
            ).toString(CryptoJS.enc.Utf8);
            
            if (!decrypted) throw new Error('Failed to decrypt partition');
            return decrypted;
          } catch (error) {
            console.error('Error decrypting partition:', error);
            throw error;
          }
        })
      );

      // Combine all parts into one complete file
      const completeFile = decryptedParts.join('');
      
      // Determine file type for proper mime type
      let mimeType = 'application/octet-stream';
      const fileExtension = file.fileName.split('.').pop()?.toLowerCase();
      
      if (fileExtension) {
        // Map common extensions to mime types
        const mimeTypes: {[key: string]: string} = {
          'txt': 'text/plain',
          'pdf': 'application/pdf',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'gif': 'image/gif',
          'mp4': 'video/mp4',
          'mp3': 'audio/mpeg',
          // Add more as needed
        };
        
        if (mimeTypes[fileExtension]) {
          mimeType = mimeTypes[fileExtension];
        }
      }

      // Handle binary data conversion properly
      let blob;
      if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml')) {
        // Text files can be handled directly
        blob = new Blob([completeFile], { type: mimeType });
      } else {
        // For binary files, we need to convert the base64 string back to binary
        try {
          // If the content is base64 encoded (which it should be for binary files)
          const byteCharacters = atob(completeFile);
          const byteArrays = [];
          
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          
          blob = new Blob(byteArrays, { type: mimeType });
        } catch (e) {
          console.error('Error processing binary data:', e);
          // Fallback to treating as text if base64 decoding fails
          blob = new Blob([completeFile], { type: mimeType });
        }
      }

      // Create download link and trigger download
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setDecryptionStatus('complete');
      toast.dismiss();
      toast.success('File decrypted and downloaded successfully!');
    } catch (error) {
      console.error('Decryption failed:', error);
      toast.dismiss();
      toast.error('Failed to decrypt file. Please ensure all RFID numbers are correct.');
    } finally {
      setTimeout(() => {
        setDecryptionStatus('idle');
      }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background p-8 rounded-xl border border-background-light"
      >
        <h2 className="text-3xl font-bold text-primary-light mb-6">Decrypt Your Data</h2>
        
        {/* RFID Input Form */}
        <div className="mb-8">
          <form onSubmit={handleRFIDSubmit} className="mb-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="rfidInput" className="text-gray-300 font-medium">
                RFID Tag Input
              </label>
              <div className="flex">
                <input
                  ref={rfidInputRef}
                  id="rfidInput"
                  type="text"
                  placeholder="Scan or enter RFID tag"
                  value={rfidInput}
                  onChange={handleRFIDInput}
                  onKeyDown={handleRFIDKeyDown}
                  className="flex-1 bg-background-light border border-background px-4 py-2 rounded-l-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                  autoComplete="off"
                />
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-r-lg transition-colors"
                >
                  Verify
                </button>
              </div>
            </div>
          </form>
          
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 bg-background-light rounded-lg px-6 py-3">
              <Smartphone className="w-6 h-6 text-primary" />
              <span className="text-gray-200">Ready to read RFID tag</span>
            </div>
          </div>
        </div>
        
        {/* Available Files */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Download className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-gray-200">Your Assigned Files</h3>
          </div>
          <div className="space-y-4">
            {encryptedFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-background-light rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-200">{file.fileName}</h4>
                    <p className="text-sm text-gray-400">From: {file.createdBy}</p>
                    <p className="text-sm text-gray-400">
                      Created: {file.createdAt.toLocaleDateString()}
                    </p>
                    <div className="flex items-center mt-2 text-sm text-gray-400">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{file.totalPartitions} participants required for decryption</span>
                    </div>
                  </div>
                  {file.userPartition.isDecrypted && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>
                
                {/* All Partitions */}
                <div className="space-y-2 mb-4">
                  {file.allPartitions.map((partition, index) => (
                    <div
                      key={partition.nfcId}
                      className={`p-4 rounded-lg border ${
                        partition.isDecrypted
                          ? 'border-green-500 bg-green-500 bg-opacity-10'
                          : 'border-background'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-400">
                            Part {partition.partIndex + 1} - {partition.userEmail}
                          </span>
                          <p className="text-sm text-gray-300 mt-1">
                            {partition.isDecrypted ? 'Verified' : '••••••••••'}
                          </p>
                        </div>
                        {partition.isDecrypted && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Indicator */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Decryption Progress</span>
                    <span>{file.allPartitions.filter(p => p.isDecrypted).length} / {file.totalPartitions}</span>
                  </div>
                  <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ 
                        width: `${(file.allPartitions.filter(p => p.isDecrypted).length / file.totalPartitions) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
            {encryptedFiles.length === 0 && (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No files available for decryption</p>
                <p className="text-sm text-gray-500 mt-2">Files will appear here when they are shared with you</p>
              </div>
            )}
          </div>
        </div>

        {/* Decryption Status */}
        {decryptionStatus !== 'idle' && (
          <div className="bg-background-light rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-gray-200">Decryption Status</h3>
            </div>
            <div className="space-y-4">
              <p className="text-gray-400">
                {decryptionStatus === 'processing' ? 'Decrypting file...' : 'Decryption complete!'}
              </p>
              {decryptionStatus === 'processing' && (
                <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2 }}
                  />
                </div>
              )}
              {decryptionStatus === 'complete' && (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-300">File downloaded successfully</p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}