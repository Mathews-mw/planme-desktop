import { useState } from 'react';

import { cn } from '../../lib/utils';

import { ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';
import { IUpdateTaskRequest } from '~/src/shared/types/ipc';

interface IProps {
	occurrence: ITaskOccurrenceDetails;
	isPending?: boolean;
	onHandleUpdate: (data: IUpdateTaskRequest) => Promise<void>;
}

export function TaskTitleInput({ occurrence, isPending, onHandleUpdate }: IProps) {
	const [inputValue, setInputValue] = useState(occurrence.taskDefinition.title);
	const [enableEditInput, setEnableEditInput] = useState(false);

	async function onUpdate() {
		if (inputValue.trim() === '') {
			setInputValue(occurrence.taskDefinition.title);
			setEnableEditInput(false);
			return;
		}

		if (inputValue.trim() === occurrence.taskDefinition.title) {
			setEnableEditInput(false);
			return;
		}

		await onHandleUpdate({ taskDefinitionId: occurrence.taskDefinitionId, title: inputValue });
		setEnableEditInput(false);
	}

	return (
		<input
			disabled={occurrence.status !== 'PENDING' || isPending}
			readOnly={enableEditInput ? false : true}
			defaultValue={occurrence.taskDefinition.title}
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
