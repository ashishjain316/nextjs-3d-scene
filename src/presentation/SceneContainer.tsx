'use client'

/**
 * Presentation Layer: SceneContainer
 * Responsible for rendering the 3D scene and handling UI interactions
 */

import React, { Suspense, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { R3FScene } from '../integration';
import LoadingFallback from '../app/components/LoadingFallback';

interface SceneContainerProps {
  className?: string;
  autoRotate?: boolean;
  // Visual effects and materials
  enableBloom?: boolean;
  enableDepthOfField?: boolean;
  enableNoise?: boolean;
  showLights?: boolean;
  metallic?: number;
}

export interface SceneContainerHandle {
  resetCamera: () => void;
}


const SceneContainer = forwardRef<SceneContainerHandle, SceneContainerProps>(
  function SceneContainer({ 
    className = "", 
    autoRotate = false,
    enableBloom = false,
    enableDepthOfField = false,
    enableNoise = false,
    showLights = true,
    metallic = 0.5
  }, ref) {
    const [isMounted, setIsMounted] = useState(false);
    
    // Expose camera reset method to parent component
    useImperativeHandle(ref, () => ({
      resetCamera: () => {
        // Use custom event to communicate with the camera controller in r3fAdapter
        window.dispatchEvent(new CustomEvent('reset-camera'));
      }
    }));
    
    // Client-side only mounting
    useEffect(() => {
      setIsMounted(true);
      return () => {
        // Cleanup if needed
      };
    }, []);
    
    // Don't render the 3D scene during server-side rendering
    if (!isMounted) {
      return <LoadingFallback />;
    }
    
    return (
      <div className={`w-full h-full relative rounded-lg overflow-hidden ${className}`}>
        <Suspense fallback={<LoadingFallback />}>
          <R3FScene 
            autoRotate={autoRotate} 
            enableBloom={enableBloom}
            enableDepthOfField={enableDepthOfField}
            enableNoise={enableNoise}
            showLights={showLights}
            metallic={metallic}
          />
        </Suspense>
      </div>
    );
  }
);

export default SceneContainer; 