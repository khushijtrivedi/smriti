import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { lessons } from '../foundations/lessons';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import LessonScene from '../foundations/LessonScene';

export default function Lesson() {
    const { slug } = useParams();
    const lesson = lessons.find((l) => l.slug === slug);
    const [step, setStep] = useState(0);

    if (!lesson) {
        return (
            <p className="text-center">
                Lesson not found.{' '}
                <Link to="/foundations" className="underline underline-offset-4">
                    All lessons
                </Link>
            </p>
        );
    }

    const last = lesson.steps.length - 1;

    return (
        <div className="mx-auto max-w-3xl">
            <Link to="/foundations" className="text-sm text-stone-500 dark:text-stone-400">
                ← Foundations
            </Link>
            <h1 className="mt-2 text-2xl font-medium">
                {lesson.name} <span className="text-stone-500 dark:text-stone-400">({lesson.abbr})</span>
            </h1>

            <div className="mt-6 aspect-video w-full overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800">
                <Canvas camera={{ position: [2.3, 0.9, 3.6], fov: 35 }}>
                    <hemisphereLight args={['#ffffff', '#b8a59a', 0.9]} />
                    <directionalLight position={[3, 4, 5]} intensity={1.1} />
                    {lesson.steps[step] && <LessonScene step={lesson.steps[step]} />}
                    <OrbitControls target={[1.8, -0.3, -0.2]} enablePan={false} minDistance={1.5} maxDistance={8} />
                </Canvas>
            </div>

            <p className="mt-6 text-sm text-stone-500 dark:text-stone-400">
                Step {step + 1} of {lesson.steps.length}
            </p>
            <p className="mt-1 text-lg">{lesson.steps[step]?.text}</p>

            <div className="mt-6 flex gap-3">
                <button
                    onClick={() => setStep((s) => Math.max(s - 1, 0))}
                    disabled={step === 0}
                    className="rounded-full border border-stone-300 px-5 py-2 disabled:opacity-40 dark:border-stone-700"
                >
                    Previous
                </button>
                <button
                    onClick={() => setStep((s) => Math.min(s + 1, last))}
                    disabled={step === last}
                    className="rounded-full bg-stone-800 px-5 py-2 text-stone-50 disabled:opacity-40 dark:bg-stone-100 dark:text-stone-900"
                >
                    Next
                </button>
            </div>
        </div>
    );
}