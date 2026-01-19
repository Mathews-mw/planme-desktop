import { ITask } from './task';
import { ITaskPriority } from './task-definition';
import { IRecurrenceEndType, IRecurrenceFrequency } from './recurrence-rule';

// ===IPC Errors ===

export type IpcErrorCode =
	| 'VALIDATION_ERROR'
	| 'NOT_FOUND'
	| 'CONFLICT'
	| 'UNAUTHORIZED'
	| 'FORBIDDEN'
	| 'INTERNAL_ERROR';

export type IpcFieldErrors = Record<string, string[] | undefined>;

export type IpcError = {
	code: IpcErrorCode;
	message: string;
	fieldErrors?: IpcFieldErrors;
	details?: unknown;
};

export type IpcResponse<T> =
	| { success: true; data: T; error?: never }
	| { success: false; error: IpcError; data?: never };

// ===Request===

export interface IGetUserRequest {
	id: string;
}

export interface ICreateUserRequest {
	id?: string;
	providerAccountId?: string;
	name: string;
	email: string;
	password: string;
}

export interface ISaveTaskListRequest {
	title?: string;
	icon?: string;
	position?: number;
}

export interface ICreateTaskRequest {
	definition: {
		userId?: string;
		listId: string;
		title: string;
		description?: string | null;
		priority?: ITaskPriority;
		deadline?: Date | null;
	};
	recurrenceRule: {
		frequency?: IRecurrenceFrequency;
		endType?: IRecurrenceEndType;
		startDateTime?: Date | null;
		endDate?: Date | null;
		interval?: number | null;
		weekdays?: Array<number> | null;
		dayOfMonth?: number | null;
		maxOccurrences?: number | null;
	};
}

export type ISaveTaskRequest = ITask;

// ===Response===

export interface ICreateUserResponse {
	id: string;
}

export interface ICreateTaskResponse {
	data: ITask;
}
