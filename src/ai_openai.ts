import { OpenAI } from 'openai';
import config from './config_loader.js'; // Default import
import { ChatCompletionMessage, ChatCompletion } from 'openai/resources/chat/completions'; // Import specific types

// Interface for the expected arguments from the AI function call
export interface CommitMessageArgs {
  type: "build" | "chore" | "ci" | "docs" | "feat" | "fix" | "perf" | "refactor" | "revert" | "style" | "test";
  scope?: string | null;
  title: string;
  description?: string[];
}

// Define the function schema for commit message generation (using 'as const' for better type inference)
const commitMessageFunction = {
  name: "generate_commit_message",
  description: "Generate a structured git commit message based on code changes, following specific formatting rules.",
  parameters: {
    type: "object",
    properties: {
      type: {
        type: "string",
        description: "Select the appropriate commit type from the allowed list (build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test).",
        enum: ["build", "chore", "ci", "docs", "feat", "fix", "perf", "refactor", "revert", "style", "test"] as const // Use 'as const'
      },
      scope: {
        type: ["string", "null"],
        description: "Specify the affected area/scope of the change. Use null if not applicable.",
      },
      title: {
        type: "string",
        description: "A concise and clear summary of the change (max 50 chars, 简体中文). Proper nouns remain in English.",
      },
      description: {
        type: "array",
        description: "Optional array of concise points summarizing changes (0-5 points, max 50 chars each, 简体中文). Proper nouns remain in English.",
        items: {
          type: "string"
        }
      }
    },
    required: ["type", "title"]
  }
} as const; // Use 'as const' on the whole object

// Ensure API key exists before creating the client
if (!config.openai_api_key) {
  throw new Error("OpenAI API Key is missing. Cannot initialize OpenAI client.");
}

const openai = new OpenAI({
  apiKey: config.openai_api_key, // Now guaranteed to be a string
  baseURL: config.openai_base_url ?? undefined,
  defaultHeaders: {
    'X-Title': 'llmmit',
    'HTTP-Referer': 'https://github.com/pomelo-chuan/llmmit',
  }
});

async function generateCommitMessage(prompt: string): Promise<CommitMessageArgs> {
  // Type the response from OpenAI API
  const response: ChatCompletion = await openai.chat.completions.create({
    model: config.model,
    messages: [{ role: 'user', content: prompt }],
    tools: [{ type: "function", function: commitMessageFunction }], // Use tools
    tool_choice: { type: "function", function: { name: commitMessageFunction.name } }, // Use tool_choice
    temperature: config.temperature,
  });

  // Check if response.choices exists and is not empty
  if (!response.choices || response.choices.length === 0) {
    const errorMsg = 'OpenAI API did not return any choices.';
    console.error(errorMsg, 'Full API Response:', response);
    throw new Error(errorMsg + ' Full API Response: ' + JSON.stringify(response));
  }

  const message: ChatCompletionMessage = response.choices[0].message;

  // Check if the model made tool calls
  if (message.tool_calls && message.tool_calls[0]?.function?.arguments) {
    const toolCall = message.tool_calls[0]; // Assuming one tool call
    if (toolCall.function.name === commitMessageFunction.name) {
        try {
            // Parse the arguments string from the tool call
            const functionArgs = JSON.parse(toolCall.function.arguments) as CommitMessageArgs;
            // Basic validation after parsing
            if (functionArgs && commitMessageFunction.parameters.properties.type.enum.includes(functionArgs.type) && functionArgs.title) {
                return functionArgs;
            }
            console.error('Parsed function call arguments do not match expected structure:', functionArgs);
        } catch (e: unknown) { // Use unknown for caught errors
            console.error('AI tool call arguments parsing failed:', e);
            console.error('Raw arguments:', toolCall.function.arguments);
            // Fall through to check content as a backup
        }
    }
  }

  // If tool_calls failed or wasn't present/valid, try parsing content
  if (message.content) {
    try {
      // Try to extract JSON from the content (avoiding 's' flag)
      const contentJsonMatch = message.content.match(/```json\n([^]*?)\n```/);
      const jsonToParse = contentJsonMatch ? contentJsonMatch[1] : message.content;
      const contentArgs = JSON.parse(jsonToParse.trim()) as CommitMessageArgs;
      // Basic validation to ensure it looks like our expected structure
      if (contentArgs && commitMessageFunction.parameters.properties.type.enum.includes(contentArgs.type) && contentArgs.title) {
          return contentArgs;
      }
       console.error('Parsed content JSON does not match expected structure:', contentArgs);
    } catch (e: unknown) {
        // If content parsing fails, it wasn't the expected JSON
        console.error("Failed to parse JSON from message.content:", e);
        console.error("Raw content:", message.content);
    }
  }

  // If neither tool_calls nor content yielded the expected structure
  const errorMsg = 'AI did not return the expected tool call or valid JSON content.';
  console.error(errorMsg, 'Response Message:', message);
  throw new Error(errorMsg + ' Response: ' + JSON.stringify(message));
}

export { generateCommitMessage }; 