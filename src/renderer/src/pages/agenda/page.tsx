import { useEffect } from 'react';
import { Button } from '../../components/ui/button';

export function AgendaPage() {
	async function handleShowNotificationTest() {
		const result = await window.notificationsApi.show({
			title: 'Test Notification',
			body: 'Test local notification on Electron',
			notificationId: 'notify-test-123',
		});

		console.log('notification result: ', result);
	}

	useEffect(() => {
		const unsubscribe = window.notificationsApi.onClick(({ notificationId }) => {
			console.log('Click on notification: ', notificationId);
		});

		return unsubscribe;
	}, []);

	return (
		<div>
			<h1>Agenda</h1>
			<p>Testing local notifications</p>

			<Button onClick={() => handleShowNotificationTest()}>Notification</Button>
		</div>
	);
}
