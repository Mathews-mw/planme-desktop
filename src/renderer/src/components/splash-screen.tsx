import { useEffect, useMemo, useState } from 'react';

import { IconSparkles } from '@tabler/icons-react';
import logo from '~/src/renderer/src/assets/logo.png';
import { useBootManager } from '../context/boot-manager-context';

type BootStep = {
	label: string;
	weight: number; // para calcular progresso
};

const steps: BootStep[] = [
	{ label: 'Starting app…', weight: 8 },
	{ label: 'Loading authentication…', weight: 20 },
	{ label: 'Restoring session…', weight: 18 },
	{ label: 'Loading local cache…', weight: 22 },
	{ label: 'Preparing UI…', weight: 18 },
	{ label: 'Almost there…', weight: 14 },
];

function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(max, n));
}

export function SplashScreen() {
	const { progress, message } = useBootManager();

	const total = useMemo(() => steps.reduce((acc, s) => acc + s.weight, 0), []);
	const [stepIndex, setStepIndex] = useState(0);
	// const [progress, setProgress] = useState(0);

	// Progresso fake só para UX.
	// Futuramente trocar para progresso real usando um estado do boot manager.
	// useEffect(() => {
	// 	let raf = 0;
	// 	let start = performance.now();

	// 	const tick = (now: number) => {
	// 		const elapsed = now - start;

	// 		// Avança aos poucos, com easing
	// 		const targetBase = steps.slice(0, stepIndex + 1).reduce((acc, s) => acc + s.weight, 0);

	// 		const withinStep = clamp(elapsed / 900, 0, 1); // ~0.9s por step
	// 		const target = targetBase - steps[stepIndex]?.weight * (1 - withinStep);

	// 		const next = clamp((target / total) * 100, 2, 96);
	// 		setProgress(next);

	// 		if (withinStep >= 1) {
	// 			start = performance.now();
	// 			setStepIndex((i) => (i < steps.length - 1 ? i + 1 : i));
	// 		}

	// 		raf = requestAnimationFrame(tick);
	// 	};

	// 	raf = requestAnimationFrame(tick);

	// 	return () => cancelAnimationFrame(raf);
	// }, [stepIndex, total]);

	const currentLabel = steps[stepIndex]?.label ?? 'Loading…';

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 text-white">
			{/* Background grid */}
			<div className="pointer-events-none absolute inset-0 opacity-[0.08]">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[48px_48px]" />
			</div>

			{/* Gradient blobs */}
			<div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-fuchsia-500/30 blur-3xl" />
			<div className="pointer-events-none absolute top-24 -right-24 h-96 w-96 rounded-full bg-sky-500/25 blur-3xl" />
			<div className="pointer-events-none absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />

			{/* Card */}
			<div className="relative mx-6 w-full max-w-xl">
				<div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
					{/* Top */}
					<div className="flex items-center gap-3">
						<div className="relative">
							{/* Glow */}
							<div className="absolute -inset-2 rounded-2xl bg-linear-to-r from-fuchsia-500/40 to-sky-500/40 blur-xl" />
							<div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
								<img src={logo} alt="Plan Me" className="object-cover" />
							</div>
						</div>

						<div className="flex flex-col">
							<span className="text-sm font-medium text-primary">Plan Me</span>
							<h1 className="text-xl font-semibold tracking-tight">Getting things ready</h1>
						</div>
					</div>

					{/* Message */}
					<div className="mt-6 space-y-3">
						<p className="text-sm text-white/70">{message}</p>

						{/* Progress bar */}
						<div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
							<div
								className="h-full rounded-full bg-linear-to-r from-fuchsia-500 to-sky-500 transition-[width] duration-200"
								style={{ width: `${progress}%` }}
							/>
						</div>

						<div className="flex items-center justify-between text-xs text-white/50">
							<span>Initializing</span>
							<span>{Math.floor(progress)}%</span>
						</div>
					</div>

					{/* Bottom hints */}
					<div className="mt-8 grid grid-cols-2 gap-3">
						<div className="rounded-xl border border-white/10 bg-white/5 p-3">
							<p className="text-xs text-white/60">Offline-first</p>
							<p className="mt-1 text-sm font-medium">Local cache ready</p>
						</div>
						<div className="rounded-xl border border-white/10 bg-white/5 p-3">
							<p className="text-xs text-white/60">Secure</p>
							<p className="mt-1 text-sm font-medium">Encrypted session</p>
						</div>
					</div>

					{/* Tiny footer */}
					<div className="mt-8 flex items-center justify-between text-xs text-white/40">
						<span className="flex items-center gap-2">
							<span className="relative inline-flex h-2 w-2">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50" />
								<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
							</span>
							System check
						</span>
						<span className="tabular-nums">v0.1</span>
					</div>
				</div>
			</div>
		</div>
	);
}
