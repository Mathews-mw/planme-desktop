/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from './ui/button';
import { useBootManager } from '../context/boot-manager-context';

export function BootErrorScreen() {
	const { error, retry } = useBootManager();

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
			<div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
				<h1 className="text-lg font-semibold">Boot failed</h1>
				<p className="mt-2 text-sm text-white/70">{(error as any)?.message ?? 'Unexpected error'}</p>
				<div className="mt-6">
					<Button onClick={retry}>Try again</Button>
				</div>
			</div>
		</div>
	);
}
