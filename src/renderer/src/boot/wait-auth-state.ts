import { onAuthStateChanged, type Auth, type User } from 'firebase/auth';

/**
 * Helper para aguardar o "primeiro auth state" uma única vez
 */
export function waitForInitialAuthState(auth: Auth): Promise<User | null> {
	return new Promise((resolve, reject) => {
		const unsub = onAuthStateChanged(
			auth,
			(user) => {
				unsub();
				resolve(user);
			},
			(err) => {
				unsub();
				reject(err);
			}
		);
	});
}
