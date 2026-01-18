/* eslint-disable @typescript-eslint/no-explicit-any */
import { type BootController } from './types';
import type { IUser } from '~/src/shared/types/user';
import { getUser } from '../_api/ipc-requests/get-user';
import { waitForInitialAuthState } from './wait-auth-state';
import { initAuth, authReady, auth } from '../lib/firebase/firebase';
import { withTimeout } from '~/src/utils/with-timeout';
import { authRepository } from '../../repositories/auth-repository';

type Commit = {
	commitAuthenticated: (appUser: IUser, meta?: { offline?: boolean }) => void;
	commitUnauthenticated: () => void;
};

function isRecoverableBootError(err: unknown) {
	const msg = (err as any)?.message?.toLowerCase?.() ?? '';
	return (
		msg.includes('csp') ||
		msg.includes('network') ||
		msg.includes('fetch') ||
		msg.includes('timeout') ||
		msg.includes('failed') ||
		msg.includes('refused to connect')
	);
}

export async function runAuthBoot(ctrl: BootController, commit: Commit) {
	ctrl.setMessage('Initializing…');
	ctrl.setProgress(0.05);

	try {
		ctrl.setMessage('Initializing Firebase…');
		ctrl.setProgress(0.15);

		await withTimeout(initAuth(), 4000, 'initAuth timeout');
		await withTimeout(authReady, 4000, 'authReady timeout');

		ctrl.setMessage('Checking session…');
		ctrl.setProgress(0.35);

		const firebaseUser = await withTimeout(waitForInitialAuthState(auth), 4000, 'auth state timeout');

		if (!firebaseUser) {
			commit.commitUnauthenticated();
			ctrl.setMessage('Not signed in');
			ctrl.setProgress(1);
			return;
		}

		ctrl.setMessage('Loading local profile…');
		ctrl.setProgress(0.6);

		const appUser = await getUser(firebaseUser.uid);

		// marca como último usuário ativo (offline fallback)
		await authRepository.setLastActiveUser({ uid: firebaseUser.uid });

		commit.commitAuthenticated(appUser, { offline: false });
		ctrl.setMessage('Welcome back');
		ctrl.setProgress(1);
	} catch (err) {
		if (!isRecoverableBootError(err)) {
			// erro “de verdade” (bug, schema, etc) → explode e mostra tela de erro
			throw err;
		}

		// === OFFLINE FALLBACK ===
		ctrl.setMessage('Offline mode: loading last user…');
		ctrl.setProgress(0.5);

		const last = await authRepository.getLastActiveUser();

		if (!last) {
			commit.commitUnauthenticated();
			ctrl.setMessage('Offline: no cached session');
			ctrl.setProgress(1);
			return;
		}

		if (!last.success) {
			throw last.error;
		}

		commit.commitAuthenticated(last.data!, { offline: true });

		ctrl.setMessage('Offline mode');
		ctrl.setProgress(1);
	}
}
