export type Vec3 = [number, number, number];

// A point on the yarn: either fixed in space, or riding on the hook
export interface YarnPoint {
  on: 'world' | 'hook';
  p: Vec3;
}

export interface LessonStep {
  text: string;
  hook: { x: number; y: number; roll: number };
  yarn: YarnPoint[];
  chains: { count: number; x: number };
  focus?: Vec3; // where to look in this step
  arrow?: { from: Vec3; to: Vec3 }; // which way the hook moves
}

export interface Lesson {
  slug: string;
  name: string;
  abbr: string;
  summary: string;
  steps: LessonStep[];
}