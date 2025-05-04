import { OpenAI } from 'openai';
import config from './config_loader'; // Default import
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
});

async function generateCommitMessage(prompt: string): Promise<CommitMessageArgs> {
  // Type the response from OpenAI API
  const response: ChatCompletion = await openai.chat.completions.create({
    model: config.openai_model,
    messages: [{ role: 'user', content: prompt }],
    functions: [commitMessageFunction],
    function_call: { name: commitMessageFunction.name }, // Force calling the function
    temperature: config.openai_temperature,
  });

  const message: ChatCompletionMessage = response.choices[0].message;

  // Check if the model wanted to call the function
  if (message.function_call && message.function_call.arguments) {
    try {
      // Parse the arguments string into a JSON object and assert its type
      const functionArgs = JSON.parse(message.function_call.arguments) as CommitMessageArgs;
      // Basic validation after parsing
      if (functionArgs && commitMessageFunction.parameters.properties.type.enum.includes(functionArgs.type) && functionArgs.title) {
          return functionArgs;
      }
      console.error('Parsed function call arguments do not match expected structure:', functionArgs);
    } catch (e: unknown) { // Use unknown for caught errors
      console.error('AI function call arguments parsing failed:', e);
      console.error('Raw arguments:', message.function_call.arguments);
      // Fall through to check content as a backup
    }
  }

  // If function_call failed or wasn't present/valid, try parsing content
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

  // If neither function_call nor content yielded the expected structure
  const errorMsg = 'AI did not return the expected function call or valid JSON content.';
  console.error(errorMsg, 'Response Message:', message);
  throw new Error(errorMsg + ' Response: ' + JSON.stringify(message));
}

export { generateCommitMessage }; 