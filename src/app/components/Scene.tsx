'use client'

import { useRef, useEffect, Suspense, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  Environment, 
  OrbitControls, 
  PerspectiveCamera
} from '@react-three/drei'
import * as THREE from 'three'
import FallbackMessage from './FallbackMessage'

// Setup context loss handling
function HandleContextLoss() {
  const { gl } = useThree()
  
  useEffect(() => {
    const canvas = gl.domElement
    const handleContextLost = (event: Event) => {
      console.log('WebGL context lost - preventing default')
      event.preventDefault()
    }
    
    const handleContextRestored = () => {
      console.log('WebGL context restored')
    }
    
    canvas.addEventListener('webglcontextlost', handleContextLost, false)
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false)
    
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
    }
  }, [gl])
  
  return null
}

function GlassSphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2 + 1.2
      meshRef.current.rotation.y += delta * 0.05
    }
  })
  
  return (
    <mesh ref={meshRef} position={[0, 1.2, 0]} castShadow>
      <sphereGeometry args={[0.8, 24, 24]} />
      <meshPhysicalMaterial 
        color="#ffffff"
        transmission={0.9} 
        roughness={0.1}
        metalness={0}
        thickness={0.5}
        ior={1.5}
        clearcoat={0.5}
        clearcoatRoughness={0.2}
        envMapIntensity={0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}

function MetalSphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2 + Math.PI) * 0.2 + 1.2
      meshRef.current.rotation.y += delta * 0.1
    }
  })
  
  return (
    <mesh ref={meshRef} position={[-2, 1.2, 0]} castShadow>
      <sphereGeometry args={[0.8, 24, 24]} />
      <meshStandardMaterial 
        color="#718096"
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  )
}

// Add another sphere with PBR-like effects
function RustedSphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2 + Math.PI * 0.5) * 0.2 + 1.2
      meshRef.current.rotation.y += delta * 0.15
    }
  })
  
  return (
    <mesh ref={meshRef} position={[2, 1.2, 0]} castShadow>
      <sphereGeometry args={[0.8, 24, 24]} />
      <meshStandardMaterial 
        color="#964B00"
        roughness={0.9}
        metalness={0.5}
      />
    </mesh>
  )
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial
        color="#050505"
        roughness={0.5}
        metalness={0.8}
      />
    </mesh>
  )
}

export default function Scene() {
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  
  // If we've had an error and tried 3 times, just show the fallback
  if (hasError && retryCount >= 3) {
    return <FallbackMessage />
  }
  
  return (
    <>
      <FallbackMessage />
      
      <Canvas 
        shadows 
        dpr={[1, 1.2]} 
        gl={{ 
          powerPreference: 'high-performance', 
          antialias: false,
          alpha: false,
          stencil: false,
          depth: true
        }}
        style={{ background: '#050505' }}
        frameloop="demand"
        performance={{ min: 0.1 }}
        onError={() => {
          setHasError(true)
          setRetryCount(prev => prev + 1)
        }}
      >
        <HandleContextLoss />
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={45} />
          <OrbitControls 
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
            minDistance={3}
            maxDistance={10}
            enableDamping={false}
          />
          
          <color attach="background" args={['#050505']} />
          
          <ambientLight intensity={0.3} />
          <spotLight 
            position={[5, 5, 5]} 
            angle={0.15} 
            penumbra={1} 
            intensity={0.8} 
            castShadow 
            shadow-mapSize={[512, 512]}
          />
          
          <GlassSphere />
          <MetalSphere />
          <RustedSphere />
          <Floor />
          
          <Environment preset="city" background={true} />
        </Suspense>
      </Canvas>
    </>
  )
} 