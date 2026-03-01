# Hearthfield v2 — Complete Visual & Functional Overhaul

## CONTEXT
This is a TypeScript + Phaser 3.80 farming sim. ALL textures are procedurally generated in BootScene.ts (no external assets). The game compiles with `npx tsc --noEmit` and bundles with esbuild. The codebase is ~7K LOC.

## CRITICAL BACKGROUND
Phaser's `graphics.generateTexture('key', w, h)` creates a texture with ONLY a single `__BASE` frame covering the full dimensions. It does NOT automatically create spritesheet frame indices. When PlayScene does `this.add.sprite(x, y, 'objects', 7)`, frame 7 doesn't exist, so Phaser renders the ENTIRE 128×16 strip as one image. This is the root cause of most visual bugs.

## CONSTANTS (from types.ts — DO NOT CHANGE types.ts)
```
TILE_SIZE = 16
SCALE = 3  
SCALED_TILE = 48 (TILE_SIZE × SCALE)
FARM_WIDTH = 40
FARM_HEIGHT = 30
```

## FILES TO MODIFY (ONLY these 3 files)
1. `src/scenes/BootScene.ts` — Add frame registration + animations + composite textures
2. `src/scenes/PlayScene.ts` — Fix player scale + improve world objects
3. `src/systems/inventoryPanel.ts` — Fix panel sizing

---

## CHANGE 1: BootScene.ts — Add frame registration

After EVERY `g.generateTexture(...)` call, add frame registration. The pattern is:

```typescript
g.generateTexture('key', width, height);
g.destroy();
// Register spritesheet frames
const tex = this.textures.get('key');
for (let i = 0; i < NUM_FRAMES; i++) {
  tex.add(i, 0, i * FRAME_W, ROW * FRAME_H, FRAME_W, FRAME_H);
}
```

Apply this to ALL texture generators:

### genPlayer (4 frames, 16×16 each, single row)
After `g.generateTexture('player', T*4, T); g.destroy();` add:
```typescript
const pTex = this.textures.get('player');
for (let i = 0; i < 4; i++) pTex.add(i, 0, i * T, 0, T, T);
```

### genTerrain (16 frames, 16×16 each, single row)  
After `g.generateTexture('terrain', T*16, T); g.destroy();` add:
```typescript
const tTex = this.textures.get('terrain');
for (let i = 0; i < 16; i++) tTex.add(i, 0, i * T, 0, T, T);
```

### genCrops (6 cols × 15 rows, each 16×16)
After `g.generateTexture('crops', T*6, T*15); g.destroy();` add:
```typescript
const cTex = this.textures.get('crops');
for (let row = 0; row < 15; row++) {
  for (let col = 0; col < 6; col++) {
    cTex.add(row * 6 + col, 0, col * T, row * T, T, T);
  }
}
```

### genItems (8×8 grid = 64 frames, each 16×16)
After `g.generateTexture('items', T*8, T*8); g.destroy();` add:
```typescript
const iTex = this.textures.get('items');
for (let i = 0; i < 64; i++) {
  const col = i % 8, row = Math.floor(i / 8);
  iTex.add(i, 0, col * T, row * T, T, T);
}
```

### genObjects (8 frames, 16×16 each, single row)
After `g.generateTexture('objects', T*8, T); g.destroy();` add:
```typescript
const oTex = this.textures.get('objects');
for (let i = 0; i < 8; i++) oTex.add(i, 0, i * T, 0, T, T);
```

### genNPCs (10 frames, 16×16 each, single row)
After `g.generateTexture('npcs', T*10, T); g.destroy();` add:
```typescript
const nTex = this.textures.get('npcs');
for (let i = 0; i < 10; i++) nTex.add(i, 0, i * T, 0, T, T);
```

### genPortraits (10 frames, 48×48 each, single row)
After `g.generateTexture('portraits', 480, 48); g.destroy();` add:
```typescript
const prTex = this.textures.get('portraits');
for (let i = 0; i < 10; i++) prTex.add(i, 0, i * 48, 0, 48, 48);
```

### genUIIcons (16 frames, 16×16 each, single row)
After `g.generateTexture('ui_icons', T*16, T); g.destroy();` add:
```typescript
const uTex = this.textures.get('ui_icons');
for (let i = 0; i < 16; i++) uTex.add(i, 0, i * T, 0, T, T);
```

### genTools (6 frames, 16×16 each, single row)
After `g.generateTexture('tools', T*6, T); g.destroy();` add:
```typescript
const tlTex = this.textures.get('tools');
for (let i = 0; i < 6; i++) tlTex.add(i, 0, i * T, 0, T, T);
```

### genAnimals (5 frames, 16×16 each, single row)
After `g.generateTexture('animals', T*5, T); g.destroy();` add:
```typescript
const aTex = this.textures.get('animals');
for (let i = 0; i < 5; i++) aTex.add(i, 0, i * T, 0, T, T);
```

### genMonsters (3 frames, 16×16 each, single row)
After `g.generateTexture('monsters', T*3, T); g.destroy();` add:
```typescript
const mTex = this.textures.get('monsters');
for (let i = 0; i < 3; i++) mTex.add(i, 0, i * T, 0, T, T);
```

---

## CHANGE 2: BootScene.ts — Add player animations

In the `create()` method, BEFORE `this.scene.start(Scenes.MENU)`, add animation creation:

```typescript
create() {
  // Player animations (4 frames: 0=down, 1=up, 2=left, 3=right)
  // Since we only have 1 frame per direction, idle and walk use the same frame
  const dirs = [
    { dir: 'down', frame: 0 },
    { dir: 'up', frame: 1 },
    { dir: 'left', frame: 2 },
    { dir: 'right', frame: 3 },
  ];
  for (const { dir, frame } of dirs) {
    this.anims.create({
      key: `idle_${dir}`,
      frames: [{ key: 'player', frame }],
      frameRate: 1,
      repeat: -1,
    });
    this.anims.create({
      key: `walk_${dir}`,
      frames: [{ key: 'player', frame }],
      frameRate: 6,
      repeat: -1,
    });
  }

  this.scene.start(Scenes.MENU);
}
```

---

## CHANGE 3: BootScene.ts — Add composite textures (house, tree, fence)

Add three new methods to BootScene and call them at the end of `generateAllTextures()`:

### genHouseComposite
```typescript
private genHouseComposite(T: number) {
  const g = this.make.graphics();
  const W = T * 5; // 80px wide
  const H = T * 4; // 64px tall
  
  // Foundation
  g.fillStyle(0x8B6914); g.fillRect(0, H - 4, W, 4);
  
  // Walls
  g.fillStyle(0xD2B48C); g.fillRect(4, 20, W - 8, H - 24);
  // Wall detail: horizontal planks
  g.fillStyle(0xC4A882);
  for (let y = 24; y < H - 4; y += 6) g.fillRect(6, y, W - 12, 1);
  
  // Roof
  g.fillStyle(0xCC4444); 
  g.fillTriangle(W / 2, 0, -4, 22, W + 4, 22);
  g.fillStyle(0xAA3333);
  g.fillTriangle(W / 2, 0, -4, 22, W / 2, 22);
  // Roof edge
  g.fillStyle(0x8B2222); g.fillRect(-4, 20, W + 8, 3);
  
  // Door
  g.fillStyle(0x5C3A21); g.fillRect(W / 2 - 6, H - 22, 12, 18);
  g.fillStyle(0x4A2E18); g.fillRect(W / 2 - 4, H - 20, 8, 16);
  // Door knob
  g.fillStyle(0xFFD700); g.fillRect(W / 2 + 2, H - 12, 2, 2);
  
  // Windows
  g.fillStyle(0x87CEEB); 
  g.fillRect(10, 28, 12, 10);
  g.fillRect(W - 22, 28, 12, 10);
  // Window frames
  g.fillStyle(0x5C3A21);
  g.fillRect(10, 32, 12, 1);
  g.fillRect(15, 28, 1, 10);
  g.fillRect(W - 22, 32, 12, 1);
  g.fillRect(W - 17, 28, 1, 10);
  
  // Chimney
  g.fillStyle(0x888888); g.fillRect(W - 18, 2, 8, 20);
  g.fillStyle(0x666666); g.fillRect(W - 18, 2, 8, 2);
  
  g.generateTexture('house', W, H);
  g.destroy();
}
```

