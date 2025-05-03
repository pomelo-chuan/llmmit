const fs = require('fs');
const path = require('path');
const os = require('os');

const configFilePath = path.join(os.homedir(), '.llmmitrc');

// Define default configuration values
const defaultConfig = {
  openai_api_key: process.env.OPENAI_API_KEY || null, // Allow overriding via environment variable
  openai_base_url: null,
  openai_model: 'gpt-3.5-turbo',
  openai_temperature: 0.7,
  output_language: 'English', // Default output language
  ignorePatterns: [], // Default ignore patterns for git diff
  // Add any other default config values needed, e.g., from the old config.js
  // max_diff_length: 10000, // Example if git.js needed config
};

let userConfig = {};

try {
  if (fs.existsSync(configFilePath)) {
    const configFileContent = fs.readFileSync(configFilePath, 'utf-8');
    userConfig = JSON.parse(configFileContent);
    console.log(`Configuration loaded from ${configFilePath}`);
  } else {
    console.log(`Configuration file not found at ${configFilePath}. Using defaults.`);
    // Optionally, create a default config file if it doesn't exist
    // fs.writeFileSync(configFilePath, JSON.stringify(defaultConfig, null, 2));
    // console.log(`Created default configuration file at ${configFilePath}`);
  }
} catch (error) {
  console.error(`Error reading or parsing configuration file at ${configFilePath}:`, error);
  console.error('Using default configuration.');
}

// Merge default config with user config (user config takes precedence)
const finalConfig = { ...defaultConfig, ...userConfig };

// Validate essential configuration
if (!finalConfig.openai_api_key) {
  console.error("Error: OpenAI API Key is missing. Please set it in ~/.llmmitrc or as an environment variable OPENAI_API_KEY.");
  // process.exit(1); // Exit if the key is absolutely required upfront
}


module.exports = finalConfig; 