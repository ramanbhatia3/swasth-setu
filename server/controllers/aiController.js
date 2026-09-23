import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { executeSearch } from './hospitalController.js';

dotenv.config();

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "Message is required." });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ 
        success: true, 
        reply: "*(Simulated AI Response)*: To make me functional, add a GEMINI_API_KEY to your backend .env file." 
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

      const prompt = `
        You are the "Swasth Setu AI Assistant", an intelligent government healthcare guide for Indian citizens.
        CRITICAL SAFETY RULES:
        1. YOU ARE NOT A DOCTOR.
        2. YOU MUST NEVER DIAGNOSE AN ILLNESS.
        3. YOU MUST NEVER PRESCRIBE MEDICATION.
        4. Suggest consulting verified doctors or hospitals for real medical emergencies.
        
        User Query: "${message}"
        
        Provide a helpful, concise, and professional response formatted cleanly in markdown.
      `;

      const result = await model.generateContent(prompt);
      res.status(200).json({ success: true, reply: result.response.text() });
    } catch (apiError) {
      console.warn("⚠️ Gemini API is busy (chat). Using fallback.");
      res.status(200).json({ success: true, reply: "I am experiencing high server demand right now. Please try asking again in a few moments, or use the hospital search feature directly!" });
    }
  } catch (error) {
    console.error("AI Generation Error:", error.message);
    res.status(500).json({ success: false, message: "The AI Assistant encountered a server error." });
  }
};

export const recommendHospital = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "Query is required" });

    // 1. Query verified registry sorted by highest success rate
    const searchResult = await executeSearch(message, '', '', null, 'successRate');

    if (searchResult.isInvalidQuery) {
      return res.status(200).json({
        success: true,
        reply: `⚠️ ${searchResult.message}`,
        hospital: null
      });
    }

    if (!searchResult.hospitals || searchResult.hospitals.length === 0) {
      return res.status(200).json({
        success: true,
        reply: "No hospital in the verified database matched all your specific regional and cost criteria. Try adjusting your query.",
        hospital: null
      });
    }

    // STRICTLY THE SINGLE BEST HOSPITAL (Index 0 = Highest Success Rate)
    const bestHospital = searchResult.hospitals[0];

    // HACKATHON FALLBACK TEMPLATE: If API key is missing OR Google throws 503, use this text automatically!
    const fallbackMarkdown = `### Top Recommended Hospital: **${bestHospital.name}**\n\n- **Location:** ${bestHospital.location.city}, ${bestHospital.location.state}\n- **Clinical Success Rate:** ${bestHospital.metrics?.successRate}%\n- **Patients Treated:** ${bestHospital.metrics?.successfulPatientsCount?.toLocaleString()}+\n- **Procedure Cost Range:** ₹${bestHospital.procedures?.[0]?.estimatedCost?.min?.toLocaleString()} - ₹${bestHospital.procedures?.[0]?.estimatedCost?.max?.toLocaleString()}\n\n*Selected as the #1 match based on highest clinical success rate in the requested region.*`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: true,
        reply: fallbackMarkdown,
        hospital: bestHospital
      });
    }

    // Try to use Google's API, but catch it if it fails!
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

      const prompt = `
        You are the Swasth Setu AI Healthcare Concierge. The citizen asked: "${message}"

        Our clinical database evaluated all hospitals and identified the SINGLE #1 BEST HOSPITAL:
        - Hospital Name: ${bestHospital.name}
        - Type: ${bestHospital.type}
        - Location: ${bestHospital.location.address}, ${bestHospital.location.city}, ${bestHospital.location.state}
        - Success Rate: ${bestHospital.metrics?.successRate}%
        - Verified Patients Successfully Treated: ${bestHospital.metrics?.successfulPatientsCount?.toLocaleString()}+
        - Key Specializations: ${bestHospital.specializations?.join(', ')}
        - Chronic Conditions Handled: ${bestHospital.chronicConditionsHandled?.join(', ')}
        - Sample Procedures & Pricing: ${bestHospital.procedures?.map(p => `${p.name}: ₹${p.estimatedCost?.min?.toLocaleString()} - ₹${p.estimatedCost?.max?.toLocaleString()}`).join('; ')}

        RULES:
        1. Deliver ONLY THIS SINGLE HOSPITAL recommendation. Do NOT mention second or third alternatives.
        2. Explain clearly why it is the definitive #1 choice.
        3. Format with bold headers and bullet points. Keep it clear, compassionate, and executive.
        4. Include an italic disclaimer at the end stating this is based on verified database metrics.
      `;

      const result = await model.generateContent(prompt);
      return res.status(200).json({
        success: true,
        reply: result.response.text(),
        hospital: bestHospital
      });

    } catch (apiError) {
      // GOOGLE 503 SERVER ERROR CAUGHT! Failsafe triggered.
      console.warn("⚠️ Gemini API is busy (503). Triggering Failsafe Fallback Template!");
      return res.status(200).json({
        success: true,
        reply: fallbackMarkdown,
        hospital: bestHospital
      });
    }

  } catch (error) {
    console.error("AI Recommendation Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate hospital recommendation." });
  }
};