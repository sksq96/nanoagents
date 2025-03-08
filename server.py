from mcp.server.fastmcp import FastMCP
import httpx

mcp = FastMCP("Server")

@mcp.tool()
async def fetch_weather(city: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://wttr.in/{city}?format=4")
        return response.text


if __name__ == "__main__":
    mcp.run()