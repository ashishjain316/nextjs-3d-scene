'use client'

import { Suspense, useState, useRef } from 'react'
import { SceneContainer, SceneControls, ResponsiveLayout } from '../presentation'
import type { SceneContainerHandle } from '../presentation/SceneContainer'
import LoadingFallback from './components/LoadingFallback';

export default function Home() {
  // Consolidated state for all scene controls
  const [sceneState, setSceneState] = useState({
    autoRotate: false,
    bloom: false,
    depthOfField: false, 
    noise: false,
    lights: true,
    metallic: 0.5
  });
  
  const sceneContainerRef = useRef<SceneContainerHandle>(null);
  
  // Generic handler for boolean toggles
  const handleToggle = (property: 'autoRotate' | 'bloom' | 'depthOfField' | 'noise' | 'lights') => {
    setSceneState(prev => ({
      ...prev,
      [property]: !prev[property]
    }));
  };
  
  // Handle metallic value changes 
  const handleMetallicChange = (value: number) => {
    setSceneState(prev => ({
      ...prev,
      metallic: value
    }));
  };
  
  // Reset camera through the ref
  const handleResetCamera = () => {
    sceneContainerRef.current?.resetCamera();
  };
  
  return (
    <ResponsiveLayout>
      <div className="w-full h-[50vh] md:h-[70vh] lg:h-[80vh] relative">
        <Suspense fallback={<LoadingFallback/>}>
          <SceneContainer 
            ref={sceneContainerRef} 
            autoRotate={sceneState.autoRotate}
            enableBloom={sceneState.bloom}
            enableDepthOfField={sceneState.depthOfField}
            enableNoise={sceneState.noise}
            showLights={sceneState.lights}
            metallic={sceneState.metallic}
          />
          <SceneControls 
            onResetCamera={handleResetCamera}
            onToggleAutoRotate={() => handleToggle('autoRotate')}
            autoRotateActive={sceneState.autoRotate}
            onToggleBloom={() => handleToggle('bloom')}
            onToggleDepthOfField={() => handleToggle('depthOfField')}
            onToggleNoise={() => handleToggle('noise')}
            onToggleLights={() => handleToggle('lights')}
            onMetallicChange={handleMetallicChange}
            bloomActive={sceneState.bloom}
            depthOfFieldActive={sceneState.depthOfField}
            noiseActive={sceneState.noise}
            lightsActive={sceneState.lights}
            metallicValue={sceneState.metallic}
          />
        </Suspense>
      </div>
    </ResponsiveLayout>
  )
}
