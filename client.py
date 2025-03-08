import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Create server parameters for stdio connection
server_params = StdioServerParameters(
    command="python", # Executable
    args=["server.py"], # Optional command line arguments
    env=None # Optional environment variables
)

async def run(city="NYC"):
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the connection
            await session.initialize()
            # print("Connection initialized")

            # List available tools
            tools = await session.list_tools()
            print(f"Available tools: {tools}")

            weather_result = await session.call_tool("fetch_weather", arguments={"city": city})
            print(f"Weather: {weather_result.content[0].text}")

if __name__ == "__main__":
    import asyncio
    city = sys.argv[1] if len(sys.argv) > 1 else "NYC"
    asyncio.run(run(city))