import dayjs from 'dayjs';
import { Fragment, useMemo } from 'react';

import { Button } from '../ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { X } from 'lucide-react';
import { IconCalendarRepeat, IconReload } from '@tabler/icons-react';
import { IRecurrenceData } from './create-task-form';
import { getRecurrenceLabel } from '../../utils/recurrence-utils';

interface IProps {
	recurrenceData: IRecurrenceData | undefined;
	onRemoveRecurrence: () => void;
	onShowRecurrenceDialog: (value: boolean) => void;
}

export function RecurrenceDropdown({ recurrenceData, onRemoveRecurrence, onShowRecurrenceDialog }: IProps) {
	const recurrenceLabel = useMemo(() => {
		if (!recurrenceData) {
			return { repetition: 'No recurrence' };
		}

		const result = getRecurrenceLabel({
			frequency: recurrenceData.frequency,
			dayOfMonth: recurrenceData.dayOfMonth,
			endDate: recurrenceData.endDate,
			interval: recurrenceData.interval,
			maxOccurrences: recurrenceData.maxOccurrences,
			recurrenceEndType: recurrenceData.recurrenceEndType,
		});

		return result;
	}, [recurrenceData]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				{recurrenceData ? (
					<div className="relative z-0 flex gap-2 rounded-md bg-secondary px-3 py-2 text-sm">
						<IconCalendarRepeat className="size-5 text-sky-500" />
						<div className="flex flex-col">
							<span className="font-semibold">{recurrenceLabel.repetition}</span>

							{recurrenceData.weekdays && recurrenceData.weekdays.length > 0 && (
								<div>
									{recurrenceData.weekdays.map((weekday, index) => (
										<Fragment key={weekday.value}>
											<span className="text-muted-foreground">{weekday.label.slice(0, 3)}</span>
											{index + 1 !== recurrenceData.weekdays?.length && (
												<span className="text-muted-foreground">, </span>
											)}
										</Fragment>
									))}
								</div>
							)}

							{recurrenceLabel.ends && <span className="text-sm text-muted-foreground">{recurrenceLabel.ends}</span>}
						</div>

						<Button
							variant="ghost"
							type="button"
							size="icon-sm"
							className="absolute top-0 right-1 z-10"
							aria-label="Remove reminder"
							onPointerDown={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
							onMouseDown={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
							onClick={() => {
								onRemoveRecurrence();
							}}
						>
							<X />
						</Button>
					</div>
				) : (
					<Button variant="secondary">
						<IconCalendarRepeat /> Repeat
					</Button>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuItem>Daily</DropdownMenuItem>
				<DropdownMenuItem>Weekly</DropdownMenuItem>
				<DropdownMenuItem>Monthly</DropdownMenuItem>
				<DropdownMenuItem>Yearly</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={() => onShowRecurrenceDialog(true)}>
					<IconReload />
					Custom Repeat
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
