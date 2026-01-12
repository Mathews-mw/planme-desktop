import z from "zod";
import { ipcMain } from "electron";
import { randomUUID } from "node:crypto";

import { store } from "./store";
import { ITask } from "../shared/types/task";
import { IPC } from "../shared/constants/ipc";
import { zodErrorHandler } from "../shared/errors/zod-errors-handler";
import { IpcExceptionError } from "../shared/errors/ipc-exception-error";
import {
	ICreateTaskRequest,
	ICreateTaskResponse,
	IpcResponse,
} from "../shared/types/ipc";

const createTaskSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }),
	description: z.string().nullable().optional(),
	priority: z
		.enum(["LOW", "NORMAL", "HIGH", "NONE"])
		.optional()
		.default("NONE"),
	isStarred: z.boolean().optional().default(false),
	dateTime: z.string().nullable().optional(), // ISO string ou null
});

ipcMain.handle(
	IPC.TASKS.CREATE,
	async (_event, raw: ICreateTaskRequest): Promise<IpcResponse<ITask>> => {
		console.log("Creating task with raw data:", raw);
		const parse = createTaskSchema.safeParse(raw);

		console.log("Parsed task data:", parse);

		if (!parse.success) {
			const fieldErrors = zodErrorHandler(parse.error);

			return {
				success: false,
				error: {
					code: "VALIDATION_ERROR",
					message: "Invalid task data",
					fieldErrors,
				},
			};
		}

		const data = parse.data;

		const id = randomUUID();

		try {
			const task: ITask = {
				id,
				title: data.title,
				description: data.description ?? null,
				priority: data.priority ?? "NONE",
				isStarred: data.isStarred ?? false,
				dateTime: data.dateTime ? new Date(data.dateTime).toISOString() : null,
				isCompleted: false,
				createdAt: new Date().toISOString(),
			};

			store.set(`tasks.${task.id}`, task);

			return { success: true, data: task };
		} catch (err) {
			return {
				success: false,
				error: {
					code: "INTERNAL_ERROR",
					message: "Erro ao salvar no banco",
					details: err,
				},
			};
		}
	},
);
