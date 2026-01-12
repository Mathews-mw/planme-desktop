import { useEffect, useState } from "react";

import { ButtonGroup } from "./ui/button-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

interface IProps {
	onPickTime: (time: { hour: string; minute: string }) => void;
	defaultHour?: string;
	defaultMinute?: string;
}

const hours = Array.from({ length: 23 }, (_, i) => i + 1);
const minutes = Array.from({ length: 60 }, (_, i) => i);

export function TimePicker({ defaultHour, defaultMinute, onPickTime }: IProps) {
	const [hour, setHour] = useState(
		defaultHour ?? new Date().getHours().toString()
	);
	const [minute, setMinute] = useState(
		defaultMinute ?? new Date().getMinutes().toString()
	);

	function handleSelectHour(value: string) {
		setHour(value);
	}

	function handleSelectMinute(value: string) {
		setMinute(value);
	}

	useEffect(() => {
		onPickTime({ hour, minute });
	}, [hour, minute]);

	return (
		<ButtonGroup className="w-full">
			<Select value={hour} onValueChange={handleSelectHour}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Hours" />
				</SelectTrigger>
				<SelectContent>
					{hours.map((hour) => {
						return (
							<SelectItem key={hour} value={hour.toString()}>
								{hour}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>

			<Select value={minute} onValueChange={handleSelectMinute}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Minutes" />
				</SelectTrigger>
				<SelectContent>
					{minutes.map((minute) => {
						return (
							<SelectItem
								key={minute}
								value={minute.toString().padStart(2, "0")}
							>
								{minute.toString().padStart(2, "0")}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</ButtonGroup>
	);
}
