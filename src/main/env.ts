import 'dotenv/config';

import { config } from 'dotenv';
import { z } from 'zod';
import path from 'node:path';

// Se quiser carregar um arquivo específico:
config({
	path: path.resolve(process.cwd(), 'main.env'),
});

const envSchema = z.object({
	NODE_ENV: z.enum(['production', 'development', 'test']).default('development'),
});

export const mainEnv = envSchema.parse(process.env);
