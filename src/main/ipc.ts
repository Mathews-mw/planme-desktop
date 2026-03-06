// === Auth Imports ===
import './ipc/handles/auth/index';

// === Users Imports ===
import './ipc/handles/users/get-user-ipc';
import './ipc/handles/users/create-user-ipc';

// === Task List Imports ===
import './ipc/handles/task-list/index';

// === Tasks Imports ===
import './ipc/handles/tasks/create-task-ipc';
import './ipc/handles/tasks/update-task-ipc';
import './ipc/handles/tasks/delete-task-ipc';
import './ipc/handles/tasks/recreate-task-ipc';
import './ipc/handles/tasks/listing-tasks-ipc';
import './ipc/handles/tasks/listing-tasks-cursor-based-ipc';
import './ipc/handles/tasks/toggle-complete-task-ipc';
import './ipc/handles/tasks/toggle-favorite-task-ipc';

// === Occurrences Imports ===
import './ipc/handles/occurrences/listing-occurrences-ipc';
import './ipc/handles/occurrences/get-occurrences-by-task-ipc';
import './ipc/handles/occurrences/listing-occurrences-cursor-based-ipc';

// === Subtasks Imports ===
import './ipc/handles/subtasks/create-subtask-ipc';
import './ipc/handles/subtasks/edit-subtask-ipc';
import './ipc/handles/subtasks/delete-subtask-ipc';
import './ipc/handles/subtasks/toggle-subtask-complete-ipc';
import './ipc/handles/subtasks/reorder-subtasks-ipc';
import './ipc/handles/subtasks/listing-subtasks-ipc';
