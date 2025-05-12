# NextJS 3D Scene

A Next.js project featuring a responsive 3D scene built with React Three Fiber and a clean multi-layer architecture.

## Why Next.js?

For this project, Next.js was selected as the foundational framework based on careful consideration of project requirements, scaling needs, and architectural goals.

### Project Scale Considerations

- **Growth Trajectory**: Next.js provides a scalable foundation that can grow from a simple application to an enterprise-level system without architectural rewrites.
- **Build Performance**: As the application grows, Next.js's intelligent chunking and built-in code splitting ensure optimized loading times regardless of scale.
- **Component Isolation**: The app router pattern encourages modular components that can be developed, tested, and maintained independently, which is crucial as team size increases.

### Data Fetching Capabilities

- **Server Components**: Next.js's React Server Components allow for data fetching directly in the component without client-side JavaScript, reducing bundle size and improving performance.
- **Flexible Data Strategies**: The framework offers multiple data fetching approaches (SSR, SSG, ISR, client-side) that can be chosen based on the specific needs of each part of the application.
- **Streaming**: Supports streaming server rendering and progressive hydration, allowing users to see and interact with parts of the page before the entire content has loaded.
- **Caching Layer**: Built-in caching mechanisms improve data fetching performance and reduce database load.

### Architectural Benefits

- **Hybrid Rendering**: The ability to choose between server and client rendering at the component level provides the perfect balance for a 3D application where visualization is client-side but supporting data can be server-rendered.
- **File-based Routing**: Intuitive routing system reduces routing configuration overhead and makes the codebase more navigable.
- **API Routes**: Built-in API functionality eliminates the need for a separate backend service during development and can be used for proxying to microservices in production.
- **Middleware Support**: Provides a clean way to handle cross-cutting concerns like authentication, logging, and performance monitoring.
- **TypeScript Integration**: First-class TypeScript support ensures type safety across the application.

### Development Experience

- **Fast Refresh**: Maintaining state during refreshes accelerates the development cycle, especially important when iterating on 3D scenes.
- **Developer Tooling**: Comprehensive error reporting, code analysis, and debugging tools improve developer productivity.
- **Vibrant Ecosystem**: Access to a rich ecosystem of plugins, examples, and community support reduces implementation time.

### Production Readiness

- **Edge Compatibility**: Deployable to edge networks for global low-latency delivery.
- **Image and Font Optimization**: Built-in optimizations for media assets reduce bandwidth and improve Core Web Vitals.
- **SEO Friendly**: Server-side rendering capabilities ensure content is indexable by search engines, even for dynamic content.

This thoughtful selection of Next.js aligns perfectly with our goals of creating a high-performance, scalable 3D visualization application that can grow with user needs while maintaining excellent developer experience and code quality.

## Framework Selection Justification

After careful evaluation of various 3D rendering frameworks for the web, **Three.js (via React Three Fiber)** was selected as the optimal solution for this project's requirements, particularly for realistic textures and transparency effects.

### Why Three.js/React Three Fiber?

#### PBR and Material System
- **Superior Material System**: Three.js provides an exceptional physically-based rendering (PBR) pipeline through its `MeshStandardMaterial` and `MeshPhysicalMaterial` classes, which support all standard PBR texture maps (albedo, normal, roughness, metalness, ambient occlusion).
- **Transmission and Refraction**: The `MeshPhysicalMaterial` offers advanced features like `transmission`, `thickness`, and `ior` (index of refraction) properties, which are critical for realistic glass and transparent materials.
- **Clearcoat Effects**: Support for clearcoat parameters allows for realistic automotive paints, lacquered surfaces, and wet-look effects that maintain physically accurate behavior.

#### Transparency Capabilities
- **Advanced Blending**: Three.js provides granular control over transparency with alpha blending modes, which is essential for creating realistic layered transparent materials.
- **Order-Independent Transparency**: While more complex to implement, Three.js allows for order-independent transparency techniques when needed.
- **Performance with Transparency**: Three.js handles transparent objects efficiently, allowing for many transparent objects in a scene without severe performance degradation.

#### Integration with React
- **Declarative API**: React Three Fiber transforms Three.js's imperative API into a declarative one, making it more maintainable and aligning with modern React development practices.
- **Component Ecosystem**: The extensive ecosystem (particularly Drei helpers) provides ready-to-use components for common 3D elements, reducing development time.
- **Next.js Compatibility**: Excellent support for Next.js through careful client-side only execution strategies.

#### Comparison with Alternatives

**Babylon.js**:
- While Babylon.js has an excellent material system and built-in node editor, React Three Fiber's integration with the React ecosystem provides a more cohesive development experience for this React-based project.
- Babylon.js offers a more batteries-included approach, but the flexibility and community support of Three.js better suited our specific needs for material customization.

**PlayCanvas**:
- PlayCanvas offers excellent performance but lacks the tight React integration that React Three Fiber provides.
- The entity-component system, while powerful, doesn't align as well with React's component model.

**WebGPU-based libraries**:
- While emerging WebGPU frameworks promise better performance, they currently lack the mature ecosystem and browser support needed for a production application.

