/**
 * Festival System — checks for festivals, manages festival events
 * NEW FILE — does not modify any existing files
 */
import Phaser from 'phaser';
import { Events, Season } from '../types';
import { FESTIVALS, FestivalDef } from '../data/festivalData';

export class FestivalSystem {
  private scene: Phaser.Scene;
  private attended: string[];  // festival IDs attended

  constructor(scene: Phaser.Scene, attended?: string[]) {
    this.scene = scene;
    this.attended = attended ?? [];
  }

  /** Check if today is a festival */
  checkFestival(day: number, season: Season): FestivalDef | null {
    return FESTIVALS.find(f => f.season === season && f.day === day) ?? null;
  }

  /** Called at day start — announces festival */
  onDayStart(day: number, season: Season) {
    const festival = this.checkFestival(day, season);
    if (festival) {
      this.scene.events.emit(Events.TOAST, {
        message: `🎉 Today: ${festival.name}!`, color: '#ffdd44', duration: 5000,
      });
    }
  }

  /** Attend festival — gives rewards */
  attendFestival(festivalId: string): FestivalDef | null {
    const fest = FESTIVALS.find(f => f.id === festivalId);
    if (!fest) return null;
    if (this.attended.includes(festivalId)) return null;

    this.attended.push(festivalId);
    this.scene.events.emit(Events.TOAST, {
      message: `Attended ${fest.name}!`, color: '#44ffaa',
    });
    return fest;
  }

  getAttended(): string[] { return this.attended; }
}
