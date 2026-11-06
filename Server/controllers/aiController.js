
import { runAgent } from "../services/agentService.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    // Validate the customer's message.
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a message.",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Your message is too long.",
      });
    }

    // Send the customer's message to our AI agent.
    const reply = await runAgent(message);

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("AI chat error:", error);

    return res.status(500).json({
      success: false,
      message: "Sorry, something went wrong with the AI assistant.",
    });
  }
};
