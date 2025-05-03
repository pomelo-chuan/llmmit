const { generateCommitMessage } = require('./ai_openai');
const fs = require('fs');
const path = require('path');
const config = require('./config_loader');

function getPromptTemplate() {
  const templatePath = path.resolve(__dirname, 'prompt_template.txt');
  return fs.readFileSync(templatePath, 'utf-8');
}

async function summarizeDiff(diff) {
  const promptTemplate = getPromptTemplate();
  const outputLanguage = config.output_language || 'English';

  const promptWithChanges = promptTemplate.replace('{{changes}}', diff);
  const finalPrompt = promptWithChanges.replace('{{language}}', outputLanguage);

  return generateCommitMessage(finalPrompt);
}

module.exports = { summarizeDiff }; 