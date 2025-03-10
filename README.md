# AI Agent CLI

A command-line utility for running an AI agent that can execute commands and perform tasks from any directory.

## Features

- Execute terminal commands in the current directory
- Run Aider code analysis and modification
- Fetch information from external APIs
- Easy to use CLI interface
- **Simple Unix-like behavior** - just navigate to your directory and run the agent
- **Centralized logging** - logs are stored in a platform-specific location

## Installation

### From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-agent-cli.git
   cd ai-agent-cli
   ```

2. Install the package:
   ```bash
   pip install -e .
   ```

### Quick Install

Run the installation script:
```bash
./install.sh
```

This will:
- Install the package in development mode
- Make the script executable
- Create a symlink in /usr/local/bin (if possible)
- Check for the OpenAI API key

### Requirements

- Python 3.8 or higher
- OpenAI API key

## Configuration

1. Set your OpenAI API key as an environment variable:
   ```bash
   export OPENAI_API_KEY="your-api-key"
   ```

   Or create a `.env` file in your project directory:
   ```
   OPENAI_API_KEY=your-api-key
   ```

## Usage

### Basic Usage

Navigate to the directory where you want to work and run the agent:

```bash
cd ~/my-project
agent "Run ls -la"
```

### Specifying a Custom Server Script

```bash
agent --server /path/to/custom/server.py "List files in this directory"
```

### Specifying a Custom Logs Directory

```bash
agent --logs-dir ~/my-logs "Run ls -la"
```

By default, logs are stored in:
- **Windows**: `%APPDATA%\AI-Agent-CLI\logs`
- **macOS**: `~/Library/Application Support/AI-Agent-CLI/logs`
- **Linux**: `~/.ai-agent-cli/logs`

### Interactive Mode

If you run the command without a query, it will prompt you to enter one:

```bash
agent
# Enter your query: Run ls -la
```

### Verbose Mode

For more detailed logging:

```bash
agent --verbose "Run ls -la"
```

## Available Commands

The agent can understand natural language queries and use the following tools:

1. **Run Terminal Commands**: Execute shell commands
   ```bash
   agent "Run ls -la"
   ```

2. **Run Aider**: Analyze and modify code
   ```bash
   agent "Use aider to analyze the file app.py"
   ```

3. **Fetch Information**: Get information from external APIs
   ```bash
   agent "What's the weather in San Francisco?"
   ```

## How It Works

The AI Agent CLI follows Unix philosophy by operating on the current working directory. Simply navigate to the directory where you want to work and run the agent. This makes it intuitive and consistent with other command-line tools.

Logs are stored in a centralized, platform-specific location to ensure they're accessible regardless of where the agent is run from.

## License

MIT 