### Client-Side Rendering Strategy

To ensure 3D rendering only occurs on the client side and not during server-side rendering:

1. The `'use client'` directive is used at the top of all components that interact with the 3D context, telling Next.js these components should only run in the browser.
2. Component-level mounting checks are implemented using React's `useState` and `useEffect` hooks:
   ```typescript
   const [isMounted, setIsMounted] = useState(false);
   
   useEffect(() => {
     setIsMounted(true);
     return () => {
       // Cleanup if needed
     };
   }, []);
   
   // Don't render the 3D scene during server-side rendering
   if (!isMounted) {
     return <LoadingFallback />;
   }
   ```
3. React's Suspense is utilized to handle the asynchronous nature of 3D asset loading with appropriate fallback UI.
4. Clear separation between client and server components ensures Three.js code only executes in the browser environment.

This strategy ensures that Three.js initialization only happens on the client side, avoiding the DOM-dependent errors that would occur during server-side rendering while maintaining the benefits of Next.js's hybrid rendering approach.

## Architecture

This project implements a clean multi-layer architecture to ensure separation of concerns and maintainability:

### Data Layer

Located in `/src/data`, the Data Layer is framework-agnostic and responsible for:

- Providing asset paths (texture paths, model paths)
- Storing configuration parameters (camera settings, light properties)
- Defining material presets and scene object configurations
- Managing data services that could potentially fetch dynamic data

Key files:
- `sceneConfig.ts` - Contains static configuration for the 3D scene
- `assetService.ts` - Service for managing and retrieving asset paths
- `index.ts` - Exports all data layer components

### Integration Layer

Located in `/src/integration`, the Integration Layer encapsulates all the 3D framework specifics:

- Initializes and manages the 3D scene, camera, renderer, and lights
- Handles the loading of 3D models and application of materials
- Implements the render loop and animation logic
- Provides a clean API for the Presentation Layer

Key files:
- `types.ts` - Defines interfaces for the Integration Layer API
- `r3fAdapter.tsx` - React Three Fiber implementation of the scene
- `index.ts` - Exports all integration layer components

### Presentation Layer

Located in `/src/presentation`, the Presentation Layer handles UI and interactions:

- Renders the UI components including the canvas container
- Manages React component lifecycle to control the Integration Layer
- Handles DOM events and translates them to Integration Layer calls
- Provides user controls and feedback

Key files:
- `SceneContainer.tsx` - Container component for the 3D scene
- `SceneControls.tsx` - UI controls for interacting with the scene
- `index.ts` - Exports all presentation layer components

## Layer Interaction

The layers interact in a well-defined pattern that ensures separation of concerns while allowing effective communication:

### Data Flow Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Presentation   │     │   Integration   │     │      Data       │
│     Layer       │     │     Layer       │     │     Layer       │
│                 │     │                 │     │                 │
│  UI Components  │     │  3D Framework   │     │  Configuration  │
│  User Events    │     │  Rendering      │     │  Assets         │
│  State Mgmt     │     │  Scene Logic    │     │  Services       │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    Controls UI        Three.js/R3F Adapter       Scene Config
    Interactions        Resource Management        Material Presets
    Layout              Animation Logic            Asset Paths
