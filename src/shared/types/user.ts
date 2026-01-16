export type AccountProvider = 'CREDENTIALS' | 'GOOGLE' | 'GITHUB';

export interface IAccount {
	id: string;
	userId: string;
	provider: AccountProvider;
	providerAccountId: string;
	createdAt: string;
	updatedAt?: string | null;
}

export interface ISession {
	id: string;
	userId: string;
	sessionToken: string;
	expiresAt: string;
	registerAt: string;
}

export interface IUser {
	id: string;
	name: string;
	email: string;
	password?: string | null;
	avatarUrl?: string | null;
	timezone: string;
	isActive: boolean;
	createdAt: string;
	updatedAt?: string | null;
	accounts: IAccount[];
	session?: ISession | null;
}
