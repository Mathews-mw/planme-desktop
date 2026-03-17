import { Notification, powerMonitor } from 'electron';

import { TScheduledTaskOccurrence } from '~/src/shared/types/notification';
import { TaskNotificationRepository } from '../../db/repositories/task-notification.repository';

const SCHEDULE_WINDOW_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const RESYNC_INTERVAL_MS = 1000 * 60; // 1 min
const OVERDUE_GRACE_MS = 1000 * 60 * 15; // 15 min

type ITimerEntry = {
	occurrenceId: string;
	runAtIso: string;
	timeout: NodeJS.Timeout;
};

export class TaskNotificationScheduler {
	private timers = new Map<string, ITimerEntry>();
	private interval?: NodeJS.Timeout;

	constructor(private readonly taskNotificationRepository: TaskNotificationRepository) {}

	async start() {
		await this.recoverDueOccurrences();
		await this.reloadUpcoming();

		this.interval = setInterval(() => {
			void this.recoverDueOccurrences();
			void this.reloadUpcoming();
		}, RESYNC_INTERVAL_MS);

		powerMonitor.on('resume', () => {
			void this.recoverDueOccurrences();
			void this.reloadUpcoming();
		});
	}

	stop() {
		for (const timer of this.timers.values()) {
			clearTimeout(timer.timeout);
		}

		this.timers.clear();

		if (this.interval) {
			clearInterval(this.interval);
			this.interval = undefined;
		}
	}

	async syncTaskDefinition(taskDefinitionId: string) {
		const current = await this.taskNotificationRepository.findCurrentPendingByTaskDefinitionId(taskDefinitionId);

		console.log('Sync Task Notification: ', current?.taskDefinitionId, current?.title);

		if (!current) {
			this.cancel(taskDefinitionId);
			return;
		}

		this.schedule(current);
	}

	async reloadUpcoming() {
		const now = new Date();
		const nowIso = now.toISOString();
		const untilIso = new Date(now.getTime() + SCHEDULE_WINDOW_MS).toISOString();

		const occurrences = await this.taskNotificationRepository.findPendingBetween(nowIso, untilIso);

		const validTaskIds = new Set(occurrences.map((item) => item.taskDefinitionId));

		for (const [taskDefinitionId] of this.timers.entries()) {
			if (!validTaskIds.has(taskDefinitionId)) {
				this.cancel(taskDefinitionId);
			}
		}

		for (const occurrence of occurrences) {
			this.schedule(occurrence);
		}
	}

	private async recoverDueOccurrences() {
		const now = Date.now();
		const dueOccurrences = await this.taskNotificationRepository.findDueUnnotified(new Date(now).toISOString());

		for (const occurrence of dueOccurrences) {
			const overdueMs = now - new Date(occurrence.occurrenceDateTime).getTime();

			if (overdueMs <= OVERDUE_GRACE_MS) {
				await this.fire(occurrence.taskDefinitionId, occurrence.occurrenceId, true);
			} else {
				await this.taskNotificationRepository.markOccurrenceAsNotified(
					occurrence.occurrenceId,
					new Date().toISOString()
				);

				await this.syncTaskDefinition(occurrence.taskDefinitionId);
			}
		}
	}

	private schedule(occurrence: TScheduledTaskOccurrence) {
		this.cancel(occurrence.taskDefinitionId);

		const runAt = new Date(occurrence.occurrenceDateTime).getTime();
		const delay = runAt - Date.now();

		console.log(`Task notification scheduling at: ${runAt}. With ${delay} delay`);

		if (!Number.isFinite(runAt) || delay <= 0 || delay > SCHEDULE_WINDOW_MS) {
			return;
		}

		const timeout = setTimeout(() => {
			void this.fire(occurrence.taskDefinitionId, occurrence.occurrenceId, false);
		}, delay);

		this.timers.set(occurrence.taskDefinitionId, {
			occurrenceId: occurrence.occurrenceId,
			runAtIso: occurrence.occurrenceDateTime,
			timeout,
		});
	}

	private cancel(taskDefinitionId: string) {
		const existing = this.timers.get(taskDefinitionId);

		if (existing) {
			clearTimeout(existing.timeout);
			this.timers.delete(taskDefinitionId);
		}
	}

	private async fire(taskDefinitionId: string, occurrenceId: string, isRecovered: boolean) {
		this.cancel(taskDefinitionId);

		const current = await this.taskNotificationRepository.findCurrentPendingByTaskDefinitionId(taskDefinitionId);

		if (!current) return;

		if (current.occurrenceId !== occurrenceId || current.status !== 'PENDING' || current.notifiedAt) {
			await this.syncTaskDefinition(taskDefinitionId);
			return;
		}

		const body = isRecovered
			? (current.description ?? 'You have a pending task that was recently due.')
			: (current.description ?? 'A scheduled task is happening right now.');

		const notification = new Notification({
			title: current.title,
			body,
			silent: false,
		});

		notification.show();

		console.log('Notification: ', notification);

		await this.taskNotificationRepository.markOccurrenceAsNotified(current.occurrenceId, new Date().toISOString());
		await this.syncTaskDefinition(taskDefinitionId);
	}
}
