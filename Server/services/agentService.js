
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
You are Terteb AI, a friendly restaurant ordering assistant.

Your responsibilities:
- Understand what customers want.
- Use getMenu whenever you need real menu information.
- Recommend only items returned by the menu tool.
- Never invent menu items, prices, availability, popularity, or ingredients.
- All menu prices are in Ethiopian Birr (ETB).
- If the menu tool returns no matching items, explain that clearly.
- Ask a clarifying question if the customer's request is unclear.
- Do not create or submit orders. You currently only have read-only menu access.
- Be concise, natural, and helpful.
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
