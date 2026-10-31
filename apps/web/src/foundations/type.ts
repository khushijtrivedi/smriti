export type Move =
  | ['hold']
  | ['yo']
  | ['catch']
  | ['insert']
  | ['pullUp']
  | ['through', number]
  | ['throughAll']
  | ['makeRing']
  | ['more', number]
  | ['close'];

export type HookPose = 'rest' | 'yo' | 'caught' | 'inserted' | 'insertedCaught' | 'pullingOut' | 'pulled' | 'off';
export type Focus = 'finger' | 'throat' | 'target' | 'loop';
export type Arrow = 'forward' | 'back' | 'down' | 'out';

export interface Lesson {
  slug: string;
  name: string;
  abbr: string;
  summary: string;
  row: boolean;
  ring?: boolean; // worked into a magic ring
  links: number;
  moves: Move[];
}

export interface LessonStep {
  text: string;
  loops: number;
  wrap: boolean;
  leg: boolean;
  done: boolean;
  chains: number;
  sliding: number;
  ringSts: number; // stitches worked into the magic ring
  closed: boolean; // magic ring pulled closed
  pose: HookPose;
  focus?: Focus;
  arrow?: Arrow;
  built: number;
}