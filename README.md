# llmmit

`llmmit` is a tool that uses LLMs (Large Language Models) to generate git commit messages based on your staged changes.

## Features

-   Analyzes the `git diff` of your staged changes.
-   Calls the OpenAI API to generate a structured commit message.
-   Handles large diffs by summarizing effectively (under the hood, though chunking was removed from the direct summarization step).
-   Prompts for user confirmation before committing.
-   Automatically performs the commit if confirmed.
-   Supports customizable output language for commit messages.
-   Supports ignoring specific file patterns in the diff analysis.
-   Configuration via `~/.llmmitrc` file.

## Installation

```bash
# Using npm
npm install -g llmmit 
# Or using yarn
yarn global add llmmit
```

*(Note: Assuming `llmmit` is published or intended to be used as a global CLI. Adjust if installation differs)*

## Usage

1.  **Configure your OpenAI API Key**: `llmmit` needs your OpenAI API key. You can set it in one of two ways:
    *   **Environment Variable (Recommended for security):**
        ```bash
        export OPENAI_API_KEY='your-sk-xxxx'
        ```
    *   **Configuration File:** Add it to `~/.llmmitrc` (see below).

2.  **Stage your changes:**
    ```bash
    git add <files you want to commit>
    ```

3.  **Run the command:**
    ```bash
    llmmit
    ```

4.  **Confirm:** The tool will show the generated commit message (in green!). Press `y` (or Enter for default yes) to confirm and commit, or `n` to cancel.

## Configuration (Optional)

You can customize `llmmit`'s behavior by creating a JSON configuration file at `~/.llmmitrc`.

**Example `~/.llmmitrc`:**

```json
{
  "openai_api_key": "sk-xxx", // Can be omitted if using environment variable
  "openai_base_url": "https://api.example.com/v1", // Optional: For custom OpenAI-compatible endpoints
  "openai_model": "gpt-4o", // Optional: Specify the model (defaults to gpt-3.5-turbo)
  "openai_temperature": 0.5, // Optional: Controls randomness (defaults to 0.7)
  "output_language": "English", // Optional: Language for the commit title/description (defaults to English)
  "ignorePatterns": [ // Optional: Glob patterns for files/paths to ignore in the diff
    "package-lock.json",
    "yarn.lock",
    "dist/",
    "*.log"
  ]
}
```

If the configuration file or specific keys are missing, the tool will use default values or the `OPENAI_API_KEY` environment variable.
