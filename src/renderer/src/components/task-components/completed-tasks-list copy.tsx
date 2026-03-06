import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAutoAnimate } from '@formkit/auto-animate/react';

import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';
import { occurrencesRepository } from '../../../repositories/occurrences-repository';

import { Container } from '../container';
import { TaskTileComplete } from './task-tile-complete';
import { TaskDetailsPanel } from '../task-details-panel/task-details-panel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface TaskCompleteListProps {
	parentRef?: (element: HTMLElement) => void;
	listSlug?: string;
}

export function CompletedTaskList({ parentRef, listSlug }: TaskCompleteListProps) {
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [selectedOccurrence, setSelectedOccurrence] = useState<ITaskOccurrenceDetails | undefined>();

	const [listRef] = useAutoAnimate();

	const { data: occsResponse } = useQuery({
		queryKey: ['occurrences', listSlug, 'status:COMPLETED'],
		queryFn: async () =>
			occurrencesRepository.listingOccurrences({ listSlug, status: 'COMPLETED', orderBy: 'recently_completed' }),
	});

	const tasks = useMemo(() => {
		if (!occsResponse || !occsResponse.success) {
			return [];
		}

		return occsResponse.data;
	}, [occsResponse]);

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
			{occsResponse && tasks.length > 0 && (
				<Container>
					<Accordion type="single" collapsible defaultValue="completed-tasks">
						<AccordionItem value="completed-tasks">
							<AccordionTrigger>Completed Tasks ({tasks.length})</AccordionTrigger>
							<AccordionContent>
								<ul ref={listRef} className="space-y-2">
									{tasks.map((occurrence) => {
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
			)}

			<TaskDetailsPanel open={detailsOpen} onOpenChange={closeDetails} occurrence={selectedOccurrence} />
		</>
	);
}
