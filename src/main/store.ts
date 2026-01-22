import Store from 'electron-store';

interface StoreType {
	auth: {
		lastActiveUserId?: string;
		lastLoginAt?: string;
	};
}

export const store = new Store<StoreType>({
	name: 'planme',
	defaults: {
		auth: {},
	},
});

console.log('Store path: ', store.path);
