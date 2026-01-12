import z from 'zod';
import { ApiExceptionsError } from '../error-handler/api-exceptions-error';

const code = z.union([z.literal('INTERNAL_SERVER_ERROR')]).default('INTERNAL_SERVER_ERROR');

type Code = z.infer<typeof code>;

export class InternalServerError extends ApiExceptionsError {
	readonly code: Code;
	readonly status: number;

	constructor(message?: string, code?: Code, status?: number) {
		super(message ?? 'Internal Server Error'); // Passa a mensagem para a classe Error
		this.code = code ?? 'INTERNAL_SERVER_ERROR';
		this.name = 'InternalServerError'; // Define o nome do erro corretamente
		this.status = status ?? 500;

		// Corrige o prototype para manter a cadeia de herança correta
		Object.setPrototypeOf(this, InternalServerError.prototype);
	}
}
