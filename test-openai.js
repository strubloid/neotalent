const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

// Simple test
app.get('/test-openai', async (req, res) => {
  try {
    console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('API Key preview:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT SET');
    
    const { OpenAI } = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hello" }],
      max_tokens: 10,
    });

    res.json({
      success: true,
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      error: error.message,
      type: error.type || 'unknown',
      code: error.code || 'unknown',
      status: error.status || 'unknown'
    });
  }
});

app.listen(3001, () => {
  console.log('Test server running on port 3001');
});
