import { useEffect, useState } from 'react';

import { cn } from '../../lib/utils';
import { IUpdateTaskRequest } from '~/src/shared/types/ipc';
import { ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';

interface IProps {
	occurrence: ITaskOccurrenceDetails;
	isPending?: boolean;
	onHandleUpdate: (data: IUpdateTaskRequest) => Promise<void>;
}

export function TaskTitleInput({ occurrence, isPending, onHandleUpdate }: IProps) {
	const [inputValue, setInputValue] = useState(occurrence.taskDefinition.title);
	const [enableEditInput, setEnableEditInput] = useState(false);

	async function onUpdate() {
		try {
			const next = inputValue.trim();

			if (next === '') {
				setInputValue(occurrence.taskDefinition.title);
				return;
			}

			if (next === occurrence.taskDefinition.title) {
				return;
			}

			await onHandleUpdate({ taskDefinitionId: occurrence.taskDefinitionId, title: next });
		} finally {
			setEnableEditInput(false);
		}
	}

	useEffect(() => {
		setInputValue(occurrence.taskDefinition.title);
		setEnableEditInput(false);
	}, [occurrence.id]);

	useEffect(() => {
		// se mudou no cache (optimistic/reconcile/rollback) e não está editando, reflete na UI
		if (!enableEditInput) {
			setInputValue(occurrence.taskDefinition.title);
		}
	}, [occurrence.taskDefinition.title, enableEditInput]);

	return (
		<input
			disabled={occurrence.status !== 'PENDING' || isPending}
			readOnly={enableEditInput ? false : true}
			value={inputValue}
			onChange={(e) => setInputValue(e.target.value)}
			onDoubleClick={() => {
				setEnableEditInput(true);
			}}
			onBlur={async () => onUpdate()}
			onKeyDown={async (e) => {
				if (e.key === 'Enter') {
					await onUpdate();
				}
				if (e.key === 'Escape') {
					e.preventDefault();
					setInputValue(occurrence.taskDefinition.title);
					setEnableEditInput(false);
				}
			}}
			className={cn([
				'h-9 w-full border-b border-transparent bg-transparent text-xl font-semibold outline-none placeholder:text-muted-foreground',
				'disabled:cursor-default',
				occurrence.status !== 'PENDING' ? 'text-muted-foreground line-through' : '',
				enableEditInput ? 'border-input focus-visible:border-ring' : 'cursor-pointer',
			])}
		/>
	);
}
