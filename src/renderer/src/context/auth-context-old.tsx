import { onAuthStateChanged } from 'firebase/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { type IUser } from '~/src/shared/types/user';
import { getUser } from '../_api/ipc-requests/get-user';
import { auth, authReady, initAuth } from '../lib/firebase/firebase';
import { FirebaseAuthService } from '../services/firebase-auth-service';

type AuthStatus = 'booting' | 'authenticated' | 'unauthenticated';

type AuthContext = {
	status: AuthStatus;
	user: IUser | null;
	// === actions ===
	signIn({ email, password }: { email: string; password: string }): Promise<void>;
	signOut(): Promise<void>;
	// === utils ===
	getIdToken(forceRefresh?: boolean): Promise<string | null>;
};

const AUTH_USER_KEY = ['auth', 'user'] as const;

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();

	const [user, setUser] = useState<IUser | null>(null);
	const [status, setStatus] = useState<AuthStatus>('booting');

	console.log('user context: ', user);

	const signInMutation = useMutation({
		mutationFn: async ({ email, password }: { email: string; password: string }) => {
			const result = await FirebaseAuthService.signInWithCredentials({ email, password });
			const appUser = await getUser(result.uid);
			return appUser;
		},
		onSuccess: (appUser) => {
			queryClient.setQueryData(AUTH_USER_KEY, appUser);
			setUser(appUser);
			setStatus('authenticated');
		},
	});

	const signOutMutation = useMutation({
		mutationFn: () => FirebaseAuthService.signOut(),
		onSuccess: () => {
			queryClient.setQueryData(AUTH_USER_KEY, null);
			setUser(null);
			setStatus('unauthenticated');
		},
	});

	// Bootstrap e sincronização: Firebase -> React Query/Context
	useEffect(() => {
		const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
			try {
				await initAuth();
				await authReady;

				if (!firebaseUser) {
					setUser(null);
					setStatus('unauthenticated');
					return;
				}

				setStatus('booting'); // Ou poderia ser "loadingUser" talvez...
				const appUser = await getUser(firebaseUser.uid);

				setUser(appUser);
				queryClient.setQueryData(AUTH_USER_KEY, appUser);
				setStatus('authenticated');
			} catch (e) {
				// fallback: se firebase tá logado mas não existe user local
				console.log('AuthProvider - error fetching app user: ', e);
				setUser(null);
				setStatus('unauthenticated');
			}
		});

		return () => unsub();
	}, [queryClient]);

	const value = useMemo<AuthContext>(
		() => ({
			status,
			user,
			async signIn({ email, password }: { email: string; password: string }) {
				await signInMutation.mutateAsync({ email, password });
			},
			async signOut() {
				await signOutMutation.mutateAsync();
			},
			async getIdToken(forceRefresh = false) {
				const current = auth.currentUser;
				if (!current) return null;
				return current.getIdToken(forceRefresh);
			},
		}),
		[status, user, signInMutation, signOutMutation]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);

	if (!ctx) {
		throw new Error('useAuth must be used within an AuthProvider');
	}

	return ctx;
}
