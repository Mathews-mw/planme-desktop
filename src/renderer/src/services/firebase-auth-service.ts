import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut as firebaseSignOut,
	type User,
} from 'firebase/auth';

import { auth } from '../lib/firebase/firebase';
import { readonly } from 'zod';

interface IRegisterRequest {
	email: string;
	password: string;
}

type ISignInRequest = IRegisterRequest;

export class FirebaseAuthService {
	static async registerWithCredentials({ email, password }: IRegisterRequest): Promise<User> {
		const result = await createUserWithEmailAndPassword(auth, email, password);

		return result.user;
	}

	static async signInWithCredentials({ email, password }: ISignInRequest): Promise<User> {
		const result = await signInWithEmailAndPassword(auth, email, password);

		return result.user;
	}

	static async signOut(): Promise<void> {
		await firebaseSignOut(auth);
	}

	static async getToken() {
		const token = await auth.currentUser?.getIdToken();

		return token;
	}
}
