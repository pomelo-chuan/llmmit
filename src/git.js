const simpleGit = require('simple-git');
const config = require('./config_loader');

async function getDiff() {
  const git = simpleGit();

  const pathspec = ['.'];
  if (config.ignorePatterns && config.ignorePatterns.length > 0) {
    config.ignorePatterns.forEach(pattern => {
      pathspec.push(`:(exclude)${pattern}`);
    });
  }

  const diff = await git.diff(['--staged', '--', ...pathspec]);
  return diff;
}

module.exports = { getDiff }; 