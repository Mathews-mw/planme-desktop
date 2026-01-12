import { toast } from "sonner";
import { ApiExceptionsError } from "./api-exceptions-error";
import { IpcError } from "~/src/shared/types/ipc";

interface IParams {
	error: unknown;
	description?: string;
	showErrorCode?: boolean;
}

export function errorHandler(error: IpcError) {
	if (error.code === "VALIDATION_ERROR" && error.fieldErrors) {
		const fieldErros = Object.entries(error.fieldErrors);

		return toast.error(
			<div>
				<span>Validation error: </span>

				<ul className="ml-6 list-disc">
					{fieldErros.map((err, index) => {
						const msg = err[0];
						const descriptions = err[1]?.concat();

						return (
							<li key={index}>
								{msg} - {descriptions}
							</li>
						);
					})}
				</ul>
			</div>
		);
	} else {
		return toast.error(error.code, { description: error.message });
	}
}
