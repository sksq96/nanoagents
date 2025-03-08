# Weather Agent

A simple agent that uses the OpenAI API to fetch weather information for different cities.

## Overview

This project demonstrates how to build an agent that can interact with a weather API using natural language. The agent uses the OpenAI API to understand user queries and generate appropriate responses.

The agent is designed to be tool-agnostic, meaning it dynamically discovers available tools from the MCP server rather than having them hardcoded. This makes it more flexible and adaptable to different MCP servers with different tool sets.

## Components

- `weather.py`: A simple MCP server that provides a weather API
- `agent.py`: The core agent implementation
- `weather_agent.py`: A wrapper around the agent that uses the OpenAI API

## Setup

1. Clone the repository
2. Install the dependencies:
   ```
   pip install openai python-dotenv httpx mcp
   ```
3. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your-api-key
   ```

## Usage

Run the weather agent with a query:

```bash
python weather_agent.py "What's the weather like in London and Tokyo?"
```

You can also use the agent in your own code:

```python
import asyncio
from weather_agent import run_weather_agent

async def main():
    result = await run_weather_agent("What's the weather like in San Francisco?")
    print(result)

asyncio.run(main())
```

## How it Works

1. The agent receives a natural language query from the user
2. It connects to the MCP server and dynamically discovers available tools
3. It uses the OpenAI API to generate a response that includes a tool call
4. The tool call is executed to fetch the weather information
5. The agent uses the OpenAI API again to generate a final answer based on the weather information

## Extending the Agent

Because the agent dynamically discovers tools, you can easily extend it to work with different MCP servers that provide different tools. Simply change the `server_parameters` in the `run_weather_agent` function to point to your MCP server.

## License

MIT 