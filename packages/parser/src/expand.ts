import type { Item, StitchName } from './type';

export function expandItems(items: Item[], prev: number): StitchName[] {
  return items.flatMap((item) => {
    if (item.kind === 'repeat') {
      return Array.from({ length: item.times }, () => expandItems(item.items, prev)).flat();
    }
    const n = item.place === 'each' ? prev : item.count;
    return Array<StitchName>(n).fill(item.stitch);
  });
}