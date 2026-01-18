export const authRepository = {
	getLastActiveUser: () => window.api.getLastActiveUser(),
	setLastActiveUser: (payload: { uid: string }) => window.api.setLastActiveUser(payload),
	clearLastActiveUser: () => window.api.clearLastActiveUser(),
};
