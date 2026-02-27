import { useEffect, useState } from 'react';

import { cn } from '../../lib/utils';

import { ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';
import { IUpdateTaskRequest } from '~/src/shared/types/ipc';

interface IProps {
	occurrence: ITaskOccurrenceDetails;
	isPending?: boolean;
	disabled?: boolean;
	onHandleUpdate: (data: IUpdateTaskRequest) => Promise<void>;
}

export function TaskDescriptionInput({ occurrence, disabled = false, isPending, onHandleUpdate }: IProps) {
	const [inputValue, setInputValue] = useState(occurrence.taskDefinition.description || '');
	const [enableEditInput, setEnableEditInput] = useState(false);

	async function onUpdate() {
		try {
			const next = inputValue.trim();

			if (next === '') {
				setInputValue(occurrence.taskDefinition.description || '');
				return;
			}

			if (next === (occurrence.taskDefinition.description ?? '')) {
				return;
			}

			await onHandleUpdate({ taskDefinitionId: occurrence.taskDefinitionId, description: next });
		} finally {
			setEnableEditInput(false);
		}
	}

	useEffect(() => {
		setInputValue(occurrence.taskDefinition.description || '');
		setEnableEditInput(false);
	}, [occurrence.id]);

	useEffect(() => {
		if (!enableEditInput) {
			setInputValue(occurrence.taskDefinition.description || '');
		}
	}, [occurrence.taskDefinition.description, enableEditInput]);

	return (
		<textarea
			disabled={disabled || occurrence.status !== 'PENDING' || isPending}
			readOnly={enableEditInput ? false : true}
			value={inputValue}
			onChange={(e) => setInputValue(e.target.value)}
			onDoubleClick={() => {
				setEnableEditInput(true);
			}}
			onBlur={async () => onUpdate()}
			onKeyDown={(e) => {
				if (e.key === 'Escape') {
					e.preventDefault();
					setInputValue(occurrence.taskDefinition.description || '');
					setEnableEditInput(false);
				}
			}}
			className={cn([
				'w-full max-w-79.25 border-b border-transparent bg-transparent font-light outline-none placeholder:text-muted-foreground',
				'field-sizing-content resize-none disabled:cursor-default',
				occurrence.status !== 'PENDING' ? 'text-muted-foreground' : '',
				enableEditInput ? 'border-input focus-visible:border-ring' : 'cursor-pointer',
			])}
		/>
	);
}
