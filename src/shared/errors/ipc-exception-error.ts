import { IpcError } from '../types/ipc';

export class IpcExceptionError extends Error {
	public code: string;
	public fieldErrors?: string;
	public details?: unknown;

	constructor(err: IpcError) {
		super(err.message);
		this.name = 'IpcRequestError';
		this.code = err.code;
		this.fieldErrors = err.fieldErrors;
		this.details = err.details;
	}
}
