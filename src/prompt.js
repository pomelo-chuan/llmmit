async function confirmCommit(message) {
  const inquirer = (await import('inquirer')).default; // Import dynamically
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Use the following commit message?\n\n${message}\n`,
      default: true,
    },
  ]);
  return confirm;
}

module.exports = { confirmCommit }; 