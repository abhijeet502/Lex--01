export default async function handler(req,res){
  try{
    if(req.method!=='POST') return res.status(405).json({error:'Method Not Allowed'});

    const apiKey=process.env.OPENAI_API_KEY;
    if(!apiKey) return res.status(500).json({error:'OPENAI_API_KEY missing'});

    const { messages } = req.body;
    if(!messages) return res.status(400).json({error:'Missing messages in request'});

    const systemPrompt = {
      role: "system",
      content: "You are Lex 01, a cheerful AI assistant named after Abhi's dog. Answer questions about Abhi's projects, skills, tech stack. Use friendly tone, paw 🐾 or heart/shine 💖✨ emojis occasionally. Keep responses concise and relevant."
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model:"gpt-3.5-turbo",
        messages:[systemPrompt,...messages],
        max_tokens:300,
        temperature:0.7
      })
    });

    let data;
    try { data = await response.json(); } 
    catch(e){ return res.status(500).json({error:'OpenAI returned non-JSON response'}); }

    if(!response.ok) return res.status(response.status).json({error:data.error || 'OpenAI API error'});

    const botMessage = data.choices?.[0]?.message?.content || "Lex 01 is having trouble responding! 🐾";

    res.status(200).json({response: botMessage});

  }catch(error){
    console.error(error);
    res.status(500).json({error: error.message || 'Unexpected server error'});
  }
}
