import { TaskNotificationRepository } from '../../db/repositories/task-notification.repository';
import { TaskNotificationScheduler } from './task-notification-scheduler';

const repository = new TaskNotificationRepository();

export const taskNotificationScheduler = new TaskNotificationScheduler(repository);
