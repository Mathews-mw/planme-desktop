import { ICreateUserRequest } from '~/src/shared/types/ipc';

export const usersRepository = {
	get: (uid: string) => window.api.getUser({ id: uid }),
	create: (payload: ICreateUserRequest) => window.api.createUser(payload),
};
