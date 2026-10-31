import type { Lesson, YarnPoint } from './type';

// Fixed points: the yarn ball (behind, below) and the top of your finger
const ball: YarnPoint = { on: 'world', p: [3.9, -2.4, -2.8] };
const finger: YarnPoint = { on: 'world', p: [3.0, 1.06, -0.7] };

const world = (x: number, y: number, z: number): YarnPoint => ({ on: 'world', p: [x, y, z] });
const onHook = (x: number, y: number, z: number): YarnPoint => ({ on: 'hook', p: [x, y, z] });
const loop = (x: number, on: YarnPoint['on'] = 'hook'): YarnPoint[] => [
    { on, p: [x, -0.2, 0] },
    { on, p: [x, 0, 0.2] },
    { on, p: [x, 0.2, 0] },
    { on, p: [x, 0, -0.2] },
];

export const lessons: Lesson[] = [
    {
        slug: 'chain',
        name: 'Chain',
        abbr: 'ch',
        summary: 'The base of most crochet. A row of loops, each pulled through the one before.',
        steps: [
            {
                text: 'Start with a slip knot on the hook.',
                hook: { x: 0, y: 0, roll: 0 },
                yarn: [ball, finger, world(2.2, 0.35, -0.55), onHook(1.3, -0.18, -0.12), ...loop(1.2), world(1.25, -0.8, 0.1), world(1.25, -1.5, 0.1)],
                chains: { count: 0, x: 1.25 },
                focus: [1.2, 0, 0],
            },
            {
                text: 'Hold the yarn over your finger, behind the hook.',
                hook: { x: 0, y: 0, roll: 0 },
                yarn: [ball, finger, world(2.2, 0.35, -0.55), onHook(1.3, -0.18, -0.12), ...loop(1.2), world(1.25, -0.8, 0.1), world(1.25, -1.5, 0.1)],
                chains: { count: 0, x: 1.25 },
                focus: [3.0, 0.95, -0.7],
            },
            {
                text: 'Yarn over: move the hook forward, under the yarn.',
                hook: { x: 0.35, y: 0.12, roll: 0 },
                yarn: [ball, finger, onHook(1.95, 0.14, -0.08), onHook(1.95, -0.02, 0.13), ...loop(1.2), world(1.6, -0.8, 0.1), world(1.6, -1.5, 0.1)],
                chains: { count: 0, x: 1.6 },
                focus: [2.3, 0.18, 0],
                arrow: { from: [1.85, -0.35, 0.3], to: [2.35, -0.2, 0.3] },
            },
            {
                text: 'Turn the hook so the throat catches the yarn.',
                hook: { x: 0.35, y: 0.12, roll: -0.6 },
                yarn: [ball, finger, onHook(1.95, 0.14, -0.08), onHook(1.95, -0.02, 0.13), ...loop(1.2), world(1.6, -0.8, 0.1), world(1.6, -1.5, 0.1)],
                chains: { count: 0, x: 1.6 },
                focus: [2.3, 0.12, 0],
            },
            {
                text: 'Pull the hook back. The caught yarn comes through the loop.',
                hook: { x: -0.45, y: 0, roll: 0 },
                yarn: [ball, finger, onHook(1.95, 0.14, -0.08), onHook(1.95, -0.02, 0.13), ...loop(1.55, 'world'), world(1.6, -0.8, 0.1), world(1.6, -1.5, 0.1)],
                chains: { count: 0, x: 1.6 },
                focus: [1.55, 0, 0],
                arrow: { from: [2.3, -0.5, 0.35], to: [1.6, -0.5, 0.35] },
            },
            {
                text: 'The old loop slides off. That is one chain.',
                hook: { x: -0.45, y: 0, roll: 0 },
                yarn: [ball, finger, world(2.1, 0.3, -0.5), onHook(1.5, -0.18, -0.1), ...loop(1.6), world(1.15, -0.42, 0.03), world(1.15, -0.47, 0.03)],
                chains: { count: 1, x: 1.15 },
                focus: [1.15, -0.62, 0],
            },
            {
                text: 'Do it again: yarn over, catch, pull through. Each time adds one chain. Now you have 2.',
                hook: { x: 0, y: 0, roll: 0 },
                yarn: [ball, finger, world(2.2, 0.35, -0.55), onHook(1.3, -0.18, -0.12), ...loop(1.2), world(1.2, -0.42, 0.03), world(1.2, -0.47, 0.03)],
                chains: { count: 2, x: 1.2 },
                focus: [1.2, -0.8, 0],
            },
        ],
    },
];