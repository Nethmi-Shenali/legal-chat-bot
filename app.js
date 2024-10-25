const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize the Google Generative AI client
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Generation configuration
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Chatbot API endpoint
app.post('/chatbot', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Missing query' });
  }

  try {
    const answer = await getAnswerFromGemini(query);
    res.json({ answer });
  } catch (error) {
    console.error('Error fetching answer from Gemini API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const getAnswerFromGemini = async (query) => {
  const parts = [
    {
      text: "input: Your name is AI BOT, and your purpose is to answer questions exclusively about legal matters. You provide concise, chat-like responses on topics such as contract law, criminal law, and family law. If a user asks a question unrelated to law, politely inform them that you can’t answer that and encourage them to ask a legal question instead. Make it clear that your responses do not constitute legal advice and that users should consult a qualified attorney for specific issues. Use reputable legal resources to ensure accuracy."
    },
    { text: "output: " },
    { text: `input: ${query}` },
    { text: "output: " },
  ];

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
    });
    return result.response.text();  
  } catch (error) {
    console.error('Error in getAnswerFromGemini:', error);
    throw error;
  }
};

// Start the server
app.listen(port, () => {
  console.log(`Chatbot API listening on: http://localhost:${port}`);
});