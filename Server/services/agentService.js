
import groq, { GROQ_MODEL } from "../config/groq.js";
import { getMenu } from "./menuTool.js";

// The tools the AI is allowed to request.
const tools = [
  {
    type: "function",
    function: {
      name: "getMenu",
      description:
        "Search the restaurant's currently available food and drinks. Use this when a customer asks about menu items, prices, categories, or food recommendations.",
      parameters: {
        type: "object",
        properties: {
          search: {
            type: "string",
            description: "Optional food or drink name to search for.",
          },
          section: {
            type: "string",
            enum: ["FOOD", "DRINK"],
            description: "Optional menu section.",
          },
          category: {
            type: "string",
            description: "Optional category name.",
          },
          maxPrice: {
            type: "number",
            description: "Maximum price in ETB.",
          },
          limit: {
            type: "integer",
            minimum: 1,
            maximum: 30,
            description: "Maximum number of menu items to return.",
          },
        },
        additionalProperties: false,
      },
    },
  },
];

// Only functions explicitly registered here can execute.
const availableFunctions = {
  getMenu,
};


const SYSTEM_PROMPT = `
You are Terteb AI, a friendly, intelligent restaurant assistant.

PERSONALITY:
- Speak naturally, warmly, and conversationally.
- Be helpful without sounding robotic.
- Keep answers clear and easy to read.
- Avoid unnecessary repetition.

MENU INFORMATION:
- Always use getMenu when answering questions about actual menu items, prices, availability, or recommendations.
- Only recommend items returned by getMenu.
- Never invent food names, prices, descriptions, ingredients, or availability.
- All prices are in Ethiopian Birr (ETB).

RESPONSE FORMATTING:
- When asked what is on the menu, list food names and prices.
- Include a short description for each item when available.
- When asked about a specific item, provide its description, price, and category when available.
- When recommending food, briefly explain why each recommendation matches the customer's request.
- Use readable bullet points rather than raw JSON.
- Do not overwhelm customers with unnecessary information.

PRIVACY:
- NEVER reveal database IDs, internal identifiers, raw JSON, tool calls, or technical implementation details.
- Never expose internal database information to customers.

ACCURACY:
- If a description or ingredient is missing, do not invent one.
- If no matching items are found, politely explain that.
- If information is unavailable, be honest about it.
- Never claim an item is popular unless the available data supports that claim.

CONVERSATION:
- Ask relevant follow-up questions when necessary.
- Understand the customer's intent before recommending food.
- Do not create or submit orders. You currently have read-only menu access.

Your goal is to make every customer interaction feel like speaking with a knowledgeable restaurant assistant.
OUTPUT FORMATTING:
- Use plain text only.
- Never use Markdown formatting.
- Never use **, *, #, backticks, or other Markdown symbols.
- For menu lists, ALWAYS use numbered lists.
- Format each menu item as: 1. Food Name – Price ETB
- Put each menu item on a separate line.
- Do not wrap food names or prices in bold or italics.
- Keep responses clean and readable.
LANGUAGE AND COMMUNICATION:
- Support both Amharic and English.
- Automatically detect the language used by the customer.
- If the customer speaks Amharic, respond naturally in Amharic using Ethiopic script (አማርኛ).
- If the customer speaks English, respond in English.
- If the customer mixes Amharic and English, respond naturally using the dominant language.
- Do not translate food names, restaurant names, or menu item names unnecessarily.
- Use natural, friendly, culturally appropriate Ethiopian Amharic.
- Avoid overly formal, robotic, or literal translations.
- Keep responses short, warm, and conversational.
`;


export const runAgent = async (userMessage) => {
  if (typeof userMessage !== "string" || !userMessage.trim()) {
    throw new Error("A customer message is required.");
  }

  if (userMessage.length > 2000) {
    throw new Error("Customer message is too long.");
  }

  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: userMessage.trim(),
    },
  ];

  // Prevent endless tool-calling loops.
  const MAX_TOOL_ROUNDS = 4;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      tools,
      tool_choice: "auto",
      parallel_tool_calls: false,
      temperature: 0.2,
    });

    const assistantMessage = completion.choices[0]?.message;

    if (!assistantMessage) {
      throw new Error("The AI returned an empty response.");
    }

    // Save the AI response, including any tool-call request.
    messages.push(assistantMessage);

    const toolCalls = assistantMessage.tool_calls;

    // No tool requested: the AI has produced its final answer.
    if (!toolCalls || toolCalls.length === 0) {
      return assistantMessage.content || "I'm sorry, I couldn't generate a response.";
    }

    // Execute each requested tool through our own allowlist.
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToExecute = availableFunctions[functionName];

      if (!functionToExecute) {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            error: "This tool is not available.",
          }),
        });

        continue;
      }

      let toolResult;

      try {
        const argumentsObject = JSON.parse(
          toolCall.function.arguments || "{}"
        );

        toolResult = await functionToExecute(argumentsObject);
      } catch (error) {
        toolResult = {
          error: error.message || "Tool execution failed.",
        };
      }

      // Send the actual tool result back to the AI.
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult),
      });
    }
  }

  return "I couldn't complete that request. Please try asking in a different way.";
};
