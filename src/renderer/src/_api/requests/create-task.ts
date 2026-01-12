// Guard access to the injected API to avoid crashing when running in a plain browser
export const apiCreateTask = typeof window !== "undefined" && window.api?.createTask
	? window.api.createTask
	: async () => {
		// helpful error when API is not available (e.g. when opening Vite in a browser)
		return Promise.reject(new Error("Electron API not available. Run inside the Electron app."));
	};