import z, { ZodError } from 'zod';
import { IpcFieldErrors } from '../types/ipc';

export function zodErrorHandler(err: unknown): IpcFieldErrors {
	if (err instanceof ZodError) {
		const zodError = z.flattenError(err);
		console.log('zod error: ', zodError);

		return zodError.fieldErrors;
	}

	return { fieldErrors: undefined };
}
