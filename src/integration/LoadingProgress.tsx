'use client'

/**
 * Integration Layer: Loading Progress Component
 * Displays progress during asset loading
 */

import React, { useEffect, useState } from 'react';
import { resourceManager } from './resourceManager';

interface LoadingProgressProps {
  onComplete?: () => void;
}

export function LoadingProgress({ onComplete }: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    // Set up progress callback
    resourceManager.setProgressCallback((value: number) => {
      // Convert from 0-1 to percentage (0-100)
      const percentage = Math.round(value * 100);
      setProgress(percentage);
      
      // Check if loading is complete (value is 1.0 or greater)
      if (value >= 1.0) {
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
      }
    });
    
    return () => {
      // Remove callback when component unmounts
      resourceManager.setProgressCallback(() => {});
    };
  }, [onComplete]);
  
  if (isComplete) {
    return null;
  }
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-64 p-4 bg-gray-800 rounded-lg shadow-lg">
        <div className="mb-2 text-center text-white">Loading Assets</div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-1 text-xs text-right text-gray-400">
          {progress}%
        </div>
      </div>
    </div>
  );
} 