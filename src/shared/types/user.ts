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
}
