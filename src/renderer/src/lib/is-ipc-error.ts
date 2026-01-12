/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IpcError } from "~/src/shared/types/ipc";

/**
 * Extract the IpcError from an Error thrown by ipcRenderer.invoke().
 * When ipcMain.handle() throws, Electron wraps it in an Error with the original in error.cause.
 */
export function extractIpcError(err: any): IpcError | null {
	console.log("extractIpcError raw error:", err);

	// Check if it's directly an IpcError
	if (isIpcError(err)) {
		return err;
	}

	// Check if it's an Error with cause containing IpcError (Electron wrapping)
	if (err instanceof Error && err.cause && isIpcError(err.cause)) {
		return err.cause;
	}

	return null;
}

/**
 * Type guard to check if an object is an IpcError.
 */
function isIpcError(obj: any): obj is IpcError {
	return (
		typeof obj === "object" &&
		obj !== null &&
		typeof obj?.code === "string" &&
		typeof obj?.message === "string"
	);
}

/**
 * @deprecated Use extractIpcError instead
 */
export function isIpcRequestError(err: any): err is IpcError {
	console.log("isIpcRequestError check:", err);
	return isIpcError(err) || isIpcError(err?.cause);
}
