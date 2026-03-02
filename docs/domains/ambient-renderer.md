# Domain: Ambient Renderer

## Scope
src/systems/ambientRenderer.ts — ONE file only

## Overview
Seasonal ambient particle effects rendered via Phaser.GameObjects.Graphics. Adds visual life to the overworld: fireflies at night, falling leaves in autumn, butterflies in spring/summer, dust motes, etc. Uses Phaser scene's add.graphics() — NO Phaser particle emitters (those are already used for weather).

## Required Exports

```typescript
export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export class AmbientRenderer {
  /**
   * Create the renderer attached to a Phaser scene.
   * @param scene - the Phaser scene (PlayScene)
   * @param mapWidth - total map width in pixels (FARM_WIDTH * SCALED_TILE)
   * @param mapHeight - total map height in pixels (FARM_HEIGHT * SCALED_TILE)
   */
  constructor(scene: Phaser.Scene, mapWidth: number, mapHeight: number);

  /**
   * Call every frame from scene.update(). Handles spawning, movement, despawn.
   * @param dt - delta time in ms
   * @param season - current season string
   * @param timeOfDay - 0 to 1 float (0=6am, 0.25=noon, 0.5=6pm, 0.75=midnight, 1.0=6am)
   * @param cameraX - camera scroll X (to only render visible particles)
   * @param cameraY - camera scroll Y
   * @param camW - camera viewport width
   * @param camH - camera viewport height
   */
  update(dt: number, season: Season, timeOfDay: number, cameraX: number, cameraY: number, camW: number, camH: number): void;

  /** Remove all graphics objects. Call on scene shutdown. */
  destroy(): void;
}
```

## Particle Types (implement ALL)

### 1. Fireflies (summer + fall nights, timeOfDay > 0.4 && < 0.9)
- Small circles (radius 2-3px) with glow effect (larger circle at 0.1 alpha)
- Color: 0xccff66 (yellow-green), alpha pulsing sinusoidally 0.3-1.0
- Movement: slow random drift, speed 5-15 px/s, direction changes every 1-3s
- Count: 8-15 visible at once
- Spawn zone: grass/farm areas (y < 20 tiles, in world coords below y * 48 = 960)
- Depth: 9000 (above terrain, below UI)

### 2. Falling Leaves (fall only, all day)
- Small rectangles 4×3px, randomly rotated
- Colors: 0xcc6633, 0xdd8844, 0xaa4422, 0xeebb44 (oranges, reds, yellows)
- Movement: fall downward at 20-40 px/s, lateral drift ±10 px/s (sine wave)
- Spawn: across top of visible camera area
- Count: 6-12 visible at once
- Despawn when below camera bottom
- Depth: 9000

### 3. Butterflies (spring + summer, daytime only, timeOfDay 0.05-0.5)
- Tiny shapes: two triangles forming wings, 5px wide
- Colors: 0xff88cc, 0x88ccff, 0xffcc44, 0xffffff (pink, blue, yellow, white)
- Movement: erratic flutter — sine wave horizontal + slow upward drift, speed 15-25 px/s
- Count: 3-6 visible at once
- Spawn zone: flower areas / farm (y between 10-22 tiles)
- Depth: 9000

### 4. Dust Motes (all seasons, daytime, timeOfDay 0.1-0.6)
- Tiny circles, radius 1px
- Color: 0xffeedd at alpha 0.2-0.4
- Movement: very slow upward drift 3-8 px/s, slight horizontal wander
- Count: 10-20 visible
- These are subtle background texture — should be barely visible
- Depth: 100 (behind most objects)

### 5. Snow Sparkle (winter, daytime when clear weather)
- Tiny flashing dots on ground
- Color: 0xffffff, flash on/off every 0.5-1.5s (random per sparkle)
- Stationary, random positions on visible ground
- Count: 8-12
- Depth: 50 (on ground)

## Implementation Constraints

1. **All rendering via Phaser.GameObjects.Graphics**. Create ONE graphics object per particle type, clear and redraw each frame. This is efficient because Graphics.clear() + fillCircle/fillRect is fast for < 50 shapes.
2. **Camera culling**: Only spawn/update particles within camera viewport ± 100px margin.
3. **Particle pool**: Use simple arrays with fixed max size. Recycle dead particles.
4. **No Phaser ParticleEmitter** — those are used by weatherParticles in PlayScene.
5. **Depth**: All particles at depth 9000 (above world objects, below UI at 9990+). Dust at 100.
6. **Performance**: Max 50 total particles across all types. Target < 0.5ms per update call.
7. **File size: 200-300 LOC.**

## Does NOT Handle
- Weather particles (rain/snow handled by PlayScene.refreshWeatherParticles)
- Day/night overlay (handled by PlayScene.updateDayNightCycle)
- Season tinting (handled by seasonRenderer.ts)
- Interior scenes (only overworld)

## Validation
- `npx tsc --noEmit` must pass
- Only import from 'phaser' (no project imports)
- File exports AmbientRenderer class
