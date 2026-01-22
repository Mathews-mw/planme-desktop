import { ITask } from '../types/task';
import { parseIso } from './group-tasks-utilities';
import { generateOccurrences } from '../recurrence-engine/recurrence-generator';

function getOneOffDate(task: ITask): Date | null {
	// ajuste a prioridade como você preferir:
	return parseIso(task.taskDefinition.deadline) ?? parseIso(task.recurrenceRule.startDateTime) ?? null;
}

export function getNextOccurrenceAt({ task, now = new Date() }: { task: ITask; now?: Date }): Date | null {
	const freq = task.recurrenceRule.frequency;

	if (freq === 'NONE') {
		const d = getOneOffDate(task);
		// Criar AQUI uma lógica para mostrar tarefas atrasadas, em algum grupo tipo "overdue"
		return d;
	}

	// recorrente: pega só a próxima
	const [next] = generateOccurrences({
		rule: task.recurrenceRule,
		fromDate: now,
		maxToGenerate: 1,
	});

	return next ?? null;
}
