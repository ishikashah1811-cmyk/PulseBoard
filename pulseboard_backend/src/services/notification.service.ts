/**
 * Sends push notifications to users via Expo's Push API.
 * No SDK needed — plain HTTP POST.
 */
export async function sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data: Record<string, any> = {}
): Promise<void> {
    if (!expoPushToken?.startsWith('ExponentPushToken')) return;

    try {
        const res = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: expoPushToken,
                sound: 'default',
                title,
                body,
                data,
            }),
        });
        const json = await res.json();
        console.log(`[Notifications] Sent "${title}" → status: ${json?.data?.status} ticket: ${json?.data?.id}`);
    } catch (err) {
        console.error('[Notifications] Failed to send push:', (err as Error).message);
    }
}
