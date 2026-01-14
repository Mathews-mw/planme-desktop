import z from "zod";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";

import { queryClient } from "../../lib/query-client";
import { errorHandler } from "../../_api/error-handler/error-handler";
import { taskRepository } from "../../../repositories/tasks-repository";
import { type ITaskPriority } from "~/src/shared/types/task-definition";
import type { IRecurrenceEndType, IRecurrenceFrequency } from "~/src/shared/types/recurrence-rule";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ReminderDialog } from "./reminder-dialog";
import { ReminderDropdown } from "./reminder-dropdown";
import { RecurrenceDialog } from "./recurrence-dialog";
import { RecurrenceDropdown } from "./recurrence-dropdown";
import { PickEndDateDialog } from "./pick-end-date-dialog";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "../ui/sheet";

import { Plus, X } from "lucide-react";
import { IconCalendarCheck } from "@tabler/icons-react";

export interface IDateTime {
	date: Date;
	hour: string;
	minute: string;
}

export interface IRecurrenceData {
	frequency: IRecurrenceFrequency;
	interval?: number;
	dayOfMonth?: number;
	weekdays?: Array<{ value: number; label: string }>;
	recurrenceEndType?: IRecurrenceEndType;
	endDate?: Date;
	maxOccurrences?: number;
}

const formSchema = z.object({
	title: z.string({ error: "Please, provide a title" }).min(1, { message: "Please, provide a title" }),
	description: z.optional(z.string()),
	// date: z.string().optional(),
	// time: z.string().optional(),
	// endDate: z.string().optional(),
	// priority: z.string().optional(),
	// frequency: z.string(),
	// endType: z.string().optional(),
	// interval: z.string().optional(),
	// maxOccurrences: z.string().optional(),
	// dayOfMonth: z.string().optional(),
	// weekdays: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreateTaskSheet() {
	const {
		register,
		handleSubmit,
		reset,
		formState: { isSubmitting, errors },
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
	});

	const [showReminderDialog, setShowReminderDialog] = useState(false);
	const [showRecurrenceDialog, setShowRecurrenceDialog] = useState(false);
	const [showPickEndDateDialog, setShowPickEndDateDialog] = useState(false);

	const [dateTime, setDateTime] = useState<IDateTime | undefined>(undefined);
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);
	const [recurrence, setRecurrence] = useState<IRecurrenceData | undefined>(undefined);

	const { mutateAsync: createTaskFn, isPending } = useMutation({
		mutationFn: taskRepository.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});

	async function handleCreateTask(data: FormData) {
		try {
			const result = await createTaskFn({
				definition: {
					title: data.title,
					description: data.description ?? null,
					priority: data.priority ? (data.priority as ITaskPriority) : undefined,
				},
				recurrenceRule: {
					startDateTime: data.date && data.time ? new Date(`${data.date}T${data.time}:00.000Z`) : null,
					frequency: data.frequency ? (data.frequency as IRecurrenceFrequency) : undefined,
					endType: data.endType ? (data.endType as IRecurrenceEndType) : undefined,
					interval: data.interval ? Number(data.interval) : undefined,
					maxOccurrences: data.maxOccurrences ? Number(data.maxOccurrences) : undefined,
					dayOfMonth: data.dayOfMonth ? Number(data.dayOfMonth) : undefined,
					weekdays: data.weekdays ? Number(data.weekdays) : undefined,
					endDate: data.endDate ? new Date(data.endDate) : undefined,
				},
			});

			if (!result.success) {
				errorHandler(result.error);
				return;
			}

			toast.success(`Task "${result.data.taskDefinition.title}" created!`);
			reset();
		} catch (criticalError) {
			console.error("IPC Communication Crash:", criticalError);
			toast.error("Erro crítico de comunicação com o sistema.");
		}
	}

	return (
		<>
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="secondary" className="hidden sm:flex">
						<Plus /> New Task
					</Button>
				</SheetTrigger>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Create a New Task</SheetTitle>
						<SheetDescription>After filling in the fields, click save to create a new task.</SheetDescription>
					</SheetHeader>

					<div className="space-y-4">
						<form className="grid flex-1 auto-rows-min gap-6 px-4">
							<div className="grid gap-3">
								<Label htmlFor="title">Title</Label>
								<Input id="title" placeholder="Task Title" {...register("title")} />
								{errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
							</div>
							<div className="grid gap-3">
								<Label htmlFor="description">Details</Label>
								<Textarea
									id="description"
									placeholder="Add task details (optional)..."
									rows={4}
									{...register("description")}
								/>
							</div>
						</form>

						<div className="grid flex-1 auto-rows-min gap-2 px-4">
							<ReminderDropdown
								dateTime={dateTime}
								onRemoveDateTime={() => setDateTime(undefined)}
								onShowReminderDialog={() => setShowReminderDialog(true)}
							/>

							<RecurrenceDropdown
								recurrenceData={recurrence}
								onShowRecurrenceDialog={() => setShowRecurrenceDialog(true)}
								onRemoveRecurrence={() => setRecurrence(undefined)}
							/>

							{endDate ? (
								<div className="flex items-center justify-between rounded-md bg-secondary p-1 text-sm">
									<Button type="button" variant="ghost" size="sm" onClick={() => setShowPickEndDateDialog(true)}>
										<IconCalendarCheck className="size-5 text-sky-500" /> Ends on{" "}
										<span className="font-semibold">{dayjs(new Date(endDate)).format("MMMM D, YYYY")}</span>
									</Button>
									<Button type="button" variant="ghost" size="icon-sm" onClick={() => setEndDate(undefined)}>
										<X />
									</Button>
								</div>
							) : (
								<Button type="button" variant="secondary" onClick={() => setShowPickEndDateDialog(true)}>
									<IconCalendarCheck /> Add End Date
								</Button>
							)}
						</div>
					</div>

					<SheetFooter>
						<Button type="submit">Save changes</Button>
						<SheetClose asChild>
							<Button variant="outline">Close</Button>
						</SheetClose>
					</SheetFooter>
				</SheetContent>
			</Sheet>

			<ReminderDialog
				openDialog={showReminderDialog}
				onOpenDialog={setShowReminderDialog}
				onPickDateTime={(dateTime) => setDateTime(dateTime)}
			/>
			<RecurrenceDialog
				openDialog={showRecurrenceDialog}
				onOpenDialog={setShowRecurrenceDialog}
				defaultOptions={recurrence}
				onSetRecurrence={(data) => setRecurrence(data)}
			/>
			<PickEndDateDialog
				openDialog={showPickEndDateDialog}
				onOpenDialog={setShowPickEndDateDialog}
				onPickDate={(date) => setEndDate(date)}
			/>
		</>
	);
}
