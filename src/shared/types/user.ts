export type AccountProvider = 'CREDENTIALS' | 'GOOGLE' | 'GITHUB';

export interface IAccount {
	id: string;
	userId: string;
	provider: AccountProvider;
	providerAccountId: string;
	createdAt: Date;
	updatedAt?: Date | null;
}

export interface ISession {
	id: string;
	userId: string;
	sessionToken: string;
	expiresAt: Date;
	registerAt: Date;
}

export interface IUser {
	id: string;
	name: string;
	email: string;
	password?: string | null;
	avatarUrl?: string | null;
	timezone: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt?: Date | null;
}

export interface IUserDetails extends IUser {
	accounts: IAccount[];
}