```

### Specific Interaction Flow

1. **Application Initialization**:
   - The **Presentation Layer** (`SceneContainer`) mounts and determines it's running on the client
   - It renders the **Integration Layer** component (`R3FScene`)
   - The **Integration Layer** fetches configuration from the **Data Layer** (camera settings, materials, lighting)
   - The scene initializes using these configurations

2. **User Interaction Flow**:
   - User interacts with controls in the **Presentation Layer** (`SceneControls` component)
   - The **Presentation Layer** updates its state (toggles, sliders)
   - Updated props flow down to the **Integration Layer**
   - The **Integration Layer** applies these changes to the 3D scene without needing to know about UI details

3. **Resource Management Flow**:
   - The **Integration Layer** requests asset paths from the **Data Layer**
   - The **Data Layer** provides these paths through its services
   - The **Integration Layer** loads and manages these resources (textures, geometries)
   - Loading progress is reported back to the **Presentation Layer** for UI updates

4. **Direct Communication**:
   - For specialized actions (e.g., camera reset), the **Presentation Layer** uses:
     - React refs to expose methods from the **Integration Layer**
     - Custom events (e.g., `resetCamera()` dispatches 'reset-camera' event)
     - The **Integration Layer** listens for these events and responds accordingly

This multi-directional communication pattern allows each layer to focus on its core responsibilities while maintaining a clean API surface between layers. The architecture enables:

- Swapping the 3D framework by only changing the Integration Layer
- Updating scene configurations without modifying rendering code
- Adding UI components without touching 3D logic
- Testing each layer independently

## PBR and Transparency Implementation

### PBR Materials
This project implements physically-based rendering (PBR) using Three.js's MeshStandardMaterial. The implementation:

- Uses multiple texture maps including albedo, normal, roughness, metalness, and ambient occlusion
- Loads and applies these maps through the ResourceManager's async texture loading system
- Creates appropriate UV2 coordinates for ambient occlusion maps
- Configures proper color spaces for different texture types (SRGBColorSpace for color maps)

The PBR workflow is implemented in the ResourceManager class:
```typescript
// Create a PBR material from texture maps
public async createPBRMaterial(
  textureAsset: TextureAsset, 
  key: string = textureAsset.id,
  isTransparent: boolean = false
): Promise<THREE.MeshStandardMaterial> {
  // Implementation loads each texture type and configures material properties
}
```

Each material type (rusty metal, polished gold, etc.) is configured with appropriate physical properties to achieve realistic appearance based on real-world material characteristics.

### Transparency Effects

The glass sphere demonstrates advanced transparency effects using:

- MeshPhysicalMaterial with specialized properties:
  ```typescript
  const material = new THREE.MeshPhysicalMaterial({
    name: key,
    color: new THREE.Color(0xffffff),
    metalness: 0.0,
    roughness: 0.05,
    transmission: 0.95,  // Light transmission for glass effect
    thickness: 0.5,      // Material thickness for refraction
    ior: 1.5,            // Index of refraction (glass = ~1.5)
    transparent: true,
    opacity: 0.9,
    envMapIntensity: 1,
  });
  ```
- Render order management to ensure correct transparent object rendering:
  ```tsx
  <mesh 
    renderOrder={2}  // Higher render order for transparent objects
    // ...other props
  />
  ```
- Double-sided rendering for proper refraction effects
- Environment mapping to create realistic reflections on transparent surfaces

## Challenges and Solutions

### Technical Challenges

During development, several challenges were encountered and addressed:

1. **WebGL Context Management**: WebGL contexts can be lost unexpectedly. This was solved by implementing context loss/restoration event handlers:
   ```typescript
   function HandleContextLoss() {
     const { gl } = useThree();
     
     useEffect(() => {
       const handleContextLost = (event: Event) => {
         event.preventDefault();
       };
       
       const handleContextRestored = () => {
         // Handle restoration
       };
       
       canvas.addEventListener('webglcontextlost', handleContextLost);
       canvas.addEventListener('webglcontextrestored', handleContextRestored);
       
       // Cleanup
     }, [gl]);
   }
   ```

2. **Correct Transparency Rendering**: Ensuring proper rendering of transparent objects required careful management of material properties, render order, and depth writing.

3. **PBR Texture Coordination**: Coordinating multiple texture maps (albedo, normal, roughness, etc.) while ensuring proper loading and error handling required a robust resource management system.

### Performance Optimizations

Several optimizations were implemented to ensure smooth performance:

1. **Resource Pooling**: Geometries are created once and reused to reduce memory usage and initialization time:
   ```typescript
   public getPlaneGeometry(width, height, widthSegments, heightSegments, key) {
     // Check cache first before creating new geometry
     if (this.geometries.has(key)) {
       return this.geometries.get(key) as THREE.PlaneGeometry;
     }
     
     // Create and cache if not found
     const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
     this.geometries.set(key, geometry);
     return geometry;
   }
   ```

2. **Texture Caching**: Textures are loaded once and cached to prevent duplicate loading:
   ```typescript
   public loadTexture(url: string, key: string = url): Promise<THREE.Texture> {
     if (this.textures.has(key)) {
       return Promise.resolve(this.textures.get(key)!);
     }
     
     // Load and cache if not found
   }
   ```

3. **Component Memoization**: React components are memoized to prevent unnecessary re-renders:
   ```typescript
   const PBRSphere = React.memo(({ position, textureSetId, radius = 0.8 }) => {
     // Component implementation
   });
   ```

4. **Progress Tracking**: Loading progress is tracked to provide feedback to users during asset loading.

## Resource Management and Cleanup Strategy

To prevent memory leaks, this application implements a comprehensive resource management strategy through the ResourceManager class:

1. **Centralized Resource Tracking**: All Three.js resources (textures, materials, geometries) are tracked in Maps:
   ```typescript
   private textures: Map<string, THREE.Texture> = new Map();
   private materials: Map<string, THREE.Material> = new Map();
   private geometries: Map<string, THREE.BufferGeometry> = new Map();
   ```

2. **Explicit Disposal**: When components unmount or the scene changes, resources are properly disposed:
   ```typescript
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
   }
   ```

3. **React Lifecycle Integration**: Cleanup is tied to React's component lifecycle:
   ```typescript
   useEffect(() => {
     // Setup code
     
     return () => {
       // Clear scene
       while (scene.children.length > 0) {
         const object = scene.children[0];
         scene.remove(object);
       }
       
       // Dispose resources
       resourceManager.dispose();
     };
   }, [scene, gl]);
   ```

4. **Individual Resource Disposal**: Granular disposal functions for individual resources:
   ```typescript
   public disposeTexture(key: string): boolean {
     const texture = this.textures.get(key);
     if (texture) {
       texture.dispose();
       this.textures.delete(key);
       return true;
     }
     return false;
   }
   ```

This comprehensive approach ensures that all GPU resources are properly released when no longer needed, preventing the memory leaks that commonly plague WebGL applications.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [Three.js Documentation](https://threejs.org/docs/)

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
