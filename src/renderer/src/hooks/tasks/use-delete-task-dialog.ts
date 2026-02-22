import { useCallback, useState } from 'react';

interface IRequestToDelete {
	taskDefinitionId: string;
	title: string;
}

export function useDeleteTaskDialog() {
	const [open, setOpen] = useState(false);
	const [taskToDelete, setTaskToDelete] = useState<IRequestToDelete | undefined>(undefined);

	const requestDelete = useCallback((task: IRequestToDelete) => {
		setTaskToDelete(task);
		setOpen(true);
	}, []);

	const onOpenChange = useCallback((nextOpen: boolean) => {
		setOpen(nextOpen);

		if (!nextOpen) setTaskToDelete(undefined);
	}, []);

	return { open, taskToDelete, requestDelete, onOpenChange };
}
