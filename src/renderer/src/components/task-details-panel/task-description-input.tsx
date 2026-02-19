import { useState } from 'react';

import { cn } from '../../lib/utils';

import { ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';
import { IUpdateTaskRequest } from '~/src/shared/types/ipc';

interface IProps {
	occurrence: ITaskOccurrenceDetails;
	isPending?: boolean;
	onHandleUpdate: (data: IUpdateTaskRequest) => Promise<void>;
}

export function TaskDescriptionInput({ occurrence, isPending, onHandleUpdate }: IProps) {
	const [inputValue, setInputValue] = useState(occurrence.taskDefinition.description || '');
	const [enableEditInput, setEnableEditInput] = useState(false);

	async function onUpdate() {
		if (inputValue.trim() === '') {
			setInputValue(occurrence.taskDefinition.description || '');
			setEnableEditInput(false);
			return;
		}

		if (inputValue.trim() === occurrence.taskDefinition.description) {
			setEnableEditInput(false);
			return;
		}

		await onHandleUpdate({ taskDefinitionId: occurrence.taskDefinitionId, description: inputValue });
		setEnableEditInput(false);
	}

	return (
		<textarea
			disabled={occurrence.status !== 'PENDING' || isPending}
			readOnly={enableEditInput ? false : true}
			defaultValue={occurrence.taskDefinition.description || ''}
			value={inputValue}
			onChange={(e) => setInputValue(e.target.value)}
			onDoubleClick={() => {
				setEnableEditInput(true);
			}}
			onBlur={async () => onUpdate()}
			className={cn([
				'w-full max-w-79.25 border-b border-transparent bg-transparent font-light outline-none placeholder:text-muted-foreground',
				'field-sizing-content resize-none disabled:cursor-default',
				occurrence.status !== 'PENDING' ? 'text-muted-foreground line-through' : '',
				enableEditInput ? 'border-input focus-visible:border-ring' : 'cursor-pointer',
			])}
		/>
	);
}
