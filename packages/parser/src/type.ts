export type StitchName = 'sc' | 'hdc' | 'dc' | 'inc' | 'dec' | 'ch' | 'slst';
export type Place = 'magic-ring' | 'each' | null;

export interface StitchItem {
  kind: 'stitch';
  stitch: StitchName;
  count: number;
  place: Place;
}

export interface RepeatItem {
  kind: 'repeat';
  items: Item[];
  times: number;
}

export type Item = StitchItem | RepeatItem;

export interface Round {
  number: number;
  items: Item[];
  count: number | null;
  line: number;
}

export interface RoundCheck {
  number: number;
  line: number;
  actual: number;
  expected: number | null;
  ok: boolean;
}