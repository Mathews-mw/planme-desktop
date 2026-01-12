export class ApiExceptionsError extends Error {
	readonly code: string;
	readonly status: number;
	readonly __brand = 'ApiExceptionsError'; // duck-typing

	constructor(message?: string, code?: string, status?: number) {
		super(message ?? 'An error occurred while trying to process the request!');

		this.name = 'ApiExceptionsError';
		this.code = code ?? 'REQUEST_ERROR';
		this.status = status ?? 400;

		Object.setPrototypeOf(this, new.target.prototype);
	}
}
