import { useState } from 'react';

import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';

import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { DeleteTaskDialog } from '../task-components/delete-task-dialog';

import { IconTrash } from '@tabler/icons-react';

interface IProps {
	occurrence: ITaskOccurrenceDetails;
	onCloseSheet?: () => void;
	disabled?: boolean;
}

export function DeleteTaskButton({ occurrence, onCloseSheet, disabled = false }: IProps) {
	const [openDeleteTaskDialog, setOpenDeleteTaskDialog] = useState(false);

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="ghost" size="icon-sm" disabled={disabled} onClick={() => setOpenDeleteTaskDialog(true)}>
						<IconTrash className="size-5 text-muted-foreground" />
					</Button>
				</TooltipTrigger>

				<TooltipContent>
					<p>Delete task from list</p>
				</TooltipContent>
			</Tooltip>

			<DeleteTaskDialog
				task={{ taskDefinitionId: occurrence.taskDefinitionId, title: occurrence.taskDefinition.title }}
				open={openDeleteTaskDialog}
				onOpenChange={setOpenDeleteTaskDialog}
				postAction={onCloseSheet}
				isUndoAction
			/>
		</>
	);
}
