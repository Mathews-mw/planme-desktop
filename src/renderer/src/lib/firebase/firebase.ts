import { browserLocalPersistence, getAuth, onAuthStateChanged, setPersistence, User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

import { env } from '../../env';

const firebaseConfig = {
	apiKey: env.VITE_FIREBASE_API_KEY,
	authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

export async function initAuth() {
	// Persistência LOCAL: mantém logado ao reiniciar o app
	await setPersistence(auth, browserLocalPersistence);
}

// Uma Promise que resolve quando o Firebase terminar de restaurar a sessão.
export const authReady = new Promise<User | null>((resolve) => {
	const unsub = onAuthStateChanged(auth, (user) => {
		unsub();
		resolve(user);
	});
});
