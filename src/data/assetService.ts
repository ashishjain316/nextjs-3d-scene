/**
 * Data Layer: Asset Service
 * Manages loading and providing assets in a framework-agnostic way
 */

// Model types that could be loaded
export type ModelType = 'sphere' | 'cube' | 'complex';

// Interface for texture information
export interface TextureInfo {
  path: string;
  type: 'color' | 'normal' | 'roughness' | 'metalness' | 'ao' | 'emissive';
}

/**
 * Service for retrieving asset paths and information
 */
export class AssetService {
  // In a real application, this might fetch from an API
  // For now we'll use static data
  
  /**
   * Get paths to textures for a specific material
   */
  public getTexturesForMaterial(materialName: string): TextureInfo[] {
    // In a real application, this would be more extensive
    // For this demo, we're using simple materials without textures
    const textureMap: Record<string, TextureInfo[]> = {
      'detailed-metal': [
        { path: '/textures/metal/color.jpg', type: 'color' },
        { path: '/textures/metal/normal.jpg', type: 'normal' },
        { path: '/textures/metal/roughness.jpg', type: 'roughness' },
        { path: '/textures/metal/metalness.jpg', type: 'metalness' },
      ],
      // Add more materials as needed
    };
    
    return textureMap[materialName] || [];
  }
  
  /**
   * Get path to a 3D model
   */
  public getModelPath(modelName: string): string {
    // In a real application, this would be more extensive
    const modelMap: Record<string, string> = {
      'detailed-sphere': '/models/detailed-sphere.glb',
      // Add more models as needed
    };
    
    return modelMap[modelName] || '';
  }
}

// Export a singleton instance
export const assetService = new AssetService(); 