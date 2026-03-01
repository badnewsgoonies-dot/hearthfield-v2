# Codex Task: Fix the First 5 Minutes — Visual Polish & Player Guidance

## Context
Hearthfield is a Phaser 3 farming sim (TypeScript, ~7K LOC). The backend systems work, but the
visual experience is broken. BootScene generates good textures ('house', 'tree', 'fence') that
are **never used**. Objects render as tiny colored blobs. There are no labels. The player has
no idea what anything is or what to do.

## YOUR JOB
Fix PlayScene.ts so the world looks coherent and readable from second 1. Specifically:

---

### 1. Use the Generated Textures (PlayScene.ts — `createWorldObjects`)

The house currently renders as `this.add.sprite(..., 'objects', 7)` — a purple rectangle.
BootScene generates a proper 'house' texture (80x64 with brick roof, windows, door).

**REPLACE** the house sprite:
```ts
// OLD:
const house = this.add.sprite(housePos.x + SCALED_TILE / 2, housePos.y, 'objects', 7);
house.setScale(SCALE * 2);

// NEW:
const house = this.add.sprite(housePos.x + SCALED_TILE, housePos.y - 16, 'house');
house.setScale(1.5);
house.setDepth(ySortDepth(housePos.y));
```

### 2. Add Floating Labels to All Interactables (PlayScene.ts — `createInteractable`)

After creating each interactable sprite, add a text label below it:
```ts
private createInteractable(tileX: number, tileY: number, frame: number, kind: InteractionKind, label?: string) {
    const pos = gridToWorld(tileX, tileY);
    const spr = this.add.sprite(pos.x, pos.y, 'objects', frame);
    spr.setScale(SCALE);
    spr.setDepth(ySortDepth(pos.y));
    spr.setData('interaction', { kind, x: tileX, y: tileY });
    this.objectLayer.add(spr);
    
    // Add label
    if (label) {
      const lbl = this.add.text(pos.x, pos.y + SCALED_TILE * 0.6, label, {
        fontFamily: 'monospace', fontSize: '10px', color: '#e8d5a3',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(9000);
      this.objectLayer.add(lbl);
    }
}
```

Then update ALL `createInteractable` calls in `createWorldObjects`:
```ts
this.createInteractable(20, 9, 2, InteractionKind.BED, 'Bed');
this.createInteractable(18, 9, 3, InteractionKind.KITCHEN, 'Kitchen');
this.createInteractable(16, 11, 1, InteractionKind.CRAFTING_BENCH, 'Crafting');
this.createInteractable(26, 14, 0, InteractionKind.SHIPPING_BIN, 'Ship Bin');
this.createInteractable(28, 10, 4, InteractionKind.SHOP, 'Shop');
this.createInteractable(35, 5, 5, InteractionKind.DOOR, 'Mine');
this.createInteractable(22, 20, 6, InteractionKind.QUEST_BOARD, 'Quests');
```

### 3. Place Trees Using the 'tree' Texture (PlayScene.ts — `createWorldObjects`)

After placing interactables, add decorative trees around the farm edges:
```ts
// Decorative trees using the 'tree' texture (16x32, generated in BootScene)
const treePositions = [
  [3,3],[5,3],[7,2],[3,8],[5,10],[7,12],  // left side
  [36,3],[38,5],[36,8],[38,10],[36,14],    // right side  
  [10,1],[14,1],[24,1],[30,1],             // top edge
  [10,27],[14,27],[24,27],[30,27],         // bottom edge
];
for (const [tx, ty] of treePositions) {
  const pos = gridToWorld(tx, ty);
  const t = this.add.sprite(pos.x, pos.y - SCALED_TILE/2, 'tree');
  t.setScale(SCALE);
  t.setDepth(ySortDepth(pos.y));
  this.objectLayer.add(t);
}
```

### 4. Add Fence Around Farm Plot (PlayScene.ts — `createWorldObjects`)

The starter farm plot is tiles (14-18, 16-22). Put a fence border around it:
```ts
// Fence around farm plot
for (let fx = 13; fx <= 19; fx++) {
  for (const fy of [15, 23]) { // top and bottom rows
    const pos = gridToWorld(fx, fy);
    const f = this.add.sprite(pos.x, pos.y, 'fence');
    f.setScale(SCALE);
    f.setDepth(ySortDepth(pos.y));
    this.objectLayer.add(f);
  }
}
for (let fy = 15; fy <= 23; fy++) {
  for (const fx of [13, 19]) { // left and right columns
    const pos = gridToWorld(fx, fy);
    const f = this.add.sprite(pos.x, pos.y, 'fence');
    f.setScale(SCALE);
    f.setDepth(ySortDepth(pos.y));
    this.objectLayer.add(f);
  }
}

// Label for farm area
const farmCenter = gridToWorld(16, 15);
this.add.text(farmCenter.x, farmCenter.y - 10, '🌱 Farm Plot', {
  fontFamily: 'monospace', fontSize: '11px', color: '#88cc44',
  stroke: '#000000', strokeThickness: 3,
}).setOrigin(0.5).setDepth(9000);
```

