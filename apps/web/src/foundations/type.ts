export type Move =
  | ['hold']
  | ['yo']
  | ['catch']
  | ['insert']
  | ['pullUp']
  | ['through', number]
  | ['throughAll'];

export type HookPose = 'rest' | 'yo' | 'caught' | 'inserted' | 'insertedCaught' | 'pullingOut' | 'pulled' | 'off';
export type Focus = 'finger' | 'throat' | 'target' | 'loop';
export type Arrow = 'forward' | 'back' | 'down' | 'out';

export interface Lesson {
  slug: string;
  name: string;
  abbr: string;
  summary: string;
  row: boolean;
  postHeight: number;
  moves: Move[];
}

export interface LessonStep {
  text: string;
  loops: number;
  wrap: boolean;
  leg: boolean;
  done: boolean;
  chains: number;
  pose: HookPose;
  focus?: Focus;
  arrow?: Arrow;
   sliding: number; 
}