export const IPC = {
	AUTH: {
		GET_LAST_ACTIVE_USER: 'auth:get_last_active_user',
		SET_LAST_ACTIVE_USER: 'auth:set_last_active_user',
		CLEAR_LAST_ACTIVE_USER: 'auth:clear_last_active_user',
	},
	USERS: {
		CREATE: 'users:create',
		GET: 'users:get',
	},
	TASK_LIST: {
		CREATE: 'tasklist:create',
		FETCH_ALL: 'tasklist:fetch_all',
	},
	TASKS: {
		FETCH_ALL: 'tasks:fetch_all',
		GET: 'tasks:get',
		CREATE: 'tasks:create',
		UPDATE: 'tasks:update',
		DELETE: 'tasks:delete',
	},
	SUBTASKS: {
		FETCH_ALL: 'subtasks:fetch_all',
		GET: 'subtasks:get',
		CREATE: 'subtasks:create',
		UPDATE: 'subtasks:update',
		DELETE: 'subtasks:delete',
	},
};
