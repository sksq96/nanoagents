#!/bin/bash

# Exit on error
set -e

echo "Installing AI Agent CLI..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not installed."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is required but not installed."
    exit 1
fi

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Install the package in development mode
echo "Installing package..."
pip3 install -e "$SCRIPT_DIR"

# Make the script executable
chmod +x "$SCRIPT_DIR/agent_cli.py"

# Create a symlink in /usr/local/bin if it doesn't exist
if [ ! -f /usr/local/bin/agent ]; then
    echo "Creating symlink in /usr/local/bin..."
    if [ -w /usr/local/bin ]; then
        ln -sf "$SCRIPT_DIR/agent_cli.py" /usr/local/bin/agent
    else
        echo "Warning: Cannot create symlink in /usr/local/bin (permission denied)."
        echo "You may need to run this script with sudo to create the symlink."
        echo "Alternatively, you can add the following line to your .bashrc or .zshrc:"
        echo "alias agent='$SCRIPT_DIR/agent_cli.py'"
    fi
fi

# Determine the logs directory based on the platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOGS_DIR="$HOME/Library/Application Support/AI-Agent-CLI/logs"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    # Windows
    LOGS_DIR="$APPDATA/AI-Agent-CLI/logs"
else
    # Linux and other Unix-like
    LOGS_DIR="$HOME/.ai-agent-cli/logs"
fi

# Create the logs directory
mkdir -p "$LOGS_DIR"
echo "Logs will be stored in: $LOGS_DIR"

echo "Checking for OpenAI API key..."
if [ -z "$OPENAI_API_KEY" ] && [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "Warning: OPENAI_API_KEY environment variable not set and no .env file found."
    echo "You will need to set your OpenAI API key before using the agent."
    echo "You can do this by:"
    echo "1. Setting the OPENAI_API_KEY environment variable:"
    echo "   export OPENAI_API_KEY=your-api-key"
    echo "2. Creating a .env file in the project directory with:"
    echo "   OPENAI_API_KEY=your-api-key"
fi

echo "Installation complete!"
echo "You can now use the agent command from anywhere."
echo "Example: cd ~/my-project && agent \"Run ls -la\""
echo ""
echo "Additional options:"
echo "  --logs-dir, -l: Specify a custom logs directory"
echo "  --server, -s: Specify a custom server script"
echo "  --verbose, -v: Enable verbose logging" 