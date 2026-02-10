import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';

import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { router } from './routes';
import { queryClient } from './lib/query-client';
import { Toaster } from './components/ui/sonner';
import { runAuthBoot } from './boot/run-auth-boot';
import { SplashScreen } from './components/splash-screen';
import { ThemeProvider } from '~/src/renderer/src/providers/theme-provider';
import { AuthProvider, useAuth } from './context/auth-context';
import { BootErrorScreen } from './components/boot-error-screen';
import { BootManagerProvider, useBootManager } from './context/boot-manager-context';

dayjs.extend(utc);
dayjs.extend(relativeTime);

function BootGate({ children }: { children: React.ReactNode }) {
	const boot = useBootManager();
	const authCtx = useAuth();

	useEffect(() => {
		if (boot.status !== 'idle') return;

		boot.start((ctrl) =>
			runAuthBoot(ctrl, {
				commitAuthenticated: authCtx._commitAuthenticated,
				commitUnauthenticated: authCtx._commitUnauthenticated,
			})
		);
	}, [boot, authCtx]);

	if (boot.status === 'booting' || boot.status === 'idle') return <SplashScreen />;
	if (boot.status === 'error') return <BootErrorScreen />;

	return <>{children}</>;
}

export function App(): React.JSX.Element {
	return (
		<ThemeProvider defaultTheme="light" storageKey="planme-ui-theme">
			<QueryClientProvider client={queryClient}>
				<BootManagerProvider>
					<AuthProvider>
						<BootGate>
							<RouterProvider router={router} />
						</BootGate>
					</AuthProvider>
				</BootManagerProvider>

				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>

			<Toaster duration={8 * 1000} />
		</ThemeProvider>
	);
}
