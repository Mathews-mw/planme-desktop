import { useCallback, useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';

import { Container } from '../container';
import { TaskTileComplete } from './task-tile-complete';
import { TaskDetailsPanel } from '../task-details-panel/task-details-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface TaskCompleteListProps {
	completedOccurrences: ITaskOccurrenceDetails[];
}

export function CompletedTaskList({ completedOccurrences }: TaskCompleteListProps) {
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [selectedOccurrence, setSelectedOccurrence] = useState<ITaskOccurrenceDetails | undefined>();

	const [listRef] = useAutoAnimate();

	const openDetails = useCallback((occurrence?: ITaskOccurrenceDetails) => {
		setSelectedOccurrence(occurrence);
		setDetailsOpen(true);
	}, []);

	const closeDetails = useCallback((open: boolean) => {
		setDetailsOpen(open);
		if (!open) setSelectedOccurrence(undefined);
	}, []);

	return (
		<>
			<Container>
				<Accordion type="single" collapsible defaultValue="completed-tasks">
					<AccordionItem value="completed-tasks">
						<AccordionTrigger>Completed Tasks ({completedOccurrences.length})</AccordionTrigger>
						<AccordionContent>
							<ul ref={listRef} className="space-y-2">
								{completedOccurrences.map((occurrence) => {
									return (
										<li key={occurrence.id}>
											<TaskTileComplete
												occurrence={occurrence}
												isActive={detailsOpen && selectedOccurrence?.id === occurrence.id}
												onOpenDetails={openDetails}
											/>
										</li>
									);
								})}
							</ul>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</Container>

			<TaskDetailsPanel open={detailsOpen} onOpenChange={closeDetails} occurrence={selectedOccurrence} />
		</>
	);
}
