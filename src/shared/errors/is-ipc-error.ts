import { IpcError } from '../types/ipc';

export function isIpcError(err: unknown): err is IpcError {
	if (!err || typeof err !== 'object') return false;

	const e = err as Record<string, unknown>;
	return typeof e.code === 'string' && typeof e.message === 'string';
}
