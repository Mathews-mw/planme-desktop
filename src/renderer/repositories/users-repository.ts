import { ICreateUserRequest } from '~/src/shared/types/ipc';

export const usersRepository = {
	create: (payload: ICreateUserRequest) => window.api.createUser(payload),
};
