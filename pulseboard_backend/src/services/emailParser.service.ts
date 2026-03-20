import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ParsedEvent {
    title: string;
    description: string;
    date: Date;
    timeDisplay: string;
    location: string;
    badge: 'LIVE' | 'UPCOMING';
    icon: string;
    color: string;
}

/**
 * Uses Gemini AI to parse any freeform email into structured event data.
 * Falls back to sensible defaults if fields are missing.
 */
export async function parseEventFromEmail(
    subject: string,
    body: string
): Promise<ParsedEvent> {
    const prompt = `
You are an event extraction AI for a college club notification app called PulseBoard.

Given an email with the following subject and body, extract event information and respond ONLY with a valid JSON object — no markdown, no explanation, just raw JSON.

Subject: ${subject}
Body: ${body}

Extract these fields:
- title: The event name (use subject if no explicit title, strip prefixes like [EVENT])
- description: A short 1-2 sentence description of the event
- date: The event date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ). If no year is mentioned, assume 2026. If no date is found, use tomorrow's date.
- timeDisplay: Human readable time like "6:00 PM" or "10:30 AM". If not found, use "TBD"
- location: Venue or room. If not found, use "TBD"
- badge: "LIVE" if the event is happening right now, otherwise "UPCOMING"
- icon: A single relevant emoji for the event type (e.g. 🎤 for talk, 🏆 for competition, 💻 for hackathon, 🎉 for party, 🎭 for cultural, 📚 for academic)
- color: A vibrant hex color code that suits the event theme (e.g. "#6366F1" for tech, "#F59E0B" for cultural, "#10B981" for sports)

Respond ONLY with JSON like this:
{
  "title": "...",
  "description": "...",
  "date": "2026-03-10T18:00:00.000Z",
  "timeDisplay": "6:00 PM",
  "location": "...",
  "badge": "UPCOMING",
  "icon": "💻",
  "color": "#6366F1"
}
`;

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Strip markdown code fences if Gemini wraps in ```json ... ```
        const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        const parsed = JSON.parse(clean);

        return {
            title: parsed.title || subject || 'Untitled Event',
            description: parsed.description || '',
            date: new Date(parsed.date) || new Date(Date.now() + 86400000),
            timeDisplay: parsed.timeDisplay || 'TBD',
            location: parsed.location || 'TBD',
            badge: parsed.badge === 'LIVE' ? 'LIVE' : 'UPCOMING',
            icon: parsed.icon || '📅',
            color: parsed.color || '#CCF900',
        };
    } catch (err) {
        console.error('[EmailParser] Gemini failed, using smart regex fallback:', (err as Error).message.slice(0, 100));
        return smartRegexParse(subject, body);
    }
}

/**
 * Smart regex-based fallback when Gemini is unavailable.
 * Extracts time, location, date, and icon from any email body.
 */
function smartRegexParse(subject: string, body: string): ParsedEvent {
    const text = `${subject} ${body}`;

    // --- Extract TIME ---
    const timeMatch = text.match(/\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\b/);
    const timeDisplay = timeMatch ? timeMatch[1].trim() : 'TBD';

    // --- Extract LOCATION ---
    const locationMatch = text.match(
        /(?:at|in|venue[:\s]+|location[:\s]+|room[:\s]+|held at)\s+([A-Za-z0-9\s\-,]+?)(?:\.|,|\n|for|on|at \d|$)/i
    ) || text.match(/\b(LT[-\s]?\d+|(?:Lecture|Lab|Hall|Room|Auditorium|Seminar)\s*[-\s]?\w+|SAC|Main Building|OAT)\b/i);
    const location = locationMatch ? locationMatch[1].trim() : 'TBD';

    // --- Extract DATE ---
    const months = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
    const dateMatch = text.match(new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${months}),?\\s*(\\d{4})?`, 'i'))
        || text.match(new RegExp(`(${months})\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s*(\\d{4})?`, 'i'))
        || text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);

    let date = new Date(Date.now() + 86400000); // default: tomorrow
    if (dateMatch) {
        const parsed = new Date(dateMatch[0]);
        if (!isNaN(parsed.getTime())) date = parsed;
    }

    // --- Pick ICON based on keywords ---
    const lc = text.toLowerCase();
    let icon = '📅';
    if (/hackathon|code|coding|dev|software/i.test(lc)) icon = '💻';
    else if (/fest|festival|cultural|dance|music|sing|perform/i.test(lc)) icon = '🎭';
    else if (/talk|lecture|speaker|seminar|keynote/i.test(lc)) icon = '🎤';
    else if (/competition|compete|contest|prize|award|winner/i.test(lc)) icon = '🏆';
    else if (/sport|cricket|football|basketball|game|tournament/i.test(lc)) icon = '⚽';
    else if (/workshop|learn|training|bootcamp/i.test(lc)) icon = '🛠️';
    else if (/party|celebrat|social|hangout/i.test(lc)) icon = '🎉';

    // --- Pick COLOR based on keywords ---
    let color = '#CCF900';
    if (/hackathon|tech|code|dev|software/i.test(lc)) color = '#6366F1';
    else if (/cultural|fest|art|music|dance/i.test(lc)) color = '#F59E0B';
    else if (/sport|game|tournament/i.test(lc)) color = '#10B981';
    else if (/talk|lecture|seminar/i.test(lc)) color = '#3B82F6';

    return {
        title: subject || 'Untitled Event',
        description: body.slice(0, 300),
        date,
        timeDisplay,
        location,
        badge: 'UPCOMING',
        icon,
        color,
    };
}
