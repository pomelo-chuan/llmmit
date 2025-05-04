import inquirer from 'inquirer'; // Use static import for inquirer v8

async function confirmCommit(message: string): Promise<boolean> {
  // const inquirer = (await import('inquirer')).default; // Remove dynamic import
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