/**
 * Animal System — manages purchase, feeding, petting, happiness, product collection
 * NEW FILE — does not modify any existing files
 */
import Phaser from 'phaser';
import { Events, Quality, Animal, AnimalState } from '../types';
import { ANIMAL_DEFS, AnimalDef } from '../data/animalData';

export class AnimalSystem {
  private scene: Phaser.Scene;
  private state: AnimalState;

  constructor(scene: Phaser.Scene, savedState?: AnimalState) {
    this.scene = scene;
    this.state = savedState ?? { animals: [], coopLevel: 0, barnLevel: 0 };
  }

  /** Purchase an animal */
  purchaseAnimal(defId: string, name: string, gold: number): { animal: Animal; cost: number } | null {
    const def = ANIMAL_DEFS.find(d => d.id === defId);
    if (!def) return null;
    if (gold < def.purchasePrice) return null;

    const capacity = this.getCapacity(def.building);
    const current = this.state.animals.filter(a => {
      const d = ANIMAL_DEFS.find(ad => ad.id === a.type);
      return d?.building === def.building;
    }).length;
    if (current >= capacity) return null;

    const animal: Animal = {
      id: `${def.id}_${Date.now()}`,
      type: def.id,
      name,
      happiness: 128,
      fed: false,
      petted: false,
      daysOwned: 0,
      productReady: false,
    };

    this.state.animals.push(animal);
    this.scene.events.emit(Events.ANIMAL_PURCHASE, { animalType: def.id, name });
    this.scene.events.emit(Events.TOAST, { message: `Welcome ${name} the ${def.name}!`, color: '#ffdd44' });
    return { animal, cost: def.purchasePrice };
  }

  /** Feed an animal (consumes 1 feed item) */
  feedAnimal(animalId: string): boolean {
    const animal = this.state.animals.find(a => a.id === animalId);
    if (!animal || animal.fed) return false;
    animal.fed = true;
    animal.happiness = Math.min(255, animal.happiness + 10);
    return true;
  }

  /** Pet an animal */
  petAnimal(animalId: string): boolean {
    const animal = this.state.animals.find(a => a.id === animalId);
    if (!animal || animal.petted) return false;
    animal.petted = true;
    animal.happiness = Math.min(255, animal.happiness + 15);
    this.scene.events.emit(Events.TOAST, { message: `${animal.name} looks happy!`, color: '#ff88cc' });
    return true;
  }

  /** Collect product from animal */
  collectProduct(animalId: string): { itemId: string; quality: Quality } | null {
    const animal = this.state.animals.find(a => a.id === animalId);
    if (!animal || !animal.productReady) return null;

    const def = ANIMAL_DEFS.find(d => d.id === animal.type);
    if (!def) return null;

    animal.productReady = false;
    const isLarge = animal.happiness > 200 && Math.random() < 0.3;
    const itemId = isLarge ? `large_${def.productId}` : def.productId;
    const quality = animal.happiness > 200 ? Quality.GOLD : animal.happiness > 100 ? Quality.SILVER : Quality.NORMAL;

    this.scene.events.emit(Events.ANIMAL_PRODUCT, { animalId, itemId });
    return { itemId, quality };
  }

  /** Called at day start — advance daily state */
  onDayStart() {
    for (const animal of this.state.animals) {
      const def = ANIMAL_DEFS.find(d => d.id === animal.type);
      if (!def) continue;

      // Happiness decay if not fed/petted
      if (!animal.fed) animal.happiness = Math.max(0, animal.happiness - 20);
      if (!animal.petted) animal.happiness = Math.max(0, animal.happiness - 5);

      // Product readiness
      animal.daysOwned++;
      if (animal.fed && animal.daysOwned % def.productionDays === 0) {
        animal.productReady = true;
      }

      // Reset daily flags
      animal.fed = false;
      animal.petted = false;
    }
  }

  /** Get building capacity */
  private getCapacity(building: 'coop' | 'barn'): number {
    const level = building === 'coop' ? this.state.coopLevel : this.state.barnLevel;
    return (level + 1) * 4; // 4, 8, 12 animals per upgrade
  }

  getAnimals(): Animal[] { return this.state.animals; }
  getState(): AnimalState { return this.state; }
}