### genTreeComposite
```typescript
private genTreeComposite(T: number) {
  const g = this.make.graphics();
  const W = T * 2; // 32px wide
  const H = T * 3; // 48px tall
  
  // Trunk
  g.fillStyle(0x6B4226); g.fillRect(12, 24, 8, 24);
  g.fillStyle(0x8B5A2B); g.fillRect(14, 26, 4, 20);
  
  // Canopy layers (darker bottom, lighter top)
  g.fillStyle(0x2D6B2D); // darkest
  g.fillRect(2, 18, 28, 10);
  g.fillStyle(0x3A8B3A);
  g.fillRect(4, 10, 24, 12);
  g.fillStyle(0x4AAE4A); // mid
  g.fillRect(6, 4, 20, 12);
  g.fillStyle(0x5DC85D); // lightest
  g.fillRect(10, 0, 12, 8);
  
  // Highlight spots
  g.fillStyle(0x6BDB6B);
  g.fillRect(12, 2, 4, 3);
  g.fillRect(8, 8, 3, 3);
  g.fillRect(18, 6, 3, 2);
  
  g.generateTexture('tree', W, H);
  g.destroy();
}
```

### genFenceComposite
```typescript
private genFenceComposite(T: number) {
  const g = this.make.graphics();
  
  // Fence post
  g.fillStyle(0x8B6914); g.fillRect(6, 2, 4, 14);
  // Horizontal rails
  g.fillStyle(0xA0822C); g.fillRect(0, 4, T, 3);
  g.fillStyle(0xA0822C); g.fillRect(0, 10, T, 3);
  // Post cap
  g.fillStyle(0xBB9944); g.fillRect(6, 1, 4, 2);
  
  g.generateTexture('fence', T, T);
  g.destroy();
}
```

In `generateAllTextures()`, add at the end:
```typescript
this.genHouseComposite(T);
this.genTreeComposite(T);
this.genFenceComposite(T);
```

---

## CHANGE 4: PlayScene.ts — Fix player sprite scale

Find this line:
```typescript
this.playerSprite.setScale(1);
```

Replace with:
```typescript
this.playerSprite.setScale(SCALE);
```

---

## CHANGE 5: PlayScene.ts — Use composite textures for world objects

Replace the ENTIRE `createWorldObjects()` method body with this improved version that uses the composite textures:

```typescript
private createWorldObjects() {
  this.objectLayer = this.add.container(0, 0);

  // House using composite texture
  const housePos = gridToWorld(20, 7);
  const house = this.add.sprite(housePos.x, housePos.y - SCALED_TILE * 0.5, 'house');
  house.setScale(SCALE * 1.8);
  house.setDepth(ySortDepth(housePos.y) - 1);
  this.objectLayer.add(house);
  this.addLabel(20, 5, 'Home');

  // Trees around map edges using composite texture
  const treePositions = [
    // Top edge
    [2, 1], [5, 0], [8, 1], [12, 0], [15, 1], [33, 0], [36, 1], [38, 0],
    // Bottom edge
    [2, 28], [6, 29], [10, 28], [14, 29], [33, 28], [36, 29], [38, 28],
    // Left edge
    [0, 5], [1, 10], [0, 16], [1, 22],
    // Right edge
    [39, 5], [38, 12], [39, 18], [38, 24],
    // Scattered decorative
    [5, 5], [7, 3], [34, 6], [36, 10],
  ];
  for (const [tx, ty] of treePositions) {
    const tPos = gridToWorld(tx, ty);
    const tree = this.add.sprite(tPos.x, tPos.y - SCALED_TILE * 0.6, 'tree');
    tree.setScale(SCALE * 0.8);
    tree.setDepth(ySortDepth(tPos.y));
    this.objectLayer.add(tree);
  }

  // Fence border around farm plot using composite texture
  // Farm area: roughly tiles 10-28, 10-20
  for (let fx = 10; fx <= 28; fx++) {
    for (const fy of [10, 20]) {
      if (fx >= 18 && fx <= 20 && fy === 10) continue; // gap for entry
      const fPos = gridToWorld(fx, fy);
      const fence = this.add.sprite(fPos.x, fPos.y, 'fence');
      fence.setScale(SCALE);
      fence.setDepth(ySortDepth(fPos.y));
      this.objectLayer.add(fence);
    }
  }
  for (let fy = 11; fy <= 19; fy++) {
    for (const fx of [10, 28]) {
      const fPos = gridToWorld(fx, fy);
      const fence = this.add.sprite(fPos.x, fPos.y, 'fence');
      fence.setScale(SCALE);
      fence.setDepth(ySortDepth(fPos.y));
      this.objectLayer.add(fence);
    }
  }

  // Farm plot label
  const farmCenter = gridToWorld(19, 15);
  this.add.text(farmCenter.x, farmCenter.y - SCALED_TILE, '🌱 Farm Plot', {
    fontSize: '12px', color: '#a8d5a3', fontFamily: 'monospace',
    backgroundColor: '#00000066', padding: { x: 4, y: 2 },
  }).setOrigin(0.5).setDepth(500);

  // Interactable objects with labels
  this.createInteractable(21, 8, 2, InteractionKind.BED);
  this.createInteractable(19, 8, 3, InteractionKind.KITCHEN);
  this.createInteractable(14, 11, 1, InteractionKind.CRAFTING_BENCH);
  this.createInteractable(26, 11, 0, InteractionKind.SHIPPING_BIN);
  this.createInteractable(32, 16, 4, InteractionKind.SHOP);
  this.createInteractable(35, 4, 5, InteractionKind.DOOR);
  this.createInteractable(32, 14, 6, InteractionKind.QUEST_BOARD);

  this.addLabel(26, 11, 'Shipping Bin');
  this.addLabel(14, 11, 'Crafting Bench');
  this.addLabel(21, 8, 'Bed');
  this.addLabel(19, 8, 'Kitchen');
  this.addLabel(32, 16, 'Shop');
  this.addLabel(35, 4, 'Mine Entrance');
  this.addLabel(32, 14, 'Quest Board');
}
```

