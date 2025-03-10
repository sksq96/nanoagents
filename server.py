import httpx
import subprocess
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("AiderServer", dependencies=["aider"])

@mcp.tool()
async def fetch_weather(city: str) -> str:
    """
    Fetch the weather for a given city.
    Args:
        city: The name of the city to fetch the weather for
    Returns:
        str: The weather for the given city
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://wttr.in/{city}?format=4")
        return response.text


@mcp.tool()
async def run_terminal_command(command: str) -> str:
    """
    Execute a terminal command and return its output.
    Args:
        command: The command to execute in the terminal
    Returns:
        str: The output from running the command (stdout and stderr combined)
    """
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True
        )
        return f"Exit code: {result.returncode}\nOutput:\n{result.stdout}\nErrors:\n{result.stderr}"
    except Exception as e:
        return f"Error executing command: {str(e)}"



@mcp.tool()
def run_aider(query: str, fnames: list[str]) -> str:
    """
    Run an Aider query and return the result.
    Args:
        query: The natural language query/instruction to analyze and modify the code
        fnames: List of filenames to analyze/modify
    Returns:
        str: The result from running the Aider query, including any code changes
        or analysis performed
    """
    result = subprocess.run(["aider", "--message", query] + fnames, capture_output=True, text=True)    
    return result.stdout


if __name__ == "__main__":
    mcp.run()
