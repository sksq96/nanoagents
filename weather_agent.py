#!/usr/bin/env python3
"""
Weather Agent - An agent that uses the OpenAI API to fetch weather information.
"""

import os
import asyncio
import sys
import logging
from mcp import StdioServerParameters
from dotenv import load_dotenv

# Import the agent components
from agent import MCPSimpleAgent

# Load environment variables from .env file
load_dotenv()

# Get API key from environment
api_key = os.environ.get("OPENAI_API_KEY")

async def run_weather_agent(query: str):
    """Run the weather agent with a query."""
    # Define MCP server parameters
    server_parameters = StdioServerParameters(
        command="python",
        args=["server.py"],
    )
    
    # Define a simple system prompt for the agent
    system_prompt = """
    You are a helpful weather assistant. Your goal is to provide accurate weather information for the cities that users ask about.
    """
    
    # Create the agent with OpenAI integration
    agent = MCPSimpleAgent.create_with_openai(
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

if __name__ == "__main__":
    # Get the query from command line arguments or use a default query
    query = sys.argv[1] if len(sys.argv) > 1 else "Check the weather in San Francisco and New York"
    
    # Run the agent
    result = asyncio.run(run_weather_agent(query))
    print(f"Result: {result}") 