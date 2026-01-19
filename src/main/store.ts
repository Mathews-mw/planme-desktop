import Store from 'electron-store';

import { ITask, ITaskList } from '../shared/types/task';
import { IUser } from '../shared/types/user';

interface StoreType {
	auth: {
		lastActiveUserId?: string;
		lastLoginAt?: string;
	};
	users: Record<string, IUser>;
	tasks: Record<string, ITask>;
	taskList: Record<string, ITaskList>;
}

export const store = new Store<StoreType>({
	name: 'planme',
	defaults: {
		auth: {},
		users: {},
		taskList: {
			'426c99dd-42ff-4249-900c-8dde62f9a6a0': {
				id: '426c99dd-42ff-4249-900c-8dde62f9a6a0',
				title: 'Tasks',
				position: 1,
			},
		},
		tasks: {},
	},
});

console.log('Store path: ', store.path);
