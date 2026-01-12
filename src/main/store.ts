import Store from "electron-store";

import { ITask } from "../shared/types/task";

interface StoreType {
	tasks: Record<string, ITask>;
}

export const store = new Store<StoreType>({
	name: "planme",
	defaults: {
		tasks: {},
	},
});

console.log("Store path: ", store.path);
