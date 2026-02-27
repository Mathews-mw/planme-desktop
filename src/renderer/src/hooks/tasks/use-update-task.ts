import { toast } from 'sonner';
import { useLoadingBar } from 'react-top-loading-bar';
import { QueryKey, useMutation } from '@tanstack/react-query';

import { type ITask } from '~/src/shared/types/task';
import { queryClient } from '../../lib/query-client';
import { isIpcError } from '~/src/shared/errors/is-ipc-error';
import { errorHandler } from '../../_api/error-handler/error-handler';
import { taskRepository } from '~/src/renderer/repositories/tasks-repository';
import type { IpcResponse, IUpdateTaskRequest } from '~/src/shared/types/ipc';
import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';

interface UseUpdateTaskOptions {
	onSuccess?: () => void;
	onError?: () => void;
}

type OccurrencesQueryData = IpcResponse<ITaskOccurrenceDetails[]>;

type PreviousOccurrencesSnapshot = Array<[QueryKey, OccurrencesQueryData | undefined]>;

interface UpdateTaskMutationContext {
	previousQueries: PreviousOccurrencesSnapshot;
}

/**
 * Aplica patch otimista genérico nos campos da taskDefinition
 * apenas quando eles vierem no payload.
 */
function patchOccurrenceByUpdatePayload(
	occ: ITaskOccurrenceDetails,
	payload: IUpdateTaskRequest
): ITaskOccurrenceDetails {
	if (occ.taskDefinitionId !== payload.taskDefinitionId) return occ;

	let next: ITaskOccurrenceDetails = occ;

	next = {
		...occ,
		taskDefinition: {
			...occ.taskDefinition,
			title: payload.title ?? occ.taskDefinition.title,
			listSlug: payload.listSlug ?? occ.taskDefinition.listSlug,
			description: payload.description ?? occ.taskDefinition.description,
			priority: payload.priority ?? occ.taskDefinition.priority,
			deadline: payload.deadline ?? occ.taskDefinition.deadline,
			recurrenceRule: payload.recurrenceRule
				? {
						...occ.taskDefinition.recurrenceRule,
						frequency: payload.recurrenceRule.frequency ?? occ.taskDefinition.recurrenceRule.frequency,
						endType: payload.recurrenceRule.endType ?? occ.taskDefinition.recurrenceRule.endType,
						startDateTime: payload.recurrenceRule.startDateTime ?? occ.taskDefinition.recurrenceRule.startDateTime,
						endDate: payload.recurrenceRule.endDate ?? occ.taskDefinition.recurrenceRule.endDate,
						interval: payload.recurrenceRule.interval ?? occ.taskDefinition.recurrenceRule.interval,
						weekdays: payload.recurrenceRule.weekdays ?? occ.taskDefinition.recurrenceRule.weekdays,
						dayOfMonth: payload.recurrenceRule.dayOfMonth ?? occ.taskDefinition.recurrenceRule.dayOfMonth,
						maxOccurrences: payload.recurrenceRule.maxOccurrences ?? occ.taskDefinition.recurrenceRule.maxOccurrences,
					}
				: occ.taskDefinition.recurrenceRule,
		},
	};

	return next;
}

/**
 * Atualiza cache de uma query de occurrences (IpcResponse<ITaskOccurrenceDetails[]>)
 * mantendo o shape IpcResponse<T>.
 */
function patchOccurrencesQueryCache(
	old: OccurrencesQueryData | undefined,
	payload: IUpdateTaskRequest
): OccurrencesQueryData | undefined {
	if (!old) return old;
	if (!old.success) return old; // se a query falhou, não tenta atualizar
	if (!Array.isArray(old.data) || old.data.length === 0) return old;

	return {
		...old,
		data: old.data.map((occ) => patchOccurrenceByUpdatePayload(occ, payload)),
	};
}

function reconcileWithServerTask(occ: ITaskOccurrenceDetails, serverTask: ITask): ITaskOccurrenceDetails {
	const tdId = serverTask.taskDefinition.id;

	if (occ.taskDefinitionId !== tdId) return occ;

	const reconciledOccurrence: ITaskOccurrenceDetails = {
		...serverTask.occurrences[0],
		taskDefinition: {
			...serverTask.taskDefinition,
			recurrenceRule: serverTask.recurrenceRule,
			subtasks: serverTask.subtasks ?? occ.taskDefinition.subtasks ?? [],
		},
	};

	return reconciledOccurrence;
}

export function useUpdateTask(options?: UseUpdateTaskOptions) {
	const { start, complete } = useLoadingBar();

	const mutation = useMutation<
		// Retorno da mutationFn
		IpcResponse<ITask>,
		// Erro técnico (throw)
		unknown,
		// Variables
		IUpdateTaskRequest,
		// Context
		UpdateTaskMutationContext
	>({
		mutationFn: async (payload) => {
			console.log('start mutation function');
			const result = await taskRepository.update(payload);

			if (!result.success) {
				throw result.error;
			}

			return result;
		},

		onMutate: async (payload) => {
			console.log('onMutate => start update optimistic update: ', payload);

			// Cancela refetches em andamento para evitar sobrescrever o patch otimista
			await queryClient.cancelQueries({ queryKey: ['occurrences'] });

			// Snapshot de todas as variações da query ['occurrences', ...]
			const previousQueries = queryClient.getQueriesData<OccurrencesQueryData>({
				queryKey: ['occurrences'],
			});

			// Patch otimista em todas as listas/visões carregadas
			queryClient.setQueriesData<OccurrencesQueryData>({ queryKey: ['occurrences'] }, (old) =>
				patchOccurrencesQueryCache(old, payload)
			);

			return { previousQueries };
		},

		onSuccess: async (result, _payload, _onMutateResult, _context) => {
			if (result.success) {
				const serverTask = result.data;

				queryClient.setQueriesData<OccurrencesQueryData>({ queryKey: ['occurrences'] }, (old) => {
					if (!old?.success) return old;

					return {
						...old,
						data: old.data.map((occ) => reconcileWithServerTask(occ, serverTask)),
					};
				});
			}
		},

		onError: (error, _payload, context) => {
			console.log('onError => fallback: ', error);

			if (context?.previousQueries) {
				for (const [queryKey, queryData] of context.previousQueries) {
					queryClient.setQueryData(queryKey, queryData);
				}
			}

			if (isIpcError(error)) {
				errorHandler(error);
				options?.onError?.();
				return;
			}

			console.error('IPC Communication Crash:', error);
			toast.error('Critical communication error with the system.');
			options?.onError?.();
		},

		onSettled: (_newValue, _error, _variables, _onMutateResult, context) => {
			console.log('onSettled => invalidate query');
			context.client.invalidateQueries({ queryKey: ['occurrences'], refetchType: 'active' });
		},
	});

	async function handleUpdateTask(data: IUpdateTaskRequest) {
		try {
			start('continuous');
			await mutation.mutateAsync(data);
			options?.onSuccess?.();
		} finally {
			complete();
		}
	}

	return {
		handleUpdateTask,
		isPendingUpdate: mutation.isPending,
	};
}
