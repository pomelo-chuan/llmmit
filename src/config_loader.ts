import fs from 'fs';
import path from 'path';
import os from 'os';

// Define the structure of the configuration
interface Config {
  openai_api_key: string | null;
  openai_base_url: string | null;
  openai_model: string;
  openai_temperature: number;
  output_language: string;
  ignorePatterns: string[];
  // Add any other config properties here
}

const configFilePath = path.join(os.homedir(), '.llmmitrc');

// Define default configuration values using the Config interface
const defaultConfig: Config = {
  openai_api_key: process.env.OPENAI_API_KEY || null,
  openai_base_url: null,
  openai_model: 'gpt-3.5-turbo',
  openai_temperature: 0.7,
  output_language: 'English',
  ignorePatterns: [],
};

let userConfig: Partial<Config> = {}; // User config might be incomplete

try {
  if (fs.existsSync(configFilePath)) {
    const configFileContent = fs.readFileSync(configFilePath, 'utf-8');
    userConfig = JSON.parse(configFileContent) as Partial<Config>; // Assert type after parsing
    console.log(`Configuration loaded from ${configFilePath}`);
  } else {
    console.log(`Configuration file not found at ${configFilePath}. Using defaults.`);
  }
} catch (error: any) { // Catch error as any or unknown
  console.error(`Error reading or parsing configuration file at ${configFilePath}:`, error);
  console.error('Using default configuration.');
}

// Merge defaults and user config, ensuring the final type is Config
const finalConfig: Config = { ...defaultConfig, ...userConfig };

if (!finalConfig.openai_api_key) {
  console.error("Error: OpenAI API Key is missing. Please set it in ~/.llmmitrc or as an environment variable OPENAI_API_KEY.");
  // Consider throwing an error or exiting if the key is crucial
}


export default finalConfig; 