import { useState } from 'react';

import { type IDateTime } from './create-task-sheet';

import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { TimePicker } from '../time-picker';
import { Separator } from '../ui/separator';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog';

interface IProps {
	openDialog: boolean;
	onOpenDialog: (open: boolean) => void;
	onPickDateTime: (dateTime: IDateTime) => void;
}

export function ReminderDialog({ openDialog, onOpenDialog, onPickDateTime }: IProps) {
	const [date, setDate] = useState<Date | undefined>(new Date());
	const [time, setTime] = useState<{ hour: string; minute: string } | undefined>(undefined);

	function handlePickDateTime() {
		if (!date || !time) {
			return;
		}

		onPickDateTime({ date, hour: time.hour, minute: time.minute });
		onOpenDialog(false);
	}

	function cancelAction() {
		setDate(undefined);
		setTime(undefined);
		onOpenDialog(false);
	}

	return (
		<Dialog open={openDialog} onOpenChange={onOpenDialog}>
			<DialogContent className="sm:max-w-81.25">
				<DialogHeader>
					<DialogTitle>Pick a date</DialogTitle>
					<DialogDescription>Select a date and time to create a reminder.</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col items-center justify-center gap-2">
					<Calendar
						mode="single"
						selected={date}
						onSelect={setDate}
						className="w-full bg-transparent p-0"
						disabled={{ before: new Date() }}
					/>

					<Separator />

					<TimePicker
						defaultHour={new Date().getHours().toString()}
						defaultMinute={new Date().getMinutes().toString()}
						onPickTime={(time) => setTime(time)}
					/>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" onClick={() => cancelAction()}>
							Cancel
						</Button>
					</DialogClose>
					<Button onClick={() => handlePickDateTime()}>Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
