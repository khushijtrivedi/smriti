import type { HookPose, Lesson, LessonStep } from './type';

const PULLS = ['pullUp', 'through', 'throughAll'];

export function buildSteps(lesson: Lesson): LessonStep[] {
  const s = { loops: 1, wrap: false, leg: false, done: false, chains: 0, sliding: 0, pose: 'rest' as HookPose };
  let inserted = false;

  const steps: LessonStep[] = [
    {
      ...s,
      text: lesson.row ? 'One loop on the hook, and a row to work into.' : 'Start with a slip knot on the hook.',
      focus: 'loop',
    },
  ];

  lesson.moves.forEach((move, idx) => {
    const next = lesson.moves[idx + 1];

    switch (move[0]) {
      case 'hold':
        steps.push({ ...s, text: 'Hold the yarn over your finger, behind the hook.', focus: 'finger' });
        break;

      case 'yo':
        s.loops += 1;
        s.wrap = true;
        s.pose = inserted ? 'inserted' : 'yo';
        steps.push({
          ...s,
          text: inserted ? 'Yarn over, behind the stitch.' : 'Yarn over: move the hook forward, under the yarn.',
          focus: 'throat',
          arrow: inserted ? undefined : 'forward',
        });
        // In row stitches, a yarn over that's about to be pulled through gets its own catch step
        if (lesson.row && next && PULLS.includes(next[0])) {
          s.pose = inserted ? 'insertedCaught' : 'caught';
          steps.push({ ...s, text: 'Turn the hook down so the throat catches the yarn.', focus: 'throat' });
        }
        break;

      case 'catch':
        s.pose = 'caught';
        steps.push({ ...s, text: 'Turn the hook down so the throat catches the yarn.', focus: 'throat' });
        break;

      case 'insert':
        inserted = true;
        s.wrap = false;
        s.pose = 'inserted';
        steps.push({
          ...s,
          text: s.loops > 1 ? 'Insert the hook into the next stitch, keeping the yarn overs on.' : 'Insert the hook into the next stitch.',
          focus: 'target',
          arrow: 'down',
        });
        break;

      case 'pullUp':
        // 1. Caught yarn comes back out through the stitch
        steps.push({ ...s, pose: 'pullingOut', text: 'Pull the caught yarn back through the stitch.', focus: 'target', arrow: 'out' });
        // 2. The new loop sits on the hook, still joined to the stitch
        inserted = false;
        s.wrap = false;
        s.leg = true;
        s.pose = 'rest';
        steps.push({ ...s, text: `Bring the loop up onto the hook. ${s.loops} loops on the hook.`, focus: 'loop' });
        break;

      case 'through': {
        const n = move[1];
        // 1. Pull back: the loops slide up to the tip, caught yarn goes through them
        steps.push({
          ...s,
          sliding: n,
          pose: 'pulled',
          text: lesson.row
            ? `Pull the hook back through ${n === 1 ? 'the loop' : `${n} loops`}.`
            : 'Pull the hook back. The caught yarn comes through the loop.',
          focus: 'throat',
          arrow: 'back',
        });
        // 2. The hook keeps going back, out of them
        s.loops -= n;
        s.wrap = false;
        s.pose = 'off';
        if (!lesson.row) s.chains += 1;
        const finished = s.loops === 1;
        if (finished && lesson.row) {
          s.done = true;
          s.leg = false;
        }
        steps.push({
          ...s,
          text: lesson.row
            ? `${n === 1 ? 'It slides' : 'They slide'} off. ${s.loops} left on the hook.${finished ? ' Stitch done.' : ''}`
            : `The old loop slides off. ${s.chains} chain${s.chains > 1 ? 's' : ''} done.`,
          focus: 'loop',
        });
        break;
      }

      case 'throughAll':
        // 1. Through the stitch
        steps.push({ ...s, pose: 'pullingOut', text: 'Pull the caught yarn back through the stitch...', focus: 'target', arrow: 'out' });
        // 2. ...and straight on through the loop on the hook
        inserted = false;
        steps.push({ ...s, sliding: 1, pose: 'pulled', text: '...and straight on through the loop on the hook.', focus: 'throat', arrow: 'back' });
        // 3. The loop slides off
        s.loops = 1;
        s.wrap = false;
        s.leg = false;
        s.done = true;
        s.pose = 'off';
        steps.push({ ...s, text: 'The loop slides off. Slip stitch done.', focus: 'loop' });
        break;
    }
  });

  return steps;
}