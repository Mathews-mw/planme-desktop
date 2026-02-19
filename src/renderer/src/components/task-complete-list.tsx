import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAutoAnimate } from '@formkit/auto-animate/react';

import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';
import { occurrencesRepository } from '../../repositories/occurrences-repository';

import { Container } from './container';
import { TaskCompleteTile } from './task-complete-tile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface TaskCompleteListProps {
	parentRef?: (element: HTMLElement) => void;
}

export function TaskCompleteList({ parentRef }: TaskCompleteListProps) {
	const [show, setShow] = useState(false);
	const [selectedOccurrence, setSelectedOccurrence] = useState<ITaskOccurrenceDetails | undefined>();
	const [detailsOpen, setDetailsOpen] = useState(false);

	const [listRef] = useAutoAnimate();

	const { data: occsResponse } = useQuery({
		queryKey: ['occurrences', 'status:COMPLETED'],
		queryFn: async () =>
			occurrencesRepository.listingOccurrences({ status: 'COMPLETED', orderBy: 'recently_completed' }),
	});

	const tasks = useMemo(() => {
		if (!occsResponse || !occsResponse.success) {
			return [];
		}

		return occsResponse.data;
	}, [occsResponse]);

	function openDetails(occ: ITaskOccurrenceDetails) {
		setSelectedOccurrence(occ);
		setDetailsOpen(true);
	}

	function closeDetails(open: boolean) {
		setDetailsOpen(open);
		if (!open) setSelectedOccurrence(undefined);
	}

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
												<TaskCompleteTile
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
		</>
	);
}
