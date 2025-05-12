/**
 * Integration Layer types
 * Defines interfaces for the Integration Layer API
 */

import * as THREE from 'three';

export interface SceneObject {
  id: string;
  object: THREE.Object3D;
  // Additional properties for object management
}

export interface AnimatedObject extends SceneObject {
  animate: (delta: number, elapsedTime: number) => void;
}

export type ObjectInteractionHandler = (objectId: string, event: MouseEvent) => void;

export interface SceneAPI {
  // Scene initialization and management
  initialize: (container: HTMLElement) => void;
  dispose: () => void;
  
  // Render loop control
  startRenderLoop: () => void;
  stopRenderLoop: () => void;
  performSingleRender: () => void;
  
  // Object management
  getObject: (id: string) => SceneObject | null;
  addObject: (object: SceneObject) => void;
  removeObject: (id: string) => boolean;
  
  // Interaction
  setObjectInteractionHandler: (handler: ObjectInteractionHandler) => void;
  
  // Camera controls
  setCameraPosition: (position: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;
  
  // Environment
  setEnvironment: (preset: string) => void;
  
  // Debug
  getStats: () => { fps: number; memory: { geometries: number; textures: number } };
} 