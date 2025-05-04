import { generateCommitMessage, CommitMessageArgs } from './ai_openai';
import fs from 'fs';
import path from 'path';
import config from './config_loader';

// Embed the prompt template directly
const promptTemplateContent = `# Role
You are a professional developer, highly skilled in writing git commit messages.

# Task
Your task is to generate a concise and clear commit message based on the provided changes.

# Output Format
- You must output a JSON object following this structure without any irrelevant symbol:
{
  "type": string,
  "scope": string | null,
  "title": string,
  "description": string[]
}
- Value output in 简体中文

# Language
- Generate the \`title\` and \`description\` fields in the following language: {{language}}
- Proper nouns should generally remain in their original language (e.g., English for function names, libraries).

# Output explain

## type
Select the appropriate commit type based on the changes. Use one of the following values:
- build: Build system or dependency updates.
- chore: Tasks or config changes.
- ci: CI updates.
- docs: Documentation changes.
- feat: New features.
- fix: Bug fixes.
- perf: Performance improvements.
- refactor: Code restructuring.
- revert: Revert a commit.
- style: Code style changes.
- test: Test updates.

## scope
A string specifying the affected area or scope of the change. If no specific scope is applicable, use \`null\`.

## title
- A concise and clear summary of the change.
- Must be under 50 characters.
- Must be in the language specified in the # Language section.

## description
- An optional array of strings summarizing the changes.
- Each point should be concise, summarizing a specific aspect of the modification.
- Total number of points: 0-5.
- Each point max 50 characters.
- Must be in the language specified in the # Language section.

# Changes
{{changes}}`;

function getPromptTemplate(): string {
  // Return the embedded content directly
  return promptTemplateContent;
}

async function summarizeDiff(diff: string): Promise<CommitMessageArgs> {
  const promptTemplate = getPromptTemplate();
  const outputLanguage: string = config?.output_language || 'English';

  const promptWithChanges = promptTemplate.replace('{{changes}}', diff || '');
  const finalPrompt = promptWithChanges.replace('{{language}}', outputLanguage);

  return generateCommitMessage(finalPrompt);
}

export { summarizeDiff }; 