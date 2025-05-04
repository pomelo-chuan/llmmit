#!/usr/bin/env node

import { getDiff } from './git';
import { summarizeDiff } from './summarize';
import { confirmCommit } from './prompt';
import { execSync } from 'child_process'; // Add this import
import { CommitMessageArgs } from './ai_openai'; // Import the interface
import ora, { Ora } from 'ora'; // Import ora types
import chalk from 'chalk'; // Chalk has default export types

function formatCommitMessage(commitData: CommitMessageArgs): string {
  let message = `${commitData.type}`; // feat
  if (commitData.scope) {
    message += `(${commitData.scope})`; // feat(api)
  }
  message += `: ${commitData.title}`; // feat(api): add user endpoint

  if (commitData.description && commitData.description.length > 0) {
    message += '\n\n' + commitData.description.map((line: string) => `- ${line}`).join('\n');
  }
  return message;
}

async function main() {
  let spinner: Ora | undefined; // Type spinner variable
  try {
    const diff = await getDiff();
    // Check if diff is null or empty string after trimming
    if (!diff || !diff.trim()) {
      console.log('✅ No changes added to staging. Nothing to commit.');
      process.exit(0);
    }

    spinner = ora('🤖 Generating commit message...').start();
    const commitData: CommitMessageArgs = await summarizeDiff(diff);
    spinner.succeed('✨ Commit message generated!');

    const formattedMessage: string = formatCommitMessage(commitData);

    const coloredMessage: string = chalk.green(formattedMessage);

    const ok: boolean = await confirmCommit(`Use the following commit message?\n\n${coloredMessage}\n`);

    if (ok) {
      spinner = ora('🚀 Committing changes...').start();
      // Escape single quotes in the message for the shell command
      const escapedMessage = formattedMessage.replace(/'/g, "'\\''");
      execSync(`git commit -m '${escapedMessage}'`, { encoding: 'utf8' });
      spinner.succeed('🎉 Changes committed!');
    } else {
      console.log('🚫 Commit cancelled.');
    }
  } catch (e: unknown) { // Type caught error as unknown
    if (spinner) {
      spinner.fail('💥 An error occurred.');
    }
    console.error('\nError:', (e instanceof Error) ? e.message : e);
    // Log the stack trace for better debugging if available
    if (e instanceof Error && e.stack) {
      // console.error(e.stack); // Optional: uncomment for full stack trace
    }
    process.exit(1);
  }
}

main(); 