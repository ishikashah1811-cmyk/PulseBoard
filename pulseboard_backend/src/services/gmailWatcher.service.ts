import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import Club from '../models/Club.model';
import Event from '../models/Event.model';
import { parseEventFromEmail } from './emailParser.service';

let isRunning = false;

async function checkNewEmails() {
    const user = process.env.GMAIL_WATCHER_USER;
    const password = process.env.GMAIL_APP_PASSWORD;

    if (!user || !password) return;

    const client = new ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: { user, pass: password },
        logger: false,
    });

    try {
        await client.connect();

        const lock = await client.getMailboxLock('INBOX');
        try {
            // Search for unread messages within the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const unseenUids = await client.search({
                seen: false,
                since: sevenDaysAgo
            });
            const uidList = Array.isArray(unseenUids) ? unseenUids : [];

            if (uidList.length === 0) {
                console.log('[GmailWatcher] No new emails.');
                return;
            }

            console.log(`[GmailWatcher] Found ${uidList.length} unread email(s) from the last 7 days`);

            for (const uid of uidList) {
                try {
                    const msgData = await client.fetchOne(String(uid), { source: true }, { uid: true });
                    if (!msgData || !('source' in msgData) || !msgData.source) continue;

                    const parsed = await simpleParser(msgData.source as Buffer);
                    const from = parsed.from?.value?.[0]?.address?.toLowerCase() || '';
                    const subject = parsed.subject || '';
                    const bodyText = parsed.text || '';

                    console.log(`[GmailWatcher] From: ${from} | Subject: "${subject}"`);

                    // Always mark as read to avoid reprocessing
                    await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true });

                    // Match sender to a registered club
                    const club = await Club.findOne({ email: from });
                    if (!club) {
                        console.log(`[GmailWatcher] Skipping — no club for: ${from}`);
                        continue;
                    }

                    console.log(`[GmailWatcher] Matched club: ${club.name}`);

                    const eventData = await parseEventFromEmail(subject, bodyText);

                    // --- ANTI-DUPLICATION CHECK ---
                    // Check if this club already created an event with this title in the last 24 hours
                    const yesterday = new Date();
                    yesterday.setHours(yesterday.getHours() - 24);

                    const existingEvent = await Event.findOne({
                        clubId: club.clubId,
                        title: eventData.title,
                        createdAt: { $gte: yesterday }
                    });

                    if (existingEvent) {
                        console.log(`[GmailWatcher] ⚠️ Skipped duplicate event: "${eventData.title}" for ${club.name}`);
                        continue;
                    }
                    // ------------------------------

                    const newEvent = new Event({
                        clubId: club.clubId,
                        title: eventData.title,
                        description: eventData.description,
                        date: eventData.date,
                        timeDisplay: eventData.timeDisplay,
                        location: eventData.location,
                        badge: eventData.badge,
                        icon: eventData.icon,
                        color: eventData.color,
                    });

                    await newEvent.save();
                    console.log(`[GmailWatcher] ✅ Event created: "${newEvent.title}" for ${club.name}`);

                } catch (emailErr) {
                    console.error(`[GmailWatcher] Error on UID ${uid}:`, (emailErr as Error).message);
                }
            }
        } finally {
            lock.release();
        }

        await client.logout();
    } catch (err) {
        console.error('[GmailWatcher] IMAP error:', (err as Error).message);
        try { await client.logout(); } catch (_) { }
    }
}

export function startGmailWatcher(intervalMs = 60_000) {
    if (isRunning) return;
    isRunning = true;

    const user = process.env.GMAIL_WATCHER_USER;
    if (!user || !process.env.GMAIL_APP_PASSWORD) {
        console.warn('[GmailWatcher] Not started — add GMAIL_WATCHER_USER + GMAIL_APP_PASSWORD to .env');
        return;
    }

    console.log(`[GmailWatcher] 🚀 Watching ${user} every ${intervalMs / 1000}s`);
    checkNewEmails();
    setInterval(checkNewEmails, intervalMs);
}