### 5. Spread NPCs to Meaningful Locations (PlayScene.ts — `spawnNPCs`)

Currently all 10 NPCs are on a single row (y=20). Scatter them around the map with name labels:
```ts
private spawnNPCs() {
  // Fixed meaningful positions for each NPC
  const npcPositions: [number, number][] = [
    [25, 8],   // near shop
    [30, 10],  // near pond
    [12, 18],  // near farm
    [22, 22],  // near quest board
    [32, 14],  // east field
    [8, 14],   // west clearing
    [20, 25],  // south path
    [15, 6],   // north area
    [28, 20],  // east path
    [10, 24],  // southwest
  ];

  for (let i = 0; i < NPCS.length; i++) {
    const npc = NPCS[i];
    const [x, y] = npcPositions[i] || [15 + i * 3, 20];
    const pos = gridToWorld(x, y);
    const spr = this.add.sprite(pos.x, pos.y, 'npcs', npc.spriteIndex);
    spr.setScale(SCALE);
    spr.setDepth(ySortDepth(pos.y));
    spr.setData('interaction', { kind: InteractionKind.NPC, targetId: npc.id, x, y });
    this.npcSprites.set(npc.id, spr);

    // Name label above NPC
    const nameLabel = this.add.text(pos.x, pos.y - SCALED_TILE * 0.7, npc.name, {
      fontFamily: 'monospace', fontSize: '9px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(9001);
  }
}
```

### 6. Add Proximity Prompt (PlayScene.ts — `update`)

Show a "Press E" prompt when the player faces an interactable:
Add a class property:
```ts
private proximityPrompt?: Phaser.GameObjects.Text;
```

In `create()`, after input setup:
```ts
this.proximityPrompt = this.add.text(0, 0, '', {
  fontFamily: 'monospace', fontSize: '11px', color: '#ffffff',
  backgroundColor: '#000000aa', padding: { x: 6, y: 3 },
}).setOrigin(0.5).setDepth(10000).setVisible(false);
```

In `update()`, after handleHotbarInput:
```ts
// Proximity prompt
const facing = facingTile(this.player.x, this.player.y, this.player.direction);
const interaction = this.getInteractionAt(facing.x, facing.y);
if (interaction) {
  const wp = gridToWorld(facing.x, facing.y);
  this.proximityPrompt!.setPosition(wp.x, wp.y - SCALED_TILE);
  const kindLabels: Record<string, string> = {
    [InteractionKind.BED]: 'Press E — Sleep',
    [InteractionKind.SHIPPING_BIN]: 'Press E — Ship Item',
    [InteractionKind.CRAFTING_BENCH]: 'Press E — Craft',
    [InteractionKind.KITCHEN]: 'Press E — Cook',
    [InteractionKind.SHOP]: 'Press E — Shop',
    [InteractionKind.DOOR]: 'Press E — Enter Mine',
    [InteractionKind.QUEST_BOARD]: 'Press E — Quests',
    [InteractionKind.NPC]: 'Press E — Talk',
  };
  this.proximityPrompt!.setText(kindLabels[interaction.kind] || 'Press E');
  this.proximityPrompt!.setVisible(true);
} else {
  this.proximityPrompt!.setVisible(false);
}
```

### 7. Add a "FARM AREA" visual marker on the dirt tiles

In `initNewGame`, after setting up farm tiles, the dirt tiles (14-18, 16-22) are already TileType.DIRT.
This is fine. But make sure the terrain colors in BootScene clearly distinguish DIRT from GRASS.
The current colors look OK:
- GRASS: 0x5a9e3e (green)  
- DIRT: 0xc4a56a (tan)  
- TILLED: 0x8b6d3f (dark brown)
- WATERED: 0x6b4d2f (very dark brown)

These are fine — no change needed here.

---

## SCOPE RULES
- You may ONLY edit: `src/scenes/PlayScene.ts`
- Do NOT touch: types.ts, registry.ts, BootScene.ts, UIScene.ts, tutorial.ts, IntroScene.ts, any systems/ files
- Do NOT add new files
- Do NOT change any event handlers or game logic — only visual presentation
- After editing, run: `cd /home/claude/hearthfield-v2 && npx tsc --noEmit && echo BUILD_OK`

## EXECUTION
1. Read PlayScene.ts fully
2. Apply changes 1-6 as described above
3. Verify build passes
4. If build fails, fix ONLY the type errors
5. Report what changed
