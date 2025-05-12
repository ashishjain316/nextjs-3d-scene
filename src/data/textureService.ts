/**
 * Data Layer: Texture Service
 * Manages loading and access to PBR texture assets
 */

export interface PBRTextureSet {
  albedo: string;
  normal: string;
  roughness: string;
  metalness: string;
  aoMap?: string;
  emissive?: string;
  displacement?: string;
  alpha?: string;
}

export interface TextureAsset {
  id: string;
  name: string;
  category: string;
  textures: PBRTextureSet;
  preview?: string;
}

/**
 * Service for managing texture assets
 */
export class TextureService {
  private textureAssets: Map<string, TextureAsset> = new Map();
  
  constructor() {
    this.registerDefaultTextures();
  }
  
  /**
   * Get a texture set by ID
   */
  public getTextureSet(id: string): TextureAsset | undefined {
    return this.textureAssets.get(id);
  }
  
  /**
   * Get all texture sets
   */
  public getAllTextureSets(): TextureAsset[] {
    return Array.from(this.textureAssets.values());
  }
  
  /**
   * Get texture sets by category
   */
  public getTextureSetsByCategory(category: string): TextureAsset[] {
    return Array.from(this.textureAssets.values()).filter(
      asset => asset.category === category
    );
  }
  
  /**
   * Register a new texture set
   */
  public registerTextureSet(textureAsset: TextureAsset): void {
    this.textureAssets.set(textureAsset.id, textureAsset);
  }
  
  /**
   * Register default textures
   */
  private registerDefaultTextures(): void {
    // Rusty Metal PBR
    this.registerTextureSet({
      id: 'rusty-metal',
      name: 'Rusty Metal',
      category: 'metal',
      textures: {
        albedo: '/textures/rusty-metal/albedo.jpg',
        normal: '/textures/rusty-metal/normal.jpg',
        roughness: '/textures/rusty-metal/roughness.jpg',
        metalness: '/textures/rusty-metal/metallic.jpg',
        aoMap: '/textures/rusty-metal/ao.jpg',
      },
      preview: '/textures/rusty-metal/preview.jpg',
    });
    
    // Polished Gold PBR
    this.registerTextureSet({
      id: 'polished-gold',
      name: 'Polished Gold',
      category: 'metal',
      textures: {
        albedo: '/textures/polished-gold/albedo.jpg',
        normal: '/textures/polished-gold/normal.jpg',
        roughness: '/textures/polished-gold/roughness.jpg',
        metalness: '/textures/polished-gold/metallic.jpg',
      },
      preview: '/textures/polished-gold/preview.jpg',
    });
    
    // Frosted Glass PBR
    this.registerTextureSet({
      id: 'frosted-glass',
      name: 'Frosted Glass',
      category: 'transparent',
      textures: {
        albedo: '/textures/frosted-glass/albedo.jpg',
        normal: '/textures/frosted-glass/normal.jpg',
        roughness: '/textures/frosted-glass/roughness.jpg',
        metalness: '/textures/frosted-glass/metallic.jpg',
        alpha: '/textures/frosted-glass/alpha.jpg',
      },
      preview: '/textures/frosted-glass/preview.jpg',
    });
  }
}

// Export singleton instance
export const textureService = new TextureService(); 