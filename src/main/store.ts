import Store from 'electron-store';

import { ITask } from '../shared/types/task';
import { IUser } from '../shared/types/user';

interface StoreType {
	users: Record<string, IUser>;
	tasks: Record<string, ITask>;
}

export const store = new Store<StoreType>({
	name: 'planme',
	defaults: {
		users: {},
		tasks: {},
	},
});

console.log('Store path: ', store.path);
