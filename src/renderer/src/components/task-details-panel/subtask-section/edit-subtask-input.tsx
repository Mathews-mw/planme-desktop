import { useState } from 'react';

import { cn } from '../../../lib/utils';
import { ISubtask } from '~/src/shared/types/subtask';

interface IProps {
	subtask: ISubtask;
	disabled?: boolean;
	isPending?: boolean;
	onHandleUpdate: (data: { subtaskId: string; title: string }) => Promise<void>;
}

export function EditSubtaskInput({ subtask, disabled = false, isPending, onHandleUpdate }: IProps) {
	const [inputValue, setInputValue] = useState(subtask.title);
	const [enableEditInput, setEnableEditInput] = useState(false);

	async function onUpdate() {
		if (inputValue.trim() === '') {
			setInputValue(subtask.title);
			setEnableEditInput(false);
			return;
		}

		if (inputValue.trim() === subtask.title) {
			setEnableEditInput(false);
			return;
		}

		await onHandleUpdate({ subtaskId: subtask.id, title: inputValue });
		setEnableEditInput(false);
	}

	return (
		<input
			disabled={disabled || subtask.isCompleted || isPending}
			readOnly={enableEditInput ? false : true}
			defaultValue={subtask.title}
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
				'h-9 w-full border-b border-transparent bg-transparent text-sm outline-none placeholder:text-muted-foreground',
				'disabled:cursor-default',
				subtask.isCompleted ? 'text-muted-foreground line-through' : '',
				enableEditInput ? 'border-input focus-visible:border-ring' : 'cursor-pointer',
			])}
		/>
	);
}
