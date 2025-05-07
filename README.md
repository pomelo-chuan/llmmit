# llmmit

<img src="./images/logo.png" alt="logo" width="200"/>

`llmmit` is a tool that uses LLMs (Large Language Models) to generate git commit messages based on your staged changes.

## Features

-   🔍 Analyzes the `git diff` of your staged changes.
-   🤖 Calls the LLM API to generate a structured commit message.
-   📚 Handles large diffs by summarizing effectively (under the hood, though chunking was removed from the direct summarization step).
-   ✅ Prompts for user confirmation before committing.
-   ➡️ Automatically performs the commit if confirmed.
-   🌍 Supports customizable output language for commit messages.
-   🚫 Supports ignoring specific file patterns in the diff analysis.
-   ⚙️ Configuration via `~/.llmmitrc` file.

## Installation

```bash
# Using npm
npm install -g llmmit 
# Or using yarn
yarn global add llmmit
```

## Usage

1.  **Configure your OpenAI API Key**: `llmmit` needs your OpenAI API key. The recommended method is to set the `openai_api_key` in the `~/.llmmitrc` file located in your home directory.
    For example, create or edit `~/.llmmitrc` and add:
    ```json
    {
      "openai_api_key": "your-sk-xxxx"
      // You can include other configurations here.
      // For a full example, see the "Configuration (Optional)" section.
    }
    ```

2.  **Stage your changes:**
    ```bash
    git add <files you want to commit>
    ```

3.  **Run the command:**
    ```bash
    llmmit
    ```

4.  **Confirm:** The tool will show the generated commit message (in green!). Press `y` (or Enter for default yes) to confirm and commit, or `n` to cancel.

## Configuration

You can customize `llmmit`'s behavior by creating a JSON configuration file at `~/.llmmitrc`.

**Example `~/.llmmitrc`:**

```json
{
  "openai_api_key": "sk-xxx",
  "openai_base_url": "https://api.example.com/v1",
  "model": "gpt-4o",
  "temperature": 0.5,
  "output_language": "English",
  "ignorePatterns": [
    "package-lock.json",
    "yarn.lock",
    "dist/",
    "*.log"
  ]
}
```

**Field Descriptions:**

*   `openai_api_key`: (Required) Your OpenAI API key.
*   `openai_base_url`: (Optional) Custom base URL for the OpenAI API. Defaults to the official OpenAI API address.
*   `model`: (Optional) The name of the OpenAI model to use. Defaults to 'gpt-3.5-turbo'.
*   `temperature`: (Optional) Controls the randomness of the output, a value between 0 and 2. Lower values make the output more deterministic, higher values make it more random. Defaults to 0.7.
*   `output_language`: (Optional) The output language for the generated commit message. Defaults to 'English'.
*   `ignorePatterns`: (Optional) An array of strings defining file or directory patterns (glob patterns) to be ignored when analyzing the `git diff`. Defaults to an empty array.

If the configuration file or specific keys are missing, the tool will use default values.

## Demo

```bash
➜  llmmit git:(main) ✗ llmmit
⚙️ Configuration loaded from /Users/pomelo/.llmmitrc
✔ ✨ Commit message generated!
╭────── Generated Commit Message ──────╮
│                                      │
│   docs: add demo section to README   │
│                                      │
│   - add demo section                 │
│   - update package version           │
│                                      │
╰──────────────────────────────────────╯

✔ Do you want to use this commit message and proceed with the commit? Yes
✔ 🎉 Changes committed!
```