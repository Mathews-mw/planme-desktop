import { ITask } from './task';
import { ITaskPriority } from './task-definition';
import { IRecurrenceEndType, IRecurrenceFrequency } from './recurrence-rule';
import { ITaskStatus } from './task-occurrence';

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

export type IpcSuccess<T> = { success: true; data: T };
export type IpcFail = { success: false; error: IpcError };

export type IpcResponse<T> = IpcSuccess<T> | IpcFail;

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
	id?: string;
	title?: string;
	icon?: string;
	position?: number;
}

export interface ITaskQuery {
	search?: string;
	status?: ITaskStatus;
}

export interface IOccurrencesQuery {
	search?: string;
	status?: ITaskStatus;
	orderBy?: 'latest' | 'oldest' | 'recently_updated' | 'recently_completed';
}

export interface ICreateTaskRequest {
	definition: {
		userId?: string;
		listSlug: string;
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

export interface IToggleTaskComplete {
	occurrenceId: string;
	taskDefinitionId: string;
}

export type ISaveTaskRequest = ITask;

// ===Response===

export interface ICreateUserResponse {
	id: string;
}

export interface ICreateTaskResponse {
	data: ITask;
}
