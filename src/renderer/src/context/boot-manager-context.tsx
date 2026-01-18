import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type BootStatus = 'idle' | 'booting' | 'ready' | 'error';

type BootController = {
	setMessage: (msg: string) => void;
	setProgress: (value01: number) => void;
};

type BootContext = {
	status: BootStatus;
	progress: number; // 0..1
	message: string;
	error?: unknown;
	start: (runner: (ctrl: BootController) => Promise<void>) => void;
	retry: () => void;
};

const BootManagerContext = createContext<BootContext | null>(null);

export function BootManagerProvider({ children }: { children: ReactNode }) {
	const [status, setStatus] = useState<BootStatus>('idle');
	const [progress, setProgress] = useState(0);
	const [message, setMessage] = useState('Starting…');
	const [error, setError] = useState<unknown>(undefined);
	const [lastRunner, setLastRunner] = useState<null | ((ctrl: BootController) => Promise<void>)>(null);

	const ctrl = useMemo<BootController>(
		() => ({
			setMessage,
			setProgress: (v) => setProgress(Math.max(0, Math.min(1, v))),
		}),
		[]
	);

	const start = useCallback(
		(runner: (ctrl: BootController) => Promise<void>) => {
			setLastRunner(() => runner);
			setStatus('booting');
			setError(undefined);
			setProgress(0);
			setMessage('Starting…');

			runner(ctrl)
				.then(() => {
					setProgress(1);
					setMessage('Ready');
					setStatus('ready');
				})
				.catch((e) => {
					setError(e);
					setStatus('error');
				});
		},
		[ctrl]
	);

	const retry = useCallback(() => {
		if (lastRunner) start(lastRunner);
	}, [lastRunner, start]);

	const value = useMemo<BootContext>(
		() => ({ status, progress, message, error, start, retry }),
		[status, progress, message, error, start, retry]
	);

	return <BootManagerContext.Provider value={value}>{children}</BootManagerContext.Provider>;
}

export function useBootManager() {
	const ctx = useContext(BootManagerContext);

	if (!ctx) {
		throw new Error('useBootManager must be used within BootProvider');
	}

	return ctx;
}
