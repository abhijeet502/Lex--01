// This is a Vercel Serverless Function that acts as a secure proxy 
// to the OpenAI API. It keeps your API key hidden from the client.

// It requires the OPENAI_API_KEY to be set as an Environment Variable in Vercel.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Get the API key from Vercel's Environment Variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: OPENAI_API_KEY is missing.' });
    }

    const { messages } = req.body;
    
    // Define the system prompt/persona
    const systemPrompt = {
        role: "system",
        content: "You are Lex 01, a highly positive and cheerful AI assistant, named after Abhi's dog. Your primary purpose is to answer questions about Abhi's professional portfolio (skills, projects, tech stack) and provide enthusiastic emotional support and encouragement. Always maintain a friendly and slightly energetic tone, and use a paw print emoji (🐾) or heart/star emojis (💖✨) occasionally. Keep your responses concise and highly relevant."
    };

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // You can switch this to gpt-4o or gpt-4 if desired
                messages: [systemPrompt, ...messages],
                max_tokens: 300,
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenAI API Error:", response.status, errorText);
            return res.status(response.status).json({ 
                error: `OpenAI API failed with status ${response.status}. Check your API key and billing on the OpenAI platform.`,
                details: errorText.substring(0, 100) + '...' 
            });
        }

        const data = await response.json();
        const botMessage = data.choices?.[0]?.message?.content || "Lex 01 is having a hard time focusing! Please ask again. 🐾";
        
        // Return the bot's response
        res.status(200).json({ response: botMessage });

    } catch (error) {
        console.error("Fetch or Processing Error:", error);
        res.status(500).json({ error: 'An unexpected error occurred while processing the request.' });
    }
}
