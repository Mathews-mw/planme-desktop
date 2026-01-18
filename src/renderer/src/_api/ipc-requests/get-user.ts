import { IUser } from '~/src/shared/types/user';
import { usersRepository } from '~/src/renderer/repositories/users-repository';

export async function getUser(uid: string): Promise<IUser> {
	const res = await usersRepository.get(uid);

	if (!res.success) {
		throw res.error;
	}

	return res.data;
}
