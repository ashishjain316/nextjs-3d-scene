/**
 * Data Layer: Scene Configuration
 * Framework-agnostic data for the 3D scene
 */

// Camera settings
export const cameraConfig = {
  fov: 45,
  position: [0, 2, 5] as [number, number, number],
  near: 0.1,
  far: 1000,
  minDistance: 3,
  maxDistance: 10,
  minPolarAngle: Math.PI / 6,
  maxPolarAngle: Math.PI / 2,
}

// Lighting configuration
export const lightingConfig = {
  ambient: {
    intensity: 0.3,
    color: 0xffffff,
  },
  spot: {
    position: [5, 5, 5] as [number, number, number],
    intensity: 0.8,
    angle: 0.15,
    penumbra: 1,
    castShadow: true,
    shadowMapSize: [512, 512] as [number, number],
  },
}

// Material presets
export const materialPresets = {
  glass: {
    color: "#ffffff",
    transmission: 0.9,
    roughness: 0.1,
    metalness: 0,
    thickness: 0.5,
    ior: 1.5,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.8,
    transparent: true,
    opacity: 0.9,
  },
  metal: {
    color: "#718096",
    roughness: 0.2,
    metalness: 0.8,
  },
  rust: {
    color: "#964B00",
    roughness: 0.9,
    metalness: 0.5,
  },
  floor: {
    color: "#050505",
    roughness: 0.5,
    metalness: 0.8,
  },
}

// Scene objects configuration
export const sceneObjects = {
  glassSphere: {
    position: [0, 1.2, 0] as [number, number, number],
    geometry: {
      type: "sphere",
      args: [0.8, 24, 24] as [number, number, number],
    },
    material: "glass",
    animation: {
      positionFactor: 0.2,
      rotationFactor: 0.05,
      verticalOffset: 1.2,
    },
  },
  metalSphere: {
    position: [-2, 1.2, 0] as [number, number, number],
    geometry: {
      type: "sphere",
      args: [0.8, 24, 24] as [number, number, number],
    },
    material: "metal",
    animation: {
      positionFactor: 0.2,
      rotationFactor: 0.1,
      verticalOffset: 1.2,
      phase: Math.PI,
    },
  },
  rustSphere: {
    position: [2, 1.2, 0] as [number, number, number],
    geometry: {
      type: "sphere",
      args: [0.8, 24, 24] as [number, number, number],
    },
    material: "rust",
    animation: {
      positionFactor: 0.2,
      rotationFactor: 0.15,
      verticalOffset: 1.2,
      phase: Math.PI * 0.5,
    },
  },
  floor: {
    position: [0, 0, 0] as [number, number, number],
    rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
    geometry: {
      type: "plane",
      args: [10, 10] as [number, number],
    },
    material: "floor",
  },
}

// Renderer configuration
export const rendererConfig = {
  shadows: true,
  pixelRatio: [1, 1.2] as [number, number],
  backgroundColor: "#050505",
  frameloop: "always",
  performance: { min: 0.1 },
}

// Environment configuration
export const environmentConfig = {
  preset: "city" as "apartment" | "city" | "dawn" | "forest" | "lobby" | "night" | "park" | "studio" | "sunset" | "warehouse",
  background: true  ,
} 