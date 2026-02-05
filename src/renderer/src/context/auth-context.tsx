import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { auth } from '../lib/firebase/firebase';
import { type IUser } from '~/src/shared/types/user';
import { getUser } from '../_api/ipc-requests/get-user';
import { FirebaseAuthService } from '../services/firebase-auth-service';

type AuthStatus = 'authenticated' | 'unauthenticated' | 'authenticated_offline';

type AuthContext = {
	status: AuthStatus;
	user: IUser | null;
	// === actions ===
	signIn({ email, password }: { email: string; password: string }): Promise<void>;
	signOut(): Promise<void>;
	getIdToken(forceRefresh?: boolean): Promise<string | null>;
	// === Boot commits ===
	_commitAuthenticated(user: IUser, meta?: { offline?: boolean }): void;
	_commitUnauthenticated(): void;
};

const AUTH_USER_KEY = ['auth', 'user'] as const;

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();

	const [user, setUser] = useState<IUser | null>(null);
	const [status, setStatus] = useState<AuthStatus>('unauthenticated');

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

	const value = useMemo<AuthContext>(
		() => ({
			status,
			user,
			async signIn({ email, password }) {
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
			_commitAuthenticated(appUser: IUser, meta?: { offline?: boolean }) {
				queryClient.setQueryData(AUTH_USER_KEY, appUser);
				setUser(appUser);
				setStatus(meta?.offline ? 'authenticated_offline' : 'authenticated');
			},
			_commitUnauthenticated() {
				queryClient.setQueryData(AUTH_USER_KEY, null);
				setUser(null);
				setStatus('unauthenticated');
			},
		}),
		[status, user, signInMutation, signOutMutation, queryClient]
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
