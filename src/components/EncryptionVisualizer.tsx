import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, Users } from 'lucide-react';

interface EncryptionVisualizerProps {
  stage: 'splitting' | 'encrypting' | 'securing' | 'complete';
  progress: number;
}

export default function EncryptionVisualizer({ stage, progress }: EncryptionVisualizerProps) {
  const stages = [
    { id: 'splitting', icon: Users, label: 'Splitting File' },
    { id: 'encrypting', icon: Lock, label: 'Encrypting Data' },
    { id: 'securing', icon: Shield, label: 'Securing Access' },
  ];

  return (
    <div className="bg-background-light rounded-lg p-6">
      <div className="flex justify-between mb-8">
        {stages.map((s, index) => {
          const Icon = s.icon;
          const isActive = s.id === stage;
          const isComplete = stages.findIndex(x => x.id === stage) > index;

          return (
            <div
              key={s.id}
              className={`flex flex-col items-center ${
                isActive || isComplete ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  isActive || isComplete ? 'bg-primary bg-opacity-20' : 'bg-background'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className="relative h-2 bg-background rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {stage === 'complete' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center text-primary-light"
        >
          <Shield className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Encryption Complete!</p>
        </motion.div>
      )}
    </div>
  );
}