import { DrizzleAccount } from '../schema';
import { IAccount } from '~/src/shared/types/user';

export class AccountMapper {
	static toDomain(data: DrizzleAccount): IAccount {
		return {
			id: data.id,
			userId: data.userId,
			provider: data.provider,
			providerAccountId: data.providerAccountId,
			createdAt: new Date(data.createdAt),
			updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
		};
	}

	static toDrizzle(data: IAccount): DrizzleAccount {
		return {
			id: data.id,
			userId: data.userId,
			provider: data.provider,
			providerAccountId: data.providerAccountId,
			createdAt: data.createdAt.toISOString(),
			updatedAt: data.updatedAt ? data.updatedAt.toISOString() : null,
		};
	}
}
