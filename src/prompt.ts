import inquirer from 'inquirer';

async function confirmCommit(message: string): Promise<boolean> {
  const answers = await inquirer.prompt<{ confirm: boolean }>([
    {
      type: 'confirm',
      name: 'confirm',
      message: message,
      default: true,
    },
  ]);
  return answers.confirm;
}

export { confirmCommit }; 