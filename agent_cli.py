#!/usr/bin/env python3
import os
import asyncio
import sys
import logging
import argparse
import json
from datetime import datetime
from pathlib import Path
from mcp import StdioServerParameters
from dotenv import load_dotenv
import tempfile
import shutil

# Import the agent components
from agent import MCPSimpleAgent

# Load environment variables from .env file
load_dotenv()

# Get API key from environment
api_key = os.environ.get("OPENAI_API_KEY")

def get_logs_directory():
    """Get or create a centralized logs directory.
    
    Returns:
        Path: Path to the logs directory
    """
    # Use platform-specific app data directory
    if sys.platform == 'win32':
        base_dir = os.path.join(os.environ.get('APPDATA', os.path.expanduser('~')), 'AI-Agent-CLI')
    elif sys.platform == 'darwin':
        base_dir = os.path.expanduser('~/Library/Application Support/AI-Agent-CLI')
    else:  # Linux and other Unix-like
        base_dir = os.path.expanduser('~/.ai-agent-cli')
    
    # Create logs directory
    logs_dir = os.path.join(base_dir, 'logs')
    os.makedirs(logs_dir, exist_ok=True)
    
    return logs_dir

def save_logs(agent, logs_dir):
    """Save agent messages to a log file.
    
    Args:
        agent: The agent instance
        logs_dir: Directory to save logs
    """
    try:
        # Create a timestamped log file
        log_file = os.path.join(logs_dir, f'messages_{datetime.now().strftime("%Y%m%d_%H%M%S")}.jsonl')
        
        # Save messages to the log file
        with open(log_file, 'w') as f:
            for message in agent.messages:
                f.write(json.dumps(message))
                f.write("\n")
        
        logging.info(f"Logs saved to {log_file}")
    except Exception as e:
        logging.warning(f"Failed to save logs: {e}")

class SimpleAgent(MCPSimpleAgent):
    """A wrapper around MCPSimpleAgent that adds centralized logging."""
    
    def __init__(self, logs_dir=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logs_dir = logs_dir or get_logs_directory()
        
        # Create logs directory if it doesn't exist
        os.makedirs(self.logs_dir, exist_ok=True)
    
    @classmethod
    def create_with_openai(cls, logs_dir=None, **kwargs):
        """Create an agent with OpenAI integration and logging support."""
        agent = super().create_with_openai(**kwargs)
        agent.__class__ = cls  # Change the class of the instance
        agent.logs_dir = logs_dir or get_logs_directory()
        
        return agent
    
    async def run(self, query):
        """Run the agent with a query and save logs."""
        # Run the agent
        result = await super().run(query)
        # Save logs after running
        save_logs(self, self.logs_dir)
        return result

async def run_agent(query: str, server_script_path: str = None, logs_dir: str = None):
    """Run the agent with a query.
    
    Args:
        query: The query to send to the agent
        server_script_path: Optional path to the server script. If not provided,
                           will look for server.py in the same directory as this script.
        logs_dir: Optional directory to store logs. If not provided,
                 will use a platform-specific default location.
    """
    # If logs_dir is provided, ensure it exists
    if logs_dir:
        logs_dir = Path(logs_dir).expanduser().resolve()
        os.makedirs(logs_dir, exist_ok=True)
    else:
        logs_dir = get_logs_directory()
    
    # If server_script_path is not provided, use the default path
    if not server_script_path:
        # Get the directory of the current script
        script_dir = Path(__file__).parent.absolute()
        server_script_path = script_dir / "server.py"
    else:
        server_script_path = Path(server_script_path)
    
    # Ensure the server script exists
    if not server_script_path.exists():
        raise FileNotFoundError(f"Server script not found at {server_script_path}")
    
    # Define MCP server parameters with the absolute path to the server script
    server_parameters = StdioServerParameters(
        command="python",
        args=[str(server_script_path)],
    )
    
    # Define a system prompt for the agent
    system_prompt = """
    You are an expert AI agent. 
    You are given a task and you need to complete it using the tools available.
    You are currently working in the directory: {cwd}
    """
    
    # Add current working directory to the system prompt
    cwd = os.getcwd()
    system_prompt = system_prompt.format(cwd=cwd)
    
    # Create the agent with OpenAI integration and logging support
    agent = SimpleAgent.create_with_openai(
        logs_dir=str(logs_dir),
        server_parameters=server_parameters,
        system_prompt=system_prompt,
        model="gpt-4o-mini",
        temperature=0.7,
        max_tokens=2048,
        api_key=api_key,
        max_steps=5,
        verbosity_level=logging.INFO,
    )
    
    # Run the agent
    result = await agent.run(query)
    
    return result

def main():
    """Main entry point for the CLI."""
    parser = argparse.ArgumentParser(
        description="AI Agent CLI - Run AI agent queries from anywhere"
    )
    parser.add_argument(
        "query", 
        nargs="?", 
        help="The query to send to the agent"
    )
    parser.add_argument(
        "--server", "-s", 
        dest="server_path",
        help="Path to the server.py script (defaults to the one in the same directory as this script)"
    )
    parser.add_argument(
        "--logs-dir", "-l",
        dest="logs_dir",
        help="Directory to store logs (defaults to platform-specific location)"
    )
    parser.add_argument(
        "--verbose", "-v", 
        action="store_true",
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    # Configure logging
    log_level = logging.INFO if args.verbose else logging.WARNING
    logging.basicConfig(level=log_level, format="%(levelname)s: %(message)s")
    
    # Check if API key is available
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable not set.")
        print("Please set it in your environment or in a .env file.")
        sys.exit(1)
    
    # If no query is provided, prompt the user
    if not args.query:
        args.query = input("Enter your query: ")
    
    try:
        result = asyncio.run(run_agent(args.query, args.server_path, args.logs_dir))
        print("\033[94mAgent Result:\033[0m")
        print(result)
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error running agent: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
