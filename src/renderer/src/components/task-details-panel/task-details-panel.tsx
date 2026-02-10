import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';

interface IProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	occurrence?: ITaskOccurrenceDetails;
}

export function TaskDetailsPanel({ occurrence, open, onOpenChange }: IProps) {
	console.log('occurrence: ', occurrence);

	if (!occurrence) {
		return null;
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-[420px] p-0 sm:w-[480px]">
				<div className="flex h-full flex-col">
					<SheetHeader className="border-b p-4">
						<SheetTitle>{occurrence.taskDefinition.title}</SheetTitle>
					</SheetHeader>

					<div className="flex-1 overflow-auto p-4">
						<div className="space-y-3">
							{occurrence.taskDefinition.description && (
								<p className="text-sm text-muted-foreground">{occurrence.taskDefinition.description}</p>
							)}

							{/* Ações aqui: completar, editar, mover lista, etc */}
						</div>
					</div>

					<div className="border-t p-4">{/* footer actions */}</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
