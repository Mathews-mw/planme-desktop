import { IUser, IUserDetails } from '~/src/shared/types/user';
import { DrizzleAccount, DrizzleUser } from '../schema';
import { AccountMapper } from './account-mapper';

export class UserMapper {
	static toDomain(data: DrizzleUser): IUser {
		return {
			id: data.id,
			name: data.name,
			email: data.email,
			password: data.password,
			avatarUrl: data.avatarUrl,
			timezone: data.timezone,
			isActive: data.isActive,
			createdAt: new Date(data.createdAt),
			updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
		};
	}

	static toDrizzle(data: IUser): DrizzleUser {
		return {
			id: data.id,
			name: data.name,
			email: data.email,
			password: data.password ?? null,
			avatarUrl: data.avatarUrl ?? null,
			timezone: data.timezone,
			isActive: data.isActive,
			createdAt: data.createdAt.toISOString(),
			updatedAt: data.updatedAt ? data.updatedAt.toISOString() : null,
		};
	}
}

export class UserDetailsMapper {
	static toDomain(data: { user: DrizzleUser; accounts: DrizzleAccount[] }): IUserDetails {
		return {
			id: data.user.id,
			name: data.user.name,
			email: data.user.email,
			password: data.user.password,
			avatarUrl: data.user.avatarUrl,
			timezone: data.user.timezone,
			isActive: data.user.isActive,
			createdAt: new Date(data.user.createdAt),
			updatedAt: data.user.updatedAt ? new Date(data.user.updatedAt) : null,
			accounts: data.accounts.map(AccountMapper.toDomain),
		};
	}
}
