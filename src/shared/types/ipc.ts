import { ITask } from './task';
import { ITaskOccurrenceDetails, ITaskStatus } from './task-occurrence';
import { ITaskDefinition, ITaskPriority } from './task-definition';
import { IRecurrenceEndType, IRecurrenceFrequency } from './recurrence-rule';

// ===IPC Errors ===

export type IpcErrorCode =
	| 'VALIDATION_ERROR'
	| 'BAD_REQUEST_ERROR'
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
	overdueDateOnly?: boolean;
}

export interface ITaskCursorBasedQuery {
	cursor?: string;
	limit: number;
	search?: string;
}

export interface IOccurrencesQuery {
	search?: string;
	status?: ITaskStatus;
	listSlug?: string;
	includeAllLists?: boolean;
	orderBy?: 'latest' | 'oldest' | 'recently_updated' | 'recently_completed';
}

export interface IOccurrencesCursorBasedQuery {
	cursor?: string;
	limit: number;
	search?: string;
}

export interface IOccurrencesByTaskQuery {
	taskDefinitionId: string;
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

export interface IUpdateTaskRequest {
	taskDefinitionId: string;
	listSlug?: string;
	title?: string;
	description?: string | null;
	priority?: ITaskPriority;
	deadline?: Date | null;
	recurrenceRule?: {
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

export interface IRecreateTaskRequest {
	task: ITask;
}

export type ISaveTaskRequest = ITask;

export interface IToggleTaskComplete {
	occurrenceId: string;
	taskDefinitionId: string;
}

export interface IToggleTaskFavorite {
	taskDefinitionId: string;
}

export interface IDeleteTaskRequest {
	taskDefinitionId: string;
}

export interface ICreateSubtaskRequest {
	taskDefinitionId: string;
	title: string;
	description?: string | null;
	position?: number;
}

export interface IUpdateSubtaskRequest {
	subtaskId: string;
	title?: string;
	description?: string | null;
}

export interface IDeleteSubtaskRequest {
	subtaskId: string;
}

export interface IToggleCompleteSubtaskRequest {
	subtaskId: string;
}

export interface IReorderSubtasksRequest {
	taskDefinitionId: string;
	orderedSubtaskIds: Array<string>;
}

export interface IListingSubtasksQuery {
	taskDefinitionId: string;
}

// ===Response===

export interface ICreateUserResponse {
	id: string;
}

export interface ICreateTaskResponse {
	data: ITask;
}

export interface ITaskCursorBasedResponse {
	nextCursor?: string;
	previousCursor?: string;
	hasMore: boolean;
	tasks: Array<ITaskDefinition>;
}

export interface IOccurrencesCursorBasedResponse {
	nextCursor?: string;
	previousCursor?: string;
	hasMore: boolean;
	occurrences: Array<ITaskOccurrenceDetails>;
}
