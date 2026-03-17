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
		EDIT: 'tasklist:edit',
		DELETE: 'tasklist:delete',
		COPY: 'tasklist:copy',
		GET_BY_SLUG: 'tasklist:get_by_slug',
		FETCH_ALL: 'tasklist:fetch_all',
	},
	TASKS: {
		FETCH_ALL: 'tasks:fetch_all',
		FETCH_ALL_CURSOR: 'tasks:fetch_all_cursor',
		GET: 'tasks:get',
		CREATE: 'tasks:create',
		RECREATE: 'tasks:recreate',
		UPDATE: 'tasks:update',
		DELETE: 'tasks:delete',
		TOGGLE_COMPLETE: 'tasks:toggle_complete',
		TOGGLE_FAVORITE: 'tasks:toggle_favorite',
	},
	OCCURRENCES: {
		FETCH_ALL: 'occurrences:fetch_all',
		FETCH_ALL_CURSOR: 'occurrences:fetch_all_cursor',
		GET_MANY_BY_TASK: 'occurrences:get_many_by_task',
	},
	SUBTASKS: {
		FETCH_ALL: 'subtasks:fetch_all',
		GET: 'subtasks:get',
		CREATE: 'subtasks:create',
		UPDATE: 'subtasks:update',
		DELETE: 'subtasks:delete',
		REORDER: 'subtasks:reorder',
		TOGGLE_COMPLETE: 'subtasks:toggle_complete',
	},
	NOTIFICATIONS: {
		SHOW: 'notifications:show',
		SYNC: 'notifications:sync',
		RELOAD: 'notifications:reload',
	},
} as const;
