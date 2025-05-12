/**
 * Integration Layer: Resource Manager
 * Manages loading, caching, and disposal of Three.js resources
 */

import * as THREE from 'three';
import { TextureAsset } from '../data';

/**
 * Class for managing and disposing of Three.js resources
 * Implements proper cleanup to prevent memory leaks
 */
export class ResourceManager {
  private textures: Map<string, THREE.Texture> = new Map();
  private materials: Map<string, THREE.Material> = new Map();
  private geometries: Map<string, THREE.BufferGeometry> = new Map();
  
  private loadingManager: THREE.LoadingManager;
  private loadingProgress: number = 0;
  private loadingTotal: number = 0;
  private onProgressCallback?: (progress: number) => void;
  
  constructor() {
    this.loadingManager = new THREE.LoadingManager();
    this.setupLoadingManager();
  }
  
  /**
   * Set up the loading manager for tracking loading progress
   */
  private setupLoadingManager(): void {
    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.loadingProgress = itemsLoaded;
      this.loadingTotal = itemsTotal;
      
      if (this.onProgressCallback) {
        this.onProgressCallback(itemsLoaded / itemsTotal);
      }
    };
    
    this.loadingManager.onError = (url) => {
      console.error(`Error loading resource: ${url}`);
    };
  }
  
  /**
   * Set a callback for loading progress updates
   */
  public setProgressCallback(callback: (progress: number) => void): void {
    this.onProgressCallback = callback;
  }
  
  /**
   * Load a texture and cache it
   */
  public loadTexture(url: string, key: string = url): Promise<THREE.Texture> {
    if (this.textures.has(key)) {
      return Promise.resolve(this.textures.get(key)!);
    }
    
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader(this.loadingManager);
      
      loader.load(
        url,
        (texture) => {
          texture.needsUpdate = true;
          this.textures.set(key, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`Failed to load texture: ${url}`, error);
          reject(error);
        }
      );
    });
  }
  
  /**
   * Create a PBR material from texture maps
   */
  public async createPBRMaterial(
    textureAsset: TextureAsset, 
    key: string = textureAsset.id,
    isTransparent: boolean = false
  ): Promise<THREE.MeshStandardMaterial> {
    if (this.materials.has(key)) {
      return this.materials.get(key) as THREE.MeshStandardMaterial;
    }
    
    const material = new THREE.MeshStandardMaterial({
      name: key,
      transparent: isTransparent,
    });
    
    const texturePromises = [];
    
    if (textureAsset.textures.albedo) {
      const promise = this.loadTexture(textureAsset.textures.albedo)
        .then(texture => {
          material.map = texture;
          texture.colorSpace = THREE.SRGBColorSpace;
        });
      texturePromises.push(promise);
    }
    
    if (textureAsset.textures.normal) {
      const promise = this.loadTexture(textureAsset.textures.normal)
        .then(texture => {
          material.normalMap = texture;
        });
      texturePromises.push(promise);
    }
    
    if (textureAsset.textures.roughness) {
      const promise = this.loadTexture(textureAsset.textures.roughness)
        .then(texture => {
          material.roughnessMap = texture;
        });
      texturePromises.push(promise);
    }
    
    if (textureAsset.textures.metalness) {
      const promise = this.loadTexture(textureAsset.textures.metalness)
        .then(texture => {
          material.metalnessMap = texture;
        });
      texturePromises.push(promise);
    }
    
    if (textureAsset.textures.aoMap) {
      const promise = this.loadTexture(textureAsset.textures.aoMap)
        .then(texture => {
          material.aoMap = texture;
        });
      texturePromises.push(promise);
    }
    
    if (textureAsset.textures.emissive) {
      const promise = this.loadTexture(textureAsset.textures.emissive)
        .then(texture => {
          material.emissiveMap = texture;
          material.emissive = new THREE.Color(0xffffff);
          texture.colorSpace = THREE.SRGBColorSpace;
        });
      texturePromises.push(promise);
    }
    
    if (textureAsset.textures.displacement) {
      const promise = this.loadTexture(textureAsset.textures.displacement)
        .then(texture => {
          material.displacementMap = texture;
          material.displacementScale = 0.05;
        });
      texturePromises.push(promise);
    }
    
    if (textureAsset.textures.alpha) {
      const promise = this.loadTexture(textureAsset.textures.alpha)
        .then(texture => {
          material.alphaMap = texture;
          material.transparent = true;
        });
      texturePromises.push(promise);
    }
    
    await Promise.all(texturePromises);
    
    this.materials.set(key, material);
    return material;
  }
  
  /**
   * Create glass material for transparency effects
   */
  public createGlassMaterial(key: string = 'glass'): THREE.MeshPhysicalMaterial {
    if (this.materials.has(key)) {
      return this.materials.get(key) as THREE.MeshPhysicalMaterial;
    }
    
    const material = new THREE.MeshPhysicalMaterial({
      name: key,
      color: new THREE.Color(0xffffff),
      metalness: 0.0,
      roughness: 0.05,
      transmission: 0.95,
      thickness: 0.5,
      ior: 1.5,
      transparent: true,
      opacity: 0.9,
      envMapIntensity: 1,
    });
    
    this.materials.set(key, material);
    return material;
  }
  
  /**
   * Get or create a geometry and cache it
   */
  public getSphereGeometry(
    radius: number = 1,
    widthSegments: number = 32,
    heightSegments: number = 32,
    key: string = `sphere-${radius}-${widthSegments}-${heightSegments}`
  ): THREE.SphereGeometry {
    if (this.geometries.has(key)) {
      return this.geometries.get(key) as THREE.SphereGeometry;
    }
    
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    this.geometries.set(key, geometry);
    return geometry;
  }
  
  /**
   * Get or create a plane geometry and cache it
   */
  public getPlaneGeometry(
    width: number = 1,
    height: number = 1,
    widthSegments: number = 1,
    heightSegments: number = 1,
    key: string = `plane-${width}-${height}-${widthSegments}-${heightSegments}`
  ): THREE.PlaneGeometry {
    if (this.geometries.has(key)) {
      return this.geometries.get(key) as THREE.PlaneGeometry;
    }
    
    const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
    this.geometries.set(key, geometry);
    return geometry;
  }
  
  /**
   * Create a UV grid texture for testing
   */
  public createUVGridTexture(size: number = 1024): THREE.Texture {
    const key = `uvgrid-${size}`;
    
    if (this.textures.has(key)) {
      return this.textures.get(key)!;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#888888';
    context.fillRect(0, 0, size, size);
    
    const gridSize = 8;
    const cellSize = size / gridSize;
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if ((i + j) % 2 === 0) {
          context.fillStyle = '#aaaaaa';
        } else {
          context.fillStyle = '#666666';
        }
        context.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
    
    context.font = `${size / 16}px Arial`;
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    
    for (let i = 0; i <= gridSize; i++) {
      const u = i / gridSize;
      context.fillText(`${u.toFixed(1)}`, i * cellSize, size - 10);
    }
    
    context.textAlign = 'right';
    for (let j = 0; j <= gridSize; j++) {
      const v = 1 - j / gridSize;
      context.fillText(`${v.toFixed(1)}`, size - 10, j * cellSize + size / 32);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    
    this.textures.set(key, texture);
    return texture;
  }
  
  /**
   * Dispose of all resources to prevent memory leaks
   */
  public dispose(): void {
    this.textures.forEach((texture) => {
      texture.dispose();
    });
    this.textures.clear();
    
    this.materials.forEach((material) => {
      material.dispose();
    });
    this.materials.clear();
    
    this.geometries.forEach((geometry) => {
      geometry.dispose();
    });
    this.geometries.clear();
    
    console.log('ResourceManager: All resources disposed');
  }
  
  /**
   * Dispose a specific texture
   */
  public disposeTexture(key: string): boolean {
    const texture = this.textures.get(key);
    if (texture) {
      texture.dispose();
      this.textures.delete(key);
      return true;
    }
    return false;
  }
  
  /**
   * Dispose a specific material
   */
  public disposeMaterial(key: string): boolean {
    const material = this.materials.get(key);
    if (material) {
      material.dispose();
      this.materials.delete(key);
      return true;
    }
    return false;
  }
  
  /**
   * Dispose a specific geometry
   */
  public disposeGeometry(key: string): boolean {
    const geometry = this.geometries.get(key);
    if (geometry) {
      geometry.dispose();
      this.geometries.delete(key);
      return true;
    }
    return false;
  }
}

export const resourceManager = new ResourceManager();