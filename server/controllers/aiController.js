import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Force dotenv to load right here just to be absolutely safe
dotenv.config();

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    // NEW: We read the key INSIDE the function so it catches the loaded .env file
    const apiKey = process.env.GEMINI_API_KEY;

    // HACKATHON FALLBACK
    if (!apiKey) {
      return res.status(200).json({ 
        success: true, 
        reply: "*(Simulated AI Response)*: I am the Swasth Setu Assistant! To make me fully functional, please add a `GEMINI_API_KEY` to your backend `.env` file." 
      });
    }

    // Initialize the AI SDK with the dynamically read key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // SYSTEM GUARDRAILS: Enforcing medical safety rules before appending the user's message
    const prompt = `
      You are the "Swasth Setu AI Assistant", an intelligent government healthcare guide for Indian citizens. 
      Your goal is to help citizens understand medical terminology, find hospital services, and navigate healthcare policies.

      CRITICAL SAFETY RULES:
      1. YOU ARE NOT A DOCTOR. 
      2. YOU MUST NEVER DIAGNOSE AN ILLNESS.
      3. YOU MUST NEVER PRESCRIBE MEDICATION.
      4. If a user asks for medical advice, gently remind them that you are an AI assistant and they should consult a verified doctor or visit a hospital.
      
      User Query: "${message}"
      
      Provide a helpful, concise, and professional response formatted cleanly in plain text or markdown.
    `;

    // Generate the response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    res.status(200).json({ 
      success: true, 
      reply: aiText 
    });

  } catch (error) {
    console.error("AI Generation Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "The AI Assistant encountered an error connecting to Gemini. Please check if your API key is valid." 
    });
  }
};