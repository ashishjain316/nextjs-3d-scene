'use client'

import { useState, useEffect } from 'react'

export default function FallbackMessage() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null)
  
  useEffect(() => {
    // Check for WebGL support
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    setHasWebGL(!!gl)
  }, [])
  
  if (hasWebGL === null) {
    return <div>Checking WebGL support...</div>
  }
  
  if (!hasWebGL) {
    return (
      <div className="flex items-center justify-center h-full w-full p-8 text-center">
        <div>
          <h2 className="text-xl font-bold mb-4">WebGL Not Available</h2>
          <p className="mb-4">
            Your browser or device doesn&apos;t support WebGL, which is required for this 3D experience.
          </p>
          <h3 className="font-semibold mb-2">You can try:</h3>
          <ul className="list-disc list-inside text-left">
            <li>Using a modern browser like Chrome, Firefox, or Edge</li>
            <li>Updating your graphics drivers</li>
            <li>Disabling hardware acceleration in your browser settings</li>
            <li>Try a different device</li>
          </ul>
        </div>
      </div>
    )
  }
  
  return null
} 