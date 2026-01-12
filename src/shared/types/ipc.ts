// ===IPC Errors ===

export type IpcErrorCode =
	| "VALIDATION_ERROR"
	| "NOT_FOUND"
	| "CONFLICT"
	| "UNAUTHORIZED"
	| "FORBIDDEN"
	| "INTERNAL_ERROR";

export type IpcFieldErrors = Record<string, string[] | undefined>;

export type IpcError = {
	code: IpcErrorCode;
	message: string;
	fieldErrors?: IpcFieldErrors;
	details?: unknown;
};

// O segredo está aqui: success: true OU success: false
export type IpcResponse<T> =
	| { success: true; data: T; error?: never }
	| { success: false; error: IpcError; data?: never };

// ===Request===

import { ITask, ITaskPriority } from "./task";

export interface ICreateTaskRequest {
	title: string;
	description?: string | null;
	priority?: ITaskPriority;
	isStarred?: boolean;
	dateTime?: string | null;
}

export type ISaveTaskRequest = ITask;

// ===Response===

export interface ICreateTaskResponse {
	data: ITask;
}
