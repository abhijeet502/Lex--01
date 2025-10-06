// /api/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: OPENAI_API_KEY is missing.' });
    }

    const { messages } = req.body;
    const systemPrompt = {
        role: "system",
        content: "You are Lex 01, a cheerful AI assistant named after Abhi's dog. Answer questions about Abhi's projects, skills, and tech stack. Keep responses friendly, concise, and positive. Occasionally use emojis like 🐾💖✨."
    };

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [systemPrompt, ...messages],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        // Handle rate limit
        if (response.status === 429) {
            return res.status(429).json({ response: "🚨 OpenAI rate limit reached. Please wait 1 minute before trying again." });
        }

        // Handle other errors
        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ response: `🚨 OpenAI API error: ${errorText.substring(0,100)}...` });
        }

        const data = await response.json();
        const botMessage = data.choices?.[0]?.message?.content || "Lex 01 is having a hard time focusing! Please ask again. 🐾";
        res.status(200).json({ response: botMessage });

    } catch (err) {
        console.error("Serverless function error:", err);
        res.status(500).json({ response: "🚨 Lex 01 encountered an unexpected error. Try again in a few seconds." });
    }
}
