import { ItemCategory } from '../types';

export interface AnimalDef {
  id: string;
  name: string;
  type: 'chicken' | 'cow';
  building: 'coop' | 'barn';
  purchasePrice: number;
  productId: string;
  productName: string;
  productPrice: number;
  productionDays: number;   // days between products
  maxHappiness: number;
  feedItemId: string;
  spriteKey: string;
}

export const ANIMAL_DEFS: AnimalDef[] = [
  {
    id: 'chicken', name: 'Chicken', type: 'chicken', building: 'coop',
    purchasePrice: 800, productId: 'egg', productName: 'Egg', productPrice: 50,
    productionDays: 1, maxHappiness: 255, feedItemId: 'fiber', spriteKey: 'animal_chicken',
  },
  {
    id: 'cow', name: 'Cow', type: 'cow', building: 'barn',
    purchasePrice: 1500, productId: 'milk', productName: 'Milk', productPrice: 125,
    productionDays: 1, maxHappiness: 255, feedItemId: 'fiber', spriteKey: 'animal_cow',
  },
];

// Items that animals produce (to be added to registry during integration)
export const ANIMAL_ITEMS = [
  { id: 'egg', name: 'Egg', category: ItemCategory.ANIMAL_PRODUCT, sellPrice: 50, description: 'A fresh egg.', spriteIndex: 70 },
  { id: 'large_egg', name: 'Large Egg', category: ItemCategory.ANIMAL_PRODUCT, sellPrice: 95, description: 'A large, high-quality egg.', spriteIndex: 71 },
  { id: 'milk', name: 'Milk', category: ItemCategory.ANIMAL_PRODUCT, sellPrice: 125, description: 'Fresh cow milk.', spriteIndex: 72 },
  { id: 'large_milk', name: 'Large Milk', category: ItemCategory.ANIMAL_PRODUCT, sellPrice: 190, description: 'Rich, creamy milk.', spriteIndex: 73 },
  { id: 'wool', name: 'Wool', category: ItemCategory.ANIMAL_PRODUCT, sellPrice: 340, description: 'Soft and warm.', spriteIndex: 74 },
  { id: 'cheese', name: 'Cheese', category: ItemCategory.ANIMAL_PRODUCT, sellPrice: 200, description: 'Made from fresh milk.', spriteIndex: 75 },
  { id: 'mayonnaise', name: 'Mayonnaise', category: ItemCategory.ANIMAL_PRODUCT, sellPrice: 190, description: 'Made from eggs.', spriteIndex: 76 },
];
