'use client'

/**
 * Presentation Layer: SceneControls
 * UI controls for interacting with the 3D scene
 */

import React, { useState } from 'react';

interface SceneControlsProps {
  className?: string;
  
  // Camera controls
  onResetCamera?: () => void;
  onToggleAutoRotate?: () => void;
  autoRotateActive?: boolean;
  
  // Effects toggles
  onToggleBloom?: () => void;
  onToggleDepthOfField?: () => void;
  onToggleNoise?: () => void;
  onToggleLights?: () => void;
  bloomActive?: boolean;
  depthOfFieldActive?: boolean;
  noiseActive?: boolean;
  lightsActive?: boolean;
  
  // Material properties
  onMetallicChange?: (value: number) => void;
  metallicValue?: number;
}

export default function SceneControls({
  // Default props
  className = "",
  autoRotateActive = false,
  bloomActive = false,
  depthOfFieldActive = false,
  noiseActive = false,
  lightsActive = true,
  metallicValue = 0.5,
  
  // Callbacks
  onResetCamera,
  onToggleAutoRotate,
  onToggleBloom,
  onToggleDepthOfField,
  onToggleNoise,
  onToggleLights,
  onMetallicChange,
}: SceneControlsProps) {
  const [showEffects, setShowEffects] = useState(false);
    
  // Simple event handlers
  const handleResetView = () => onResetCamera?.();
  const handleRotateToggle = () => onToggleAutoRotate?.();
  const handleBloomToggle = () => onToggleBloom?.();
  const handleDepthOfFieldToggle = () => onToggleDepthOfField?.();
  const handleNoiseToggle = () => onToggleNoise?.();
  const handleLightsToggle = () => onToggleLights?.();
  
  const handleMetallicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onMetallicChange?.(parseFloat(e.target.value));
  };
  
  return (
    <>
      {/* Main controls */}
      <div className={`controls-panel controls-bottom-right ${className}`}>
        <div className='controls-row'>
          <button 
            className="scene-button scene-button-blue"
            onClick={handleResetView}
            title="Reset camera to default position"
          >
            Reset
          </button>
          <button 
            className={`scene-button ${autoRotateActive ? 'scene-button-green' : 'scene-button-gray'}`}
            onClick={handleRotateToggle}
            title={autoRotateActive ? "Stop automatic rotation" : "Enable automatic rotation"}
          >
            Rotate
          </button>
          <button 
            className="scene-button scene-button-purple"
            onClick={() => setShowEffects(!showEffects)}
            title="Toggle effects panel"
          >
            Effects
          </button>
        </div>
      </div>
      
      {/* Effects panel */}
      {showEffects && (
        <div className={`controls-panel controls-top-right ${className}`}>
          <h3 className="controls-title">Visual Effects</h3>
          <div className="controls-col">
            <div className="controls-item">
              <span className="controls-label">Bloom Effect</span>
              <button 
                className={`toggle-button ${bloomActive ? 'scene-button-green' : 'scene-button-gray'}`}
                onClick={handleBloomToggle}
              >
                {bloomActive ? 'On' : 'Off'}
              </button>
            </div>
            
            <div className="controls-item">
              <span className="controls-label">Depth of Field</span>
              <button 
                className={`toggle-button ${depthOfFieldActive ? 'scene-button-green' : 'scene-button-gray'}`}
                onClick={handleDepthOfFieldToggle}
              >
                {depthOfFieldActive ? 'On' : 'Off'}
              </button>
            </div>
            
            <div className="controls-item">
              <span className="controls-label">Film Noise</span>
              <button 
                className={`toggle-button ${noiseActive ? 'scene-button-green' : 'scene-button-gray'}`}
                onClick={handleNoiseToggle}
              >
                {noiseActive ? 'On' : 'Off'}
              </button>
            </div>
            
            <div className="controls-item">
              <span className="controls-label">Lights</span>
              <button 
                className={`toggle-button ${lightsActive ? 'scene-button-green' : 'scene-button-gray'}`}
                onClick={handleLightsToggle}
              >
                {lightsActive ? 'On' : 'Off'}
              </button>
            </div>
            
            <div className="controls-col">
              <div className="controls-item">
                <span className="controls-label">Metallic</span>
                <span className="controls-value">{metallicValue.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={metallicValue} 
                onChange={handleMetallicChange}
                className="slider-full-width"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
} 