---

## CHANGE 6: PlayScene.ts — Improve NPC placement

Replace the ENTIRE `spawnNPCs()` method body with better positions spread across the map:

```typescript
private spawnNPCs() {
  const npcPositions: Record<string, { x: number; y: number }> = {
    elena: { x: 32, y: 17 },   // at the shop
    owen: { x: 32, y: 13 },    // near quest board
    lily: { x: 6, y: 20 },     // near the pond area
    marcus: { x: 35, y: 5 },   // at the mine
    sage: { x: 15, y: 25 },    // southern path
  };

  for (const npc of NPCS) {
    const posDef = npcPositions[npc.id] ?? { x: 20, y: 20 };
    const x = posDef.x;
    const y = posDef.y;
    const pos = gridToWorld(x, y);
    const spr = this.add.sprite(pos.x, pos.y, 'npcs', npc.spriteIndex);
    spr.setScale(SCALE);
    spr.setDepth(ySortDepth(pos.y));
    spr.setData('interaction', { kind: InteractionKind.NPC, targetId: npc.id, x, y });
    this.npcSprites.set(npc.id, spr);

    // NPC name label
    const label = this.add.text(pos.x, pos.y - SCALED_TILE * 0.7, npc.name, {
      fontSize: '9px', color: '#ffffff', fontFamily: 'monospace',
      backgroundColor: '#00000088', padding: { x: 2, y: 1 },
    }).setOrigin(0.5).setDepth(ySortDepth(pos.y) + 1);
  }
}
```

---

## CHANGE 7: inventoryPanel.ts — Fix oversized panel

Change these three readonly properties:

FROM:
```typescript
private readonly cols = 6;
private readonly rows = 6;
private readonly slotSize = 44;
```

TO:
```typescript
private readonly cols = 6;
private readonly rows = 6;
private readonly slotSize = 36;
```

This shrinks the total panel from ~310px to ~256px wide while keeping all 36 slots.

---

## VERIFICATION
After all changes, run:
```bash
npx tsc --noEmit
```
This must produce zero errors. Do NOT change any other files. Do NOT change types.ts or registry.ts.

## SUMMARY OF CHANGES
1. BootScene: Add frame registration after all 11 `generateTexture` calls
2. BootScene: Add 8 player animations (idle/walk × 4 directions) in `create()`
3. BootScene: Add 3 composite texture generators (house, tree, fence)
4. PlayScene: Fix player sprite scale from 1 to SCALE (3)
5. PlayScene: Replace `createWorldObjects()` to use composite textures
6. PlayScene: Replace `spawnNPCs()` with better positioning + name labels
7. inventoryPanel: Reduce slotSize from 44 to 36
