export function isFirebaseError(err: unknown): err is { code: string; message: string } {
	return typeof err === 'object' && err !== null && 'code' in err && typeof (err as any).code === 'string';
}
