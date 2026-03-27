import { Request, Response } from "express";
import User from "../models/User.model";
import { getGoogleClient } from "../utils/googleClient";

export const getUserEmails = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const user = await User.findById(userId);

        if (!user || (!user.googleAccessToken && !user.googleRefreshToken)) {
            return res.status(400).json({ message: "No Google access token found. Please re-contine with Google." });
        }

        let accessToken = user.googleAccessToken;

        // First try fetching with the current access token
        let response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15&labelIds=INBOX", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        // If unauthorized (401), and we have a refresh token, let's refresh it
        if (response.status === 401 && user.googleRefreshToken) {
            console.log(`[UserEmail] Token expired for user ${user.email}, refreshing...`);
            const client = getGoogleClient();
            client.setCredentials({ refresh_token: user.googleRefreshToken });

            const { credentials } = await client.refreshAccessToken();
            accessToken = credentials.access_token as string;

            // Save new access token to DB
            user.googleAccessToken = accessToken;
            await user.save();

            // Retry the original request
            response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15&labelIds=INBOX", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gmail API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const messages = data.messages || [];

        // Fetch details for each message (subject, from, snippet)
        const emailDetails = await Promise.all(
            messages.map(async (msg: any) => {
                const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const detailData = await detailRes.json();

                const subjectHeader = detailData.payload?.headers?.find((h: any) => h.name.toLowerCase() === 'subject');
                const fromHeader = detailData.payload?.headers?.find((h: any) => h.name.toLowerCase() === 'from');

                // Clean up the from header (e.g. "Name <email@example.com>" -> "Name")
                let from = fromHeader ? fromHeader.value : 'Unknown Sender';
                if (from.includes('<')) {
                    from = from.split('<')[0].trim();
                }

                return {
                    id: msg.id,
                    threadId: msg.threadId,
                    snippet: detailData.snippet,
                    subject: subjectHeader ? subjectHeader.value : '(No Subject)',
                    from: from,
                    // internalDate is a string in milliseconds
                    date: new Date(parseInt(detailData.internalDate)).toISOString()
                };
            })
        );

        res.json({ emails: emailDetails });
    } catch (error: any) {
        console.error("[UserEmail] Error fetching user emails:", error);
        res.status(500).json({ message: "Failed to fetch emails", error: error.message });
    }
};
