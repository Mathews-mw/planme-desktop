import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface IProps {
	disabled?: boolean;
	date?: Date;
	onselectDate?: (date: Date) => void;
}

function formatDate(date: Date | undefined) {
	if (!date) {
		return "";
	}

	return date.toLocaleDateString("en-US", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
}

function isValidDate(date: Date | undefined) {
	if (!date) {
		return false;
	}
	return !isNaN(date.getTime());
}

export function DatePicker({ disabled, date = new Date(), onselectDate }: IProps) {
	const [openDatePicker, setOpenDatePicker] = React.useState(false);
	const [month, setMonth] = React.useState<Date | undefined>(date);
	const [value, setValue] = React.useState(formatDate(date));

	return (
		<div className="flex flex-col gap-3">
			<div className="relative flex gap-2">
				<Input
					id="date"
					disabled={disabled}
					value={value}
					placeholder="Select date"
					className="bg-background pr-10"
					onChange={(e) => {
						const date = new Date(e.target.value);
						setValue(e.target.value);
						if (isValidDate(date)) {
							setMonth(date);
						}
					}}
					onKeyDown={(e) => {
						if (e.key === "ArrowDown") {
							e.preventDefault();

							setOpenDatePicker(true);
						}
					}}
				/>
				<Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
					<PopoverTrigger asChild>
						<Button
							id="date-picker"
							variant="ghost"
							type="button"
							disabled={disabled}
							className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
						>
							<CalendarIcon className="size-3.5" />
							<span className="sr-only">Select date</span>
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
						<Calendar
							mode="single"
							selected={date}
							captionLayout="dropdown"
							month={month}
							disabled={{ before: new Date() }}
							onMonthChange={setMonth}
							startMonth={new Date()}
							onSelect={(date) => {
								setValue(formatDate(date));
								setOpenDatePicker(false);
								if (date) {
									onselectDate?.(date);
								}
							}}
						/>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}
