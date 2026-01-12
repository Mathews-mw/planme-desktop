import z from "zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { queryClient } from "../../lib/query-client";
import { errorHandler } from "../../_api/error-handler/error-handler";
import { taskRepository } from "../../../repositories/tasks-repository";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

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

import { useState } from "react";
import { ReminderDialog } from "./reminder-dialog";

import { Plus, X } from "lucide-react";
import { ReminderDropdown } from "./reminder-dropdown";
import { RecurrenceDropdown } from "./recurrence-dropdown";
import { RecurrenceDialog } from "./recurrence-dialog";
import { PickEndDateDialog } from "./pick-end-date-dialog";
import { IconCalendarCheck } from "@tabler/icons-react";
import dayjs from "dayjs";

export interface IDateTime {
	date: Date;
	hour: string;
	minute: string;
}

export interface IRecurrenceData {
	frequency: number;
	type: string;
	weekdays?: Array<{ value: number; label: string }>;
}

const formSchema = z.object({
	title: z.string({ error: "Please, provide a title" }).min(1, { message: "Please, provide a title" }),
	description: z.optional(z.string()),
	date: z.string().optional(),
	time: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreateTaskSheet() {
	const {
		control,
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
				title: data.title,
				description: data.description ?? null,
				dateTime: data.date && data.time ? new Date(`${data.date}T${data.time}:00.000Z`).toISOString() : null,
			});

			if (!result.success) {
				errorHandler(result.error);
				return;
			}

			toast.success(`Task "${result.data.title}" created!`);
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
				onSelectRecurrence={(data) => setRecurrence(data)}
			/>
			<PickEndDateDialog
				openDialog={showPickEndDateDialog}
				onOpenDialog={setShowPickEndDateDialog}
				onPickDate={(date) => setEndDate(date)}
			/>
		</>
	);
}
