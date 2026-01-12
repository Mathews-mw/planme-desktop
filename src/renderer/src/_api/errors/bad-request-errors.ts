import z from 'zod';
import { ApiExceptionsError } from '../error-handler/api-exceptions-error';

const code = z
	.union([
		z.literal('BAD_REQUEST_ERROR'),
		z.literal('SAME_EMAIL_ERROR'),
		z.literal('SAME_USERNAME_ERROR'),
		z.literal('ROOM_ALREADY_EXISTS'),
		z.literal('OLD_PASSWORD_NOT_MATCH_ERROR'),
		z.literal('MISSING_FILES'),
		z.literal('INVALID_TRANSITION'),
	])
	.default('BAD_REQUEST_ERROR');

type Code = z.infer<typeof code>;

export class BadRequestError extends ApiExceptionsError {
	readonly code: Code;
	readonly status: number;

	constructor(message?: string, code?: Code, status?: number) {
		super(message ?? 'Bad Request Error'); // Passa a mensagem para a classe Error
		this.code = code ?? 'BAD_REQUEST_ERROR';
		this.name = 'BadRequestError'; // Define o nome do erro corretamente
		this.status = status ?? 400;

		// Corrige o prototype para manter a cadeia de herança correta
		Object.setPrototypeOf(this, BadRequestError.prototype);
	}
}
