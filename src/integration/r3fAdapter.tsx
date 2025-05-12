'use client'

/**
 * Integration Layer: React Three Fiber Adapter
 * Implements SceneAPI using React Three Fiber
 */

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  OrbitControls, 
  PerspectiveCamera,
} from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, DepthOfField, Noise } from '@react-three/postprocessing';

import { 
  cameraConfig, 
  lightingConfig, 
  materialPresets, 
  sceneObjects,
  rendererConfig,
  environmentConfig
} from '../data';

interface PerformanceSettings {
  min: number;
  max?: number;
}

interface R3FSceneProps {
  autoRotate?: boolean;
  enableBloom?: boolean;
  enableDepthOfField?: boolean;
  enableNoise?: boolean;
  showLights?: boolean;
  metallic?: number;
}

function HandleContextLoss() {
  const { gl } = useThree();
  
  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      console.log('WebGL context lost - preventing default');
      event.preventDefault();
    };
    
    const handleContextRestored = () => {
      console.log('WebGL context restored');
    };
    
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
    
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);
  
  return null;
}

function CameraController({ autoRotate = false }: { autoRotate: boolean }) {
  // Using any is acceptable here since we're dealing with a drei component
  // that has runtime properties not fully represented in its TypeScript definition
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  
  useEffect(() => {
    const handleResetCamera = () => {
      if (!controlsRef.current) return;
      
      camera.position.set(...cameraConfig.position);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    };
    
    window.addEventListener('reset-camera', handleResetCamera);
    return () => window.removeEventListener('reset-camera', handleResetCamera);
  }, [camera]);
  
  return (
    <OrbitControls 
      ref={controlsRef}
      enablePan={false}
      minPolarAngle={cameraConfig.minPolarAngle}
      maxPolarAngle={cameraConfig.maxPolarAngle}
      minDistance={cameraConfig.minDistance}
      maxDistance={cameraConfig.maxDistance}
      enableDamping={true}
      dampingFactor={0.05}
      autoRotate={autoRotate}
      autoRotateSpeed={1.0}
    />
  );
}

function AnimatedSphere({ 
  id, 
  position, 
  material, 
  animation, 
  geometry,
  metallicOverride
}: {
  id: string;
  position: [number, number, number];
  material: keyof typeof materialPresets;
  animation: {
    positionFactor: number;
    rotationFactor: number;
    verticalOffset: number;
    phase?: number;
  };
  geometry: {
    type: string;
    args: [number, number, number];
  };
  metallicOverride?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { positionFactor, rotationFactor, verticalOffset, phase = 0 } = animation;
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    meshRef.current.position.y = 
      Math.sin(state.clock.elapsedTime * positionFactor + phase) * 0.2 + verticalOffset;
    
    meshRef.current.rotation.y += delta * rotationFactor;
  });
  
  const materialProps = {...materialPresets[material]};
  if (metallicOverride !== undefined && material !== 'glass') {
    materialProps.metalness = metallicOverride;
  }
  
  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      castShadow 
      userData={{ id }}
    >
      <sphereGeometry args={geometry.args} />
      {material === 'glass' ? (
        <meshPhysicalMaterial {...materialProps} />
      ) : (
        <meshStandardMaterial {...materialProps} />
      )}
    </mesh>
  );
}

function Floor({ position, rotation, material, geometry }: {
  position: [number, number, number];
  rotation: [number, number, number];
  material: keyof typeof materialPresets;
  geometry: { type: string; args: [number, number] };
}) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={geometry.args} />
      <meshStandardMaterial {...materialPresets[material]} />
    </mesh>
  );
}

export function R3FScene({ 
  autoRotate = false, 
  enableBloom = false,
  enableDepthOfField = false,
  enableNoise = false,
  showLights = true, 
  metallic = 0.5 
}: R3FSceneProps) {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  if (hasError && retryCount >= 3) {
    return (
      <div className="flex items-center justify-center h-full w-full p-8 text-center">
        <div>
          <h2 className="text-xl font-bold mb-4">WebGL Error</h2>
          <p className="mb-4">
            There was an error initializing the 3D scene.
            This might be due to limited graphics capabilities or memory.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="scene-button scene-button-blue"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <Canvas 
      shadows 
      dpr={rendererConfig.pixelRatio} 
      gl={{ 
        powerPreference: 'high-performance', 
        antialias: false,
        alpha: false,
        stencil: false,
        depth: true
      }}
      style={{ background: rendererConfig.backgroundColor }}
      frameloop={rendererConfig.frameloop as "always" | "demand" | "never"}
      performance={rendererConfig.performance as PerformanceSettings}
      onError={() => {
        setHasError(true);
        setRetryCount(prev => prev + 1);
      }}
    >
      <HandleContextLoss />
      <PerspectiveCamera 
        makeDefault 
        position={cameraConfig.position}
        fov={cameraConfig.fov}
        near={cameraConfig.near}
        far={cameraConfig.far}
      />
      <CameraController autoRotate={autoRotate} />
      
      <color attach="background" args={[rendererConfig.backgroundColor]} />
      
      <ambientLight intensity={lightingConfig.ambient.intensity} />
      
      {showLights && (
        <>
          <spotLight 
            position={lightingConfig.spot.position} 
            angle={lightingConfig.spot.angle} 
            penumbra={lightingConfig.spot.penumbra} 
            intensity={lightingConfig.spot.intensity} 
            castShadow={lightingConfig.spot.castShadow} 
            shadow-mapSize={lightingConfig.spot.shadowMapSize}
          />
          <pointLight position={[-3, 3, -2]} intensity={0.4} />
        </>
      )}
      
      <AnimatedSphere 
        id="glassSphere"
        position={sceneObjects.glassSphere.position}
        material="glass"
        animation={sceneObjects.glassSphere.animation}
        geometry={sceneObjects.glassSphere.geometry}
      />
      
      <AnimatedSphere 
        id="metalSphere"
        position={sceneObjects.metalSphere.position}
        material="metal"
        animation={sceneObjects.metalSphere.animation}
        geometry={sceneObjects.metalSphere.geometry}
        metallicOverride={metallic}
      />
      
      <AnimatedSphere 
        id="rustSphere"
        position={sceneObjects.rustSphere.position}
        material="rust"
        animation={sceneObjects.rustSphere.animation}
        geometry={sceneObjects.rustSphere.geometry}
        metallicOverride={metallic}
      />
      
      <Floor 
        position={sceneObjects.floor.position}
        rotation={sceneObjects.floor.rotation}
        material="floor"
        geometry={sceneObjects.floor.geometry}
      />
      
      <Environment 
        preset={environmentConfig.preset} 
        background={environmentConfig.background} 
      />
      
      <EffectComposer enabled={enableBloom || enableDepthOfField || enableNoise}>
        {/* @ts-expect-error - React Three Fiber types are sometimes incompatible with React's types */}
        {[
          enableBloom && <Bloom key="bloom" luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} />,
          enableDepthOfField && <DepthOfField key="dof" focusDistance={0.2} focalLength={0.5} bokehScale={3} />,
          enableNoise && <Noise key="noise" opacity={0.15} />
        ].filter(Boolean)}
      </EffectComposer>
    </Canvas>
  );
}