import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';

import { auth } from '../lib/firebase/firebase';

interface IRegisterRequest {
	email: string;
	password: string;
}

type ISignInRequest = IRegisterRequest;

export async function registerWithCredentials({ email, password }: IRegisterRequest): Promise<User> {
	const result = await createUserWithEmailAndPassword(auth, email, password);

	return result.user;
}

export async function signInWithCredentials({ email, password }: ISignInRequest): Promise<User> {
	const result = await signInWithEmailAndPassword(auth, email, password);

	return result.user;
}

export async function signOutUser(): Promise<void> {
	await signOut(auth);
}
