# Domain: Sound Manager

## Scope
src/systems/soundManager.ts — ONE file only

## Overview
Procedural sound effects using Web Audio API. No external audio files. All sounds synthesized from oscillators, noise, and envelopes. The game currently has ZERO audio — this system adds it all.

## Required Exports

```typescript
export class SoundManager {
  private ctx: AudioContext | null = null;

  /** Call once on first user interaction to unlock AudioContext */
  init(): void;

  /** Master volume 0-1, persists to localStorage */
  setVolume(v: number): void;
  getVolume(): number;
  mute(): void;
  unmute(): void;

  // === Tool sounds ===
  playHoe(): void;        // short thud — low sine + noise burst, 100ms
  playWater(): void;      // splash — noise filtered through bandpass, 200ms
  playAxe(): void;        // sharp chop — saw wave attack + noise, 150ms
  playPickaxe(): void;    // metallic ring — high sine + decay, 200ms
  playScythe(): void;     // whoosh — filtered noise sweep high→low, 150ms
  playFishCast(): void;   // whip + plop — sine glide down + noise, 300ms
  playFishReel(): void;   // clicking — rapid short pulses, 100ms loop

  // === Farm sounds ===
  playPlant(): void;      // soft poke — very short sine blip, 80ms
  playHarvest(): void;    // cheerful 3-note arpeggio, C-E-G, 300ms total
  playGrow(): void;       // gentle rising tone, 200ms (for overnight growth notification)

  // === UI sounds ===
  playSelect(): void;     // menu blip — short square wave, 50ms
  playConfirm(): void;    // positive ding — two ascending tones, 150ms
  playCancel(): void;     // descending tone, 100ms
  playError(): void;      // buzz — low square wave, 200ms
  playCoins(): void;      // coin jingle — rapid high sine notes, 200ms
  playOpenMenu(): void;   // short ascending sweep, 100ms
  playCloseMenu(): void;  // short descending sweep, 100ms
  playToast(): void;      // notification ping — triangle wave, 100ms

  // === Interaction sounds ===
  playDoorOpen(): void;   // creak — frequency-modulated sine, 200ms
  playDoorClose(): void;  // thud — low sine, 100ms
  playPickup(): void;     // pop — sine with fast pitch drop, 80ms
  playGift(): void;       // sparkle — rapid ascending arpeggios, 300ms
  playLevelUp(): void;    // fanfare — 5-note ascending major scale, 500ms

  // === Ambient ===
  playFootstep(): void;   // very quiet noise blip, randomized pitch, 40ms
  playRain(): void;       // start looping rain (filtered noise)
  stopRain(): void;
  playNightAmbient(): void;  // start subtle cricket chirps
  stopNightAmbient(): void;

  // === Combat (mine) ===
  playHit(): void;        // impact — noise + low sine, 100ms
  playMonsterHit(): void; // squelch — frequency-modulated noise, 120ms
  playDeath(): void;      // sad descending 4-note, 400ms
}
```

## Implementation Constraints

1. **AudioContext**: Create lazily on first init() call. Handle Safari requiring user gesture.
2. **Volume**: Use a GainNode master bus. All sounds route through it.
3. **Synthesis patterns** (use these, don't overcomplicate):
   - **Blip**: OscillatorNode → GainNode with exponentialRampToValueAtTime for decay
   - **Noise**: AudioBufferSourceNode with white noise buffer → BiquadFilterNode (bandpass/lowpass)
   - **Arpeggio**: Multiple scheduled oscillators with staggered start times
   - **Sweep**: OscillatorNode with frequency.linearRampToValueAtTime
4. **Performance**: Each sound creates short-lived nodes that auto-disconnect. No persistent oscillators except ambient loops.
5. **No external dependencies**. Pure Web Audio API.
6. **Total file should be 200-350 LOC.**

## Sound Design Reference Values
| Sound | Waveform | Freq (Hz) | Duration (ms) | Envelope |
|-------|----------|-----------|---------------|----------|
| Hoe | sine | 120 | 100 | sharp attack, fast decay |
| Water | noise+bandpass | 800-1200 | 200 | medium attack, slow decay |
| Axe | sawtooth | 200 | 150 | instant attack, fast decay |
| Pickaxe | sine | 800→1200 | 200 | instant, slow ring |
| Plant | sine | 440 | 80 | soft, fast decay |
| Harvest | sine×3 | 523/659/784 | 100ms each | staccato |
| Select | square | 880 | 50 | instant, instant decay |
| Confirm | sine×2 | 660→880 | 75ms each | |
| Coins | sine×4 | 1200+ | 50ms each | rapid |
| Footstep | noise+lowpass | 200-400 | 40 | very quiet (0.1 gain) |

## Does NOT Handle
- Music / background tracks (future feature)
- Spatial audio / panning
- Sound priorities or voice limiting (keep it simple)

## Validation
- `npx tsc --noEmit` must pass
- File exports SoundManager class
- No imports from other project files (standalone)
- No external audio file dependencies
