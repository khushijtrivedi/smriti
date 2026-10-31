import type { HookPose, Lesson, LessonStep } from './type';

const PULLS = ['pullUp', 'through', 'throughAll'];

export function buildSteps(lesson: Lesson): LessonStep[] {
  const into = lesson.row || !!lesson.ring; // worked into a stitch or the ring
  const s = {
    loops: lesson.ring ? 0 : 1,
    wrap: false,
    leg: false,
    done: false,
    chains: 0,
    sliding: 0,
    ringSts: 0,
    built: 0,
    closed: false,
    pose: 'rest' as HookPose,
  };
  let inserted = false;
  // The stitch grows a little with each pull-through
  const totalPulls = lesson.moves.filter((m) => m[0] === 'through' || m[0] === 'throughAll').length;
  let pullsDone = 0;
  const steps: LessonStep[] = [
    {
      ...s,
      text: lesson.ring
        ? 'A magic ring starts with no loop on the hook.'
        : lesson.row
          ? 'One loop on the hook, and a row to work into.'
          : 'Start with a slip knot on the hook.',
      focus: lesson.ring ? 'finger' : 'loop',
    },
  ];

  lesson.moves.forEach((move, idx) => {
    const next = lesson.moves[idx + 1];

    switch (move[0]) {
      case 'hold':
        steps.push({ ...s, text: 'Hold the yarn over your finger, behind the hook.', focus: 'finger' });
        break;

      case 'makeRing':
        steps.push({ ...s, text: 'Wrap the yarn into a ring, crossing the tail over the working yarn.', focus: 'target' });
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
        // A yarn over that's about to be pulled through gets its own catch step
        if (into && next && PULLS.includes(next[0])) {
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
          text: lesson.ring
            ? 'Insert the hook into the middle of the ring.'
            : s.loops > 1
              ? 'Insert the hook into the next stitch, keeping the yarn overs on.'
              : 'Insert the hook into the next stitch.',
          focus: 'target',
          arrow: 'down',
        });
        break;

      case 'pullUp':
        steps.push({
          ...s,
          pose: 'pullingOut',
          text: lesson.ring ? 'Pull the caught yarn back through the ring.' : 'Pull the caught yarn back through the stitch.',
          focus: 'target',
          arrow: 'out',
        });
        inserted = false;
        s.wrap = false;
        s.leg = true;
        s.pose = 'rest';
        steps.push({
          ...s,
          text: `Bring the loop up onto the hook. ${s.loops} loop${s.loops > 1 ? 's' : ''} on the hook.`,
          focus: 'loop',
        });
        break;

      case 'through': {
        const n = move[1];
        steps.push({
          ...s,
          sliding: n,
          pose: 'pulled',
          text: into
            ? `Pull the hook back through ${n === 1 ? 'the loop' : `${n} loops`}.`
            : 'Pull the hook back. The caught yarn comes through the loop.',
          focus: 'throat',
          arrow: 'back',
        });
        s.loops -= n;
        s.wrap = false;
        s.pose = 'off';

        if (lesson.ring) {
          s.leg = false;
          if (n >= 2) s.ringSts += 1;
          steps.push({
            ...s,
            text: n === 1 ? 'It slides off. That is a chain 1.' : `They slide off. ${s.ringSts} single crochet in the ring.`,
            focus: 'loop',
          });
          break;
        }

        if (!into) s.chains += 1;
                if (lesson.row) {
          pullsDone += 1;
          s.built = Math.round((lesson.links * pullsDone) / totalPulls);
        }
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
        steps.push({ ...s, pose: 'pullingOut', text: 'Pull the caught yarn back through the stitch...', focus: 'target', arrow: 'out' });
        inserted = false;
        steps.push({ ...s, sliding: 1, pose: 'pulled', text: '...and straight on through the loop on the hook.', focus: 'throat', arrow: 'back' });
        s.loops = 1;
        s.wrap = false;
        s.leg = false;
        s.done = true;
                s.built = lesson.links;
        s.pose = 'off';
        steps.push({ ...s, text: 'The loop slides off. Slip stitch done.', focus: 'loop' });
        break;

      case 'more':
        s.ringSts += move[1];
        steps.push({ ...s, text: `Work ${move[1]} more single crochets into the ring. ${s.ringSts} in total.`, focus: 'target' });
        break;

      case 'close':
        s.closed = true;
        steps.push({ ...s, text: 'Pull the tail to close the ring tight. Round 1 done.', focus: 'target' });
        break;
    }
  });

  return steps;
}