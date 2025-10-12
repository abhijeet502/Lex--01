// api/chat.js - Vercel Serverless Function (Node.js)
// This proxies requests to Groq API, hiding the key with env vars.

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get user message and history from body
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Groq config (key from Vercel env var - secure!)
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const GROQ_MODEL = 'llama3-8b-8192';  // Fast, free model

    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        // Build history: System prompt + provided history + new message
        let conversationHistory = [
            { 
                role: 'system', 
                content: 'You are Lex 01, a friendly AI assistant named after Abhi\'s dog. You specialize in discussing Abhi\'s skills (React, Next.js, Tailwind, Node.js, MongoDB), projects (e.g., Writer\'s Quote Generator, E-commerce platform), problem-solving, coding concepts, and chit-chat. Keep responses engaging, helpful, and on-topic. Use bold for emphasis like **this**. End with questions to continue the conversation if appropriate. Be fun and positive!' 
            }
        ];

        // Add client history (limit to avoid token overflow)
        if (history && Array.isArray(history)) {
            conversationHistory = conversationHistory.concat(history.slice(-20));  // Last 10 turns max
        }

        // Add current user message
        conversationHistory.push({ role: 'user', content: message });

        // Call Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: conversationHistory,
                max_tokens: 500,  // Limit response length
                temperature: 0.7  // Balanced responses
            })
        });

        if (!response.ok) {
            if (response.status === 429) {
                return res.status(429).json({ error: 'Rate limit reached. Please wait and try again.' });
            }
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        const botReply =
