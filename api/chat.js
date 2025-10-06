export default async function handler(req,res){
    try{
        if(req.method!=='POST') return res.status(405).json({error:'Method Not Allowed'});

        const apiKey=process.env.OPENAI_API_KEY;
        if(!apiKey) return res.status(500).json({error:'OPENAI_API_KEY missing in server config'});

        const {messages}=req.body;
        const systemPrompt={
            role:"system",
            content:"You are Lex 01, a cheerful AI assistant named after Abhi's dog. Answer questions about Abhi's projects, skills, tech stack. Use friendly tone, paw 🐾 or heart/shine 💖✨ emojis occasionally. Keep responses concise and relevant."
        };

        const response=await fetch('https://api.openai.com/v1/chat/completions',{
            method:'POST',
            headers:{'Content
