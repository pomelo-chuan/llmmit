#!/usr/bin/env node

const { getDiff } = require('../src/git');
const { summarizeDiff } = require('../src/summarize');
const { confirmCommit } = require('../src/prompt');
const simpleGit = require('simple-git');

function formatCommitMessage(commitData) {
  let message = `${commitData.type}`; // feat
  if (commitData.scope) {
    message += `(${commitData.scope})`; // feat(api)
  }
  message += `: ${commitData.title}`; // feat(api): add user endpoint

  if (commitData.description && commitData.description.length > 0) {
    message += '\n\n' + commitData.description.map(line => `- ${line}`).join('\n');
  }
  return message;
}

async function main() {
  let spinner; // Declare spinner variable here
  try {
    // Dynamically import ora
    const ora = (await import('ora')).default;

    const diff = await getDiff();
    if (!diff.trim()) {
      console.log('✅ No changes added to staging. Nothing to commit.');
      process.exit(0);
    }

    spinner = ora('🤖 Generating commit message...').start(); // Start spinner
    const commitData = await summarizeDiff(diff); // Now receives a JSON object
    spinner.succeed('✨ Commit message generated!'); // Stop spinner on success

    const formattedMessage = formatCommitMessage(commitData);

    // Color the message green before showing confirmation
    const chalk = (await import('chalk')).default; // Ensure chalk is imported here if not earlier
    const coloredMessage = chalk.green(formattedMessage);

    // Use the colored message in the confirmation prompt
    const ok = await confirmCommit(`Use the following commit message?\n\n${coloredMessage}\n`);

    if (ok) {
      spinner = ora('🚀 Committing changes...').start(); // Start spinner for commit
      const git = simpleGit();
      await git.commit(formattedMessage); // Commit with the formatted message
      spinner.succeed('🎉 Changes committed!'); // Stop spinner on success
    } else {
      console.log('🚫 Commit cancelled.');
    }
  } catch (e) {
    if (spinner) {
      spinner.fail('💥 An error occurred.'); // Stop spinner on error
    }
    console.error('\nError:', e.message);
    // Log the stack trace for better debugging if available
    if (e.stack) {
      // console.error(e.stack); // Optional: uncomment for full stack trace
    }
    process.exit(1);
  }
}

main(); 