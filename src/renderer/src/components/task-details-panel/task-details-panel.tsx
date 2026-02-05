import { TaskWithNext } from '~/src/shared/helpers/group-tasks-utilities';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';

interface IProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	task?: TaskWithNext;
}

export function TaskDetailsPanel({ task, open, onOpenChange }: IProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-[420px] p-0 sm:w-[480px]">
				<div className="flex h-full flex-col">
					<SheetHeader className="border-b p-4">
						<SheetTitle>{task?.taskDefinition.title ?? 'Task details'}</SheetTitle>
					</SheetHeader>

					<div className="flex-1 overflow-auto p-4">
						{!task ? (
							<div className="text-sm text-muted-foreground">Select a task to see details.</div>
						) : (
							<div className="space-y-3">
								{task.taskDefinition.description && (
									<p className="text-sm text-muted-foreground">{task.taskDefinition.description}</p>
								)}

								<div className="text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Next occurrence</span>
										<span>{task.nextOccurrenceAt ? new Date(task.nextOccurrenceAt).toLocaleString() : 'No date'}</span>
									</div>
								</div>

								{/* Ações aqui: completar, editar, mover lista, etc */}
							</div>
						)}
					</div>

					<div className="border-t p-4">{/* footer actions */}</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
