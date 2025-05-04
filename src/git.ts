import { execSync } from 'child_process';
import config from './config_loader.js';

async function getDiff(): Promise<string | null> {
  let command = 'git diff --staged --';

  const pathspec: string[] = ['.'];
  if (config.ignorePatterns && config.ignorePatterns.length > 0) {
    config.ignorePatterns.forEach((pattern: string) => {
      // Ensure patterns with spaces are quoted
      pathspec.push(`':(exclude)${pattern}'`);
    });
  }

  command += ` ${pathspec.join(' ')}`;

  try {
    const diff = execSync(command, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }); // 10MB buffer
    return diff;
  } catch (error: any) {
    // Handle cases where there's no diff or other git errors
    if (error.stderr && error.stderr.includes('warning: Not a git repository')) {
       console.warn('Warning: Not a git repository.');
       return null;
    }
    // If the command returns a non-zero exit code but produces output (e.g., there are changes), return the output.
    // If there are no changes, execSync throws an error, but the output buffer will be empty.
    if (error.stdout) {
      return error.stdout;
    }
    // If there are no staged changes, the command might exit cleanly but produce no output.
    if (error.status === 0 && !error.stdout && !error.stderr) {
        return ''; // Return empty string for no changes
    }
    console.error(`Error getting git diff: ${error}`);
    // Consider re-throwing or returning a more specific error if needed
    return null;
  }
}

export { getDiff }; 