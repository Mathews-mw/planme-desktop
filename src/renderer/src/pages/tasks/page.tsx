import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

import { type ITaskOccurrenceDetails } from '~/src/shared/types/task-occurrence';
import { groupOccurrencesByDate } from '~/src/shared/helpers/group-occurrences-by-date';
import { occurrencesRepository } from '~/src/renderer/repositories/occurrences-repository';

import { TaskTile } from '../../components/task-tile';
import { Container } from '../../components/container';
import { TaskCompleteList } from '../../components/task-complete-list';
import { TaskDetailsPanel } from '../../components/task-details-panel/task-details-panel';

import { IconSquareRoundedCheckFilled } from '@tabler/icons-react';

export function TasksPage() {
	const [now, setNow] = useState(() => new Date());
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [selectedOccurrence, setSelectedOccurrence] = useState<ITaskOccurrenceDetails | undefined>();

	const [animatedContainer] = useAutoAnimate();
	const [parent] = useAutoAnimate();

	const { data: occsResponse } = useQuery({
		queryKey: ['occurrences', 'status:PENDING'],
		queryFn: async () => occurrencesRepository.listingOccurrences({ status: 'PENDING' }),
	});

	const groups = useMemo(() => {
		if (!occsResponse || !occsResponse.success) {
			return [];
		}

		const group = groupOccurrencesByDate({ occurrences: occsResponse.data, now });

		return group;
	}, [occsResponse, now]);

	function openDetails(occurrence?: ITaskOccurrenceDetails) {
		console.log('open occurrence details: ', occurrence);

		setSelectedOccurrence(occurrence);
		setDetailsOpen(true);
	}

	function closeDetails(open: boolean) {
		setDetailsOpen(open);
		if (!open) setSelectedOccurrence(undefined);
	}

	useEffect(() => {
		// Atualiza a cada 60 segundos
		const id = setInterval(() => setNow(new Date()), 60_000);
		return () => clearInterval(id);
	}, []);

	return (
		<>
			<div ref={animatedContainer} className="flex flex-col space-y-8">
				<div className="flex items-center gap-2">
					<IconSquareRoundedCheckFilled className="size-7 text-primary" />
					<h1 className="text-xl font-semibold">All Tasks</h1>
				</div>

				<div className="space-y-4">
					{groups.map((group) => (
						<ul key={group.key}>
							<li>
								<Container className="space-y-2">
									<h4
										className={[
											'text-sm font-semibold',
											group.key === 'overdue' ? 'text-rose-500' : 'text-muted-foreground',
										].join(' ')}
									>
										{group.title}
									</h4>

									<ul ref={parent} className="space-y-2">
										{group.items.map((occurrence) => {
											return (
												<li key={occurrence.id}>
													<TaskTile
														occurrence={occurrence}
														isActive={detailsOpen && selectedOccurrence?.id === occurrence.id}
														onOpenDetails={openDetails}
													/>
												</li>
											);
										})}
									</ul>
								</Container>
							</li>
						</ul>
					))}
				</div>

				<TaskCompleteList parentRef={parent} />
			</div>

			<TaskDetailsPanel open={detailsOpen} onOpenChange={closeDetails} occurrence={selectedOccurrence} />
		</>
	);
}
