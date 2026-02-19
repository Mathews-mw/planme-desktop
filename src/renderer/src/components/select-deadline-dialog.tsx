import { useState } from 'react';

import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';

interface IProps {
	openDialog: boolean;
	onOpenDialog: (open: boolean) => void;
	onPickDate: (date: Date) => void;
	defaultOptions?: Date;
}

export function SelectDeadlineDialog({ openDialog, onOpenDialog, onPickDate, defaultOptions }: IProps) {
	const [date, setDate] = useState<Date | undefined>(defaultOptions ?? new Date());

	function handlePickDateTime() {
		if (!date) {
			return;
		}

		onPickDate(date);
		onOpenDialog(false);
	}

	function cancelAction() {
		setDate(undefined);
		onOpenDialog(false);
	}

	return (
		<Dialog open={openDialog} onOpenChange={onOpenDialog}>
			<DialogContent className="sm:max-w-81.25">
				<DialogHeader>
					<DialogTitle>Deadline</DialogTitle>
					<DialogDescription>Select a date to be the deadline for your task.</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col items-center justify-center gap-2">
					<Calendar
						mode="single"
						selected={date}
						onSelect={setDate}
						className="w-full bg-transparent p-0"
						disabled={{ before: new Date() }}
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
