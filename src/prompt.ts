import inquirer from 'inquirer';
import boxen from 'boxen';

async function confirmCommit(message: string): Promise<boolean> {
  console.log(boxen(message, { padding: 1, margin: { top: 0, bottom: 1 }, borderStyle: 'round', title: 'Generated Commit Message', titleAlignment: 'center' }));
  const answers = await inquirer.prompt<{ confirm: boolean }>([
    {
      type: 'confirm',
      name: 'confirm',
      message: "Do you want to use this commit message and proceed with the commit?",
      default: true,
    },
  ]);
  return answers.confirm;
}

export { confirmCommit }; 