'use client'

/**
 * Integration Layer: R3F Scene Manager
 * Manages the 3D scene, lifecycle, and canvas resizing
 */

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment,
  OrbitControls, 
  PerspectiveCamera,
  Stats,
  CameraShake
} from '@react-three/drei';
import * as THREE from 'three';

import { 
  cameraConfig, 
  lightingConfig, 
  rendererConfig,
  environmentConfig,
  textureService
} from '../data';

import { resourceManager } from './resourceManager';
import { LoadingProgress } from './LoadingProgress';

const PBRSphere = React.memo(({ position, textureSetId, radius = 0.8 }: {
  position: [number, number, number];
  textureSetId: string;
  radius?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [material, setMaterial] = useState<THREE.MeshStandardMaterial | null>(null);
  
  useEffect(() => {
    const textureSet = textureService.getTextureSet(textureSetId);
    if (!textureSet) {
      console.error(`Texture set not found: ${textureSetId}`);
      return;
    }
    
    const isTransparent = textureSet.category === 'transparent';
    
    resourceManager.createPBRMaterial(textureSet, textureSetId, isTransparent)
      .then(newMaterial => {
        if (meshRef.current && newMaterial.aoMap) {
          const geometry = meshRef.current.geometry as THREE.BufferGeometry;
          if (!geometry.attributes.uv2 && geometry.attributes.uv) {
            geometry.setAttribute('uv2', geometry.attributes.uv);
          }
        }
        
        if (isTransparent) {
          newMaterial.transparent = true;
          newMaterial.depthWrite = false;
          newMaterial.side = THREE.DoubleSide;
        }
        
        setMaterial(newMaterial);
      })
      .catch(error => {
        console.error(`Failed to create PBR material for ${textureSetId}:`, error);
      });
      
    return () => {};
  }, [textureSetId]);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });
  
  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      castShadow 
      receiveShadow
    >
      <sphereGeometry args={[radius, 32, 32]} />
      {material ? (
        <primitive object={material} attach="material" />
      ) : (
        <meshStandardMaterial color="#888888" />
      )}
    </mesh>
  );
});

PBRSphere.displayName = 'PBRSphere';

const GlassSphere = React.memo(({ position, radius = 0.8 }: {
  position: [number, number, number];
  radius?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const glassMaterial = resourceManager.createGlassMaterial();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });
  
  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      castShadow 
      receiveShadow
      renderOrder={2}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <primitive object={glassMaterial} attach="material" />
    </mesh>
  );
});

GlassSphere.displayName = 'GlassSphere';

const Floor = React.memo(({ 
  position, 
  rotation,
  width = 10,
  height = 10,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  width?: number;
  height?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = resourceManager.getPlaneGeometry(width, height, 1, 1);
  
  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      rotation={rotation} 
      receiveShadow
      geometry={geometry}
    >
      <meshStandardMaterial 
        color="#050505"
        roughness={0.45}
        metalness={0.8}
      />
    </mesh>
  );
});

Floor.displayName = 'Floor';

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

function WindowResizeHandler() {
  const { gl, camera } = useThree();
  
  useEffect(() => {
    const handleResize = () => {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      }
      gl.setSize(window.innerWidth, window.innerHeight);
      gl.setPixelRatio(window.devicePixelRatio);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [gl, camera]);
  
  return null;
}

function SceneSetup() {
  const { scene, gl } = useThree();
  
  useEffect(() => {
    scene.background = new THREE.Color(rendererConfig.backgroundColor);
    
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
    
    return () => {
      console.log('Cleaning up scene and renderer');
      
      while (scene.children.length > 0) {
        const object = scene.children[0];
        scene.remove(object);
      }
      
      resourceManager.dispose();
    };
  }, [scene, gl]);
  
  return null;
}

interface PerformanceSettings {
  min: number;
  max?: number;
}

export function EnhancedScene({ 
  showStats = false, 
  showShaderErrors = false,
  enableCameraShake = false
}: {
  showStats?: boolean;
  showShaderErrors?: boolean;
  enableCameraShake?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
  
  if (hasError && retryCount >= 3) {
    return (
      <div className="flex items-center justify-center h-full w-full p-8 text-center">
        <div>
          <h2 className="text-xl font-bold mb-4">WebGL Error</h2>
          <p>There was a problem initializing the 3D scene. Your browser may not support WebGL or it might be disabled.</p>
        </div>
      </div>
    );
  }
  
  const handleLoadingComplete = () => {
    setLoadingComplete(true);
  };
  
  return (
    <>
      {!loadingComplete && <LoadingProgress onComplete={handleLoadingComplete} />}
      
      <Canvas 
        shadows 
        dpr={rendererConfig.pixelRatio} 
        gl={{ 
          powerPreference: 'high-performance', 
          antialias: true,
          alpha: false,
          stencil: false,
          depth: true,
          failIfMajorPerformanceCaveat: false,
          debug: { 
            checkShaderErrors: showShaderErrors,
            onShaderError: () => console.error('Shader compilation error detected')
          }
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
        <WindowResizeHandler />
        <SceneSetup />
        {showStats && <Stats />}
        
        <PerspectiveCamera 
          makeDefault 
          position={cameraConfig.position}
          fov={cameraConfig.fov}
          near={cameraConfig.near}
          far={cameraConfig.far}
        />
        <OrbitControls 
          enablePan={false}
          minPolarAngle={cameraConfig.minPolarAngle}
          maxPolarAngle={cameraConfig.maxPolarAngle}
          minDistance={cameraConfig.minDistance}
          maxDistance={cameraConfig.maxDistance}
          enableDamping={true}
          dampingFactor={0.05}
        />
        {enableCameraShake && (
          <CameraShake 
            maxYaw={0.01} 
            maxPitch={0.01} 
            maxRoll={0.01} 
            yawFrequency={0.5} 
            pitchFrequency={0.5} 
            rollFrequency={0.4}
          />
        )}
        
        <ambientLight intensity={lightingConfig.ambient.intensity} />
        <spotLight 
          position={lightingConfig.spot.position} 
          angle={lightingConfig.spot.angle} 
          penumbra={lightingConfig.spot.penumbra} 
          intensity={lightingConfig.spot.intensity} 
          castShadow={lightingConfig.spot.castShadow} 
          shadow-mapSize={lightingConfig.spot.shadowMapSize}
        />
        <pointLight position={[-3, 3, -2]} intensity={0.4} />
        
        <PBRSphere 
          position={[-2, 1.2, 0]}
          textureSetId="rusty-metal"
        />
        
        <PBRSphere 
          position={[2, 1.2, 0]}
          textureSetId="polished-gold"
        />
        
        <GlassSphere 
          position={[0, 1.2, 0]}
        />
        
        <Floor 
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        
        <Environment 
          preset={environmentConfig.preset} 
          background={environmentConfig.background} 
        />
      </Canvas>
    </>
  );
}