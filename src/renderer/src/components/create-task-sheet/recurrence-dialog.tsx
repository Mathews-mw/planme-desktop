import z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import { type IRecurrenceData } from "./create-task-sheet";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";

interface IProps {
	openDialog: boolean;
	onOpenDialog: (open: boolean) => void;
	onSelectRecurrence: (data: IRecurrenceData) => void;
}

const weekDays = [
	{ value: 1, label: "Monday" },
	{ value: 2, label: "Tuesday" },
	{ value: 3, label: "Wednesday" },
	{ value: 4, label: "Thursday" },
	{ value: 5, label: "Friday" },
	{ value: 6, label: "Saturday" },
	{ value: 7, label: "Sunday" },
];

const formSchema = z.object({
	frequency: z.string().min(1, { error: "Please, provide a frequency" }),
	type: z
		.string({ error: "Please, provide the frequency type" })
		.min(1, { error: "Please, provide the frequency type" }),
});

type FormData = z.infer<typeof formSchema>;

export function RecurrenceDialog({ onOpenDialog, openDialog, onSelectRecurrence }: IProps) {
	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			frequency: "1",
			type: "day",
		},
	});

	const [weekdaysSelected, setWeekdaysSelected] = useState<number[]>([]);
	const watchedValue = useWatch({ control, name: "type" });

	function handleSelectWeekday(value: number) {
		setWeekdaysSelected((prev) => {
			if (prev.includes(value)) {
				return prev.filter((item) => item !== value);
			} else {
				return [...prev, value];
			}
		});
	}

	function handleSelectRecurrence(data: FormData) {
		onSelectRecurrence({
			frequency: Number(data.frequency),
			type: data.type,
			weekdays:
				data.type === "week" && weekdaysSelected.length > 0
					? weekdaysSelected.map((item) => weekDays.find((weekday) => weekday.value === item)!)
					: undefined,
		});

		onOpenDialog(false);
	}

	return (
		<Dialog open={openDialog} onOpenChange={onOpenDialog}>
			<DialogContent className="sm:max-w-81.25">
				<DialogHeader>
					<DialogTitle>Repeat every...</DialogTitle>
					<VisuallyHidden>
						<DialogDescription></DialogDescription>
					</VisuallyHidden>
				</DialogHeader>

				<form id="recurrenceForm" onSubmit={handleSubmit(handleSelectRecurrence)} className="space-y-4">
					<div className="flex gap-2">
						<Input
							type="number"
							inputMode="numeric"
							defaultValue={1}
							{...register("frequency")}
							className="no-spinner w-14"
						/>

						<Controller
							control={control}
							name="type"
							render={({ field }) => {
								return (
									<Select value={field.value} onValueChange={field.onChange} defaultValue="day">
										<SelectTrigger className="w-45">
											<SelectValue placeholder="Select a frequency" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value="day">Days</SelectItem>
												<SelectItem value="week">Weeks</SelectItem>
												<SelectItem value="month">Months</SelectItem>
												<SelectItem value="year">Years</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								);
							}}
						/>
					</div>

					<div>
						<small className="text-sm text-red-500">{errors.frequency?.message}</small>
						<small className="text-sm text-red-500">{errors.type?.message}</small>
					</div>

					{watchedValue === "week" && (
						<div className="flex justify-between gap-2">
							{weekDays.map((weekday) => {
								return (
									<span
										key={weekday.value}
										onClick={() => handleSelectWeekday(weekday.value)}
										data-selected={weekdaysSelected.includes(weekday.value)}
										className="flex size-8 cursor-pointer items-center justify-center rounded-md bg-secondary px-2 py-1 font-semibold hover:bg-primary data-[selected=true]:bg-primary"
									>
										{weekday.label.slice(0, 1)}
									</span>
								);
							})}
						</div>
					)}
				</form>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button type="submit" form="recurrenceForm">
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
