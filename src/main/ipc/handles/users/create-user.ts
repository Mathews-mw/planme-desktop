import z from 'zod';
import { hash } from 'bcryptjs';
import { ipcMain } from 'electron';
import { randomUUID } from 'node:crypto';

import { getDb } from '~/src/main/db';
import { IPC } from '~/src/shared/constants/ipc';
import { accounts, users } from '~/src/main/db/schema';
import { zodErrorHandler } from '~/src/shared/errors/zod-errors-handler';
import { ICreateUserRequest, ICreateUserResponse, IpcResponse } from '~/src/shared/types/ipc';

const HASH_SALT_LENGTH = 6;

const createUserSchema = z.object({
	id: z.string().optional(),
	providerAccountId: z.string().optional(),
	name: z.string().min(1, { message: 'Title is required' }),
	email: z.email({ error: 'Please, provide a valid e-mail' }),
	password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

ipcMain.handle(IPC.USERS.CREATE, async (_event, raw: ICreateUserRequest): Promise<IpcResponse<ICreateUserResponse>> => {
	const parse = createUserSchema.safeParse(raw);

	if (!parse.success) {
		const fieldErrors = zodErrorHandler(parse.error);

		return {
			success: false,
			error: {
				code: 'VALIDATION_ERROR',
				message: 'Invalid user data',
				fieldErrors,
			},
		};
	}

	const data = parse.data;

	const userId = data.id ?? randomUUID();
	const accountId = randomUUID();
	const providerAccountId = data.providerAccountId ?? randomUUID();

	const hashPassword = await hash(data.password, HASH_SALT_LENGTH);

	try {
		const db = getDb();

		const [user] = await db
			.insert(users)
			.values({
				id: userId,
				email: data.email,
				name: data.name,
				password: hashPassword,
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			})
			.returning();

		await db.insert(accounts).values({
			id: accountId,
			userId,
			provider: 'CREDENTIALS',
			providerAccountId,
		});

		return { success: true, data: { id: user.id } };
	} catch (err) {
		return {
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An error occurred while creating the user',
				details: err,
			},
		};
	}
});
