const { OpenAI } = require('openai');
const config = require('./config_loader'); // 使用新的配置加载器

// Define the function schema for commit message generation
const commitMessageFunction = {
  name: "generate_commit_message",
  description: "Generate a structured git commit message based on code changes, following specific formatting rules.",
  parameters: {
    type: "object",
    properties: {
      type: {
        type: "string",
        description: "Select the appropriate commit type from the allowed list (build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test).",
        enum: ["build", "chore", "ci", "docs", "feat", "fix", "perf", "refactor", "revert", "style", "test"]
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
};

const openai = new OpenAI({
  apiKey: config.openai_api_key,
  baseURL: config.openai_base_url,
});

async function generateCommitMessage(prompt) {
  const response = await openai.chat.completions.create({
    model: config.openai_model,
    messages: [{ role: 'user', content: prompt }],
    functions: [commitMessageFunction],
    function_call: { name: commitMessageFunction.name }, // Force calling the function
    temperature: config.openai_temperature,
  });

  const message = response.choices[0].message;

  // Check if the model wanted to call the function
  if (message.function_call) {
    try {
      // Parse the arguments string into a JSON object
      const functionArgs = JSON.parse(message.function_call.arguments);
      return functionArgs; // Return the parsed JSON object
    } catch (e) {
      console.error('AI function call arguments parsing failed:', e);
      console.error('Raw arguments:', message.function_call.arguments);
      // Fall through to check content as a backup
    }
  }

  // If function_call failed or wasn't present, try parsing content
  if (message.content) {
    try {
      // Try to extract JSON from the content
      // Models might wrap JSON in ```json ... ``` or just return the raw JSON string
      const contentJsonMatch = message.content.match(/```json\n(.+?)\n```/s);
      const jsonToParse = contentJsonMatch ? contentJsonMatch[1] : message.content;
      const contentArgs = JSON.parse(jsonToParse.trim());
      // Basic validation to ensure it looks like our expected structure
      if (contentArgs && contentArgs.type && contentArgs.title) {
          return contentArgs;
      }
    } catch (e) {
        // If content parsing fails, it wasn't the expected JSON
        console.error("Failed to parse JSON from message.content:", e);
        console.error("Raw content:", message.content);
    }
  }

  // If neither function_call nor content yielded the expected structure
  throw new Error('AI did not return the expected function call or valid JSON content. Response: ' + JSON.stringify(message));
}

module.exports = { generateCommitMessage }; 