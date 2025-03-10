#!/usr/bin/env python3
"""
MCP Simple Agent - A simplified agent that works with MCP servers.
"""

from datetime import datetime
import json
import logging
import time
from enum import Enum
from typing import List, Dict, Any, Callable, Optional, Tuple, Union

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mcp_simple_agent")

# Constants for message roles
SYSTEM = "system"
USER = "user"
ASSISTANT = "assistant"

def parse_json_tool_call(text: str) -> Tuple[str, Dict[str, Any]]:
    """Parse a JSON tool call from text."""
    try:
        start_idx = text.find("{")
        if start_idx == -1:
            raise ValueError("No JSON object found in text")
        
        json_str = text[start_idx:]
        tool_call = json.loads(json_str)
        
        if "name" not in tool_call:
            raise ValueError("Tool call missing 'name' field")
        
        return tool_call["name"], tool_call.get("arguments", {})
    except (json.JSONDecodeError, Exception) as e:
        raise ValueError(f"Failed to parse tool call: {str(e)}")

def clean_observation(observation: str) -> str:
    """Clean up the raw observation to make it user-friendly."""
    if "content=[TextContent" in observation:
        try:
            text_start = observation.find("text='") + 6
            text_end = observation.find("'", text_start)
            if text_start > 6 and text_end > text_start:
                return f"Observation: {observation[text_start:text_end]}"
        except Exception:
            pass
    return f"Observation: {observation}"

class MCPSimpleAgent:
    """A simplified agent that works with MCP servers."""
    
    def __init__(
        self,
        server_parameters: StdioServerParameters,
        model: Callable[[List[Dict[str, Any]]], str],
        system_prompt: Optional[str] = None,
        max_steps: int = 20,
        verbosity_level: int = logging.INFO,
    ):
        self.server_parameters = server_parameters
        self.model = model
        self.max_steps = max_steps
        
        # Configure logger
        logger.setLevel(verbosity_level)
        
        # Initialize system prompt and memory
        self.original_system_prompt = system_prompt or "You are an expert assistant who can solve tasks using tool calls."
        self.system_prompt = self.original_system_prompt
        self.messages = []
        self.reset_memory()
        
        # Session state
        self.mcp_session = None
        self.available_tools = []
    
    def reset_memory(self):
        """Reset the agent's memory."""
        self.messages = [{
            "role": SYSTEM,
            "content": self.system_prompt
        }]
    
    def add_message(self, role: str, content: str):
        """Add a message to memory."""
        # Replace system message if adding a new one
        if role == SYSTEM:
            self.messages = [m for m in self.messages if m["role"] != SYSTEM]
        
        self.messages.append({"role": role, "content": content})
    
    def get_openai_messages(self) -> List[Dict[str, Any]]:
        """Get messages in OpenAI format."""
        return [
            {
                "role": m["role"],
                "content": [{"type": "text", "text": m["content"]}]
            }
            for m in self.messages
        ]
    
    def _enhance_system_prompt_with_tools(self, tools) -> str:
        """Enhance the system prompt with tool information."""
        prompt = self.original_system_prompt.strip()
        
        # Add JSON format instructions
        prompt += "\n\nYou must respond with a JSON object in the following format:\n"
        prompt += "{\"name\": \"tool_name\", \"arguments\": {\"arg1\": \"value1\"}}\n\n"
        
        # Add available tools
        prompt += "Available tools:\n"
        
        # Add tool information
        tool_names = [tool.name for tool in tools]
        for tool in tools:
            description = getattr(tool, 'description', f"Call the {tool.name} tool")
            prompt += f"- {tool.name}: {description}\n"
            parameters = getattr(tool, 'parameters', None)
            if parameters:
                prompt += f"Parameters: {parameters}\n"
        
        # Add final_answer if not already available
        if "final_answer" not in tool_names:
            prompt += "- final_answer(answer: str): Provide your final answer to the task\n"
        
        # Add examples
        prompt += "\nExamples:\n"
        if tools:
            prompt += json.dumps({"name": tools[0].name, "arguments": {"city": "New York"}}) + "\n"
        prompt += "{\"name\": \"final_answer\", \"arguments\": {\"answer\": \"Your comprehensive answer\"}}\n\n"
        prompt += "IMPORTANT: Your response must be a valid JSON object with the format shown above.\n"
        
        return prompt
    
    async def _process_step(self, step_count: int, max_steps: int):
        """Process a single agent step."""
        print("\n\n\n")
        logger.info(f"Step {step_count}/{max_steps}")
        
        # Log messages
        messages = self.get_openai_messages()
        # logger.info(f"Sending messages to model: {json.dumps(messages, indent=2)}")
        
        start_time = time.time()
        try:
            # Call model and parse response
            model_output = self.model(messages)
            tool_name, tool_args = parse_json_tool_call(model_output)
            print(f"\033[94mTool name:\033[0m {tool_name}")
            print(f"\033[94mTool args:\033[0m {tool_args}")
            
            # Add assistant message
            self.add_message(ASSISTANT, model_output)
            
            # Handle final answer or tool call
            if tool_name == "final_answer":
                final_answer = tool_args.get("answer", "")
                observation = f"Final answer: {final_answer}"
                print(f"\033[94mObservation:\033[0m {observation}")
                self.add_message(USER, observation)
                # Log final answer messages to file
                # with open(f'agent/logs/messages_{datetime.now().strftime("%Y%m%d_%H%M%S")}.jsonl', 'w') as f:
                #     for message in self.messages:
                #         f.write(json.dumps(message))
                #         f.write("\n")
                return final_answer
            
            # Call tool
            logger.info(f"Calling tool: {tool_name}")
            if tool_name not in [t.name for t in self.available_tools.tools]:
                raise ValueError(f"Tool not found: {tool_name}")
                
            result = await self.mcp_session.call_tool(tool_name, tool_args)
            print(f"Observation: {result.content[0].text}")
            observation = result.content[0].text
            self.add_message(USER, observation)
            
        except Exception as e:
            error_msg = f"Error: {str(e)}\nPlease try a different approach."
            logger.error(f"Error: {str(e)}")
            self.add_message(USER, error_msg)
            
        return None
    
    async def run(self, task: str, reset: bool = True, max_steps: Optional[int] = None):
        """Run the agent on a task."""
        if reset:
            self.reset_memory()
        
        logger.info("Initializing MCP session...")
        async with stdio_client(self.server_parameters) as (read_stream, write_stream):
            async with ClientSession(read_stream, write_stream) as session:
                self.mcp_session = session
                
                # Initialize session and get tools
                await self.mcp_session.initialize()
                self.available_tools = await self.mcp_session.list_tools()
                tool_names = [tool.name for tool in self.available_tools.tools]
                logger.info(f"Available tools: {', '.join(tool_names)}")
                
                # Update system prompt with tools and reset memory
                self.system_prompt = self._enhance_system_prompt_with_tools(self.available_tools.tools)
                print(f"System prompt: {self.system_prompt}")
                self.reset_memory()
                self.add_message(USER, task)
                
                # Log memory state
                logger.info(f"Memory: {json.dumps(self.messages, indent=2)}")
                
                # Run agent loop
                max_steps = max_steps or self.max_steps
                step_count = 0
                final_answer = None
                
                while step_count < max_steps and final_answer is None:
                    step_count += 1
                    final_answer = await self._process_step(step_count, max_steps)
                
                if step_count >= max_steps and final_answer is None:
                    logger.warning(f"Reached maximum steps ({max_steps}) without final answer")
                    final_answer = "No final answer provided within the maximum number of steps."
                
                return final_answer
    
    @classmethod
    def create_with_openai(cls, 
                          server_parameters: StdioServerParameters,
                          system_prompt: Optional[str] = None,
                          model: str = "gpt-4o-mini",
                          temperature: float = 0.7,
                          max_tokens: int = 2048,
                          api_key: Optional[str] = None,
                          max_steps: int = 20,
                          verbosity_level: int = logging.INFO) -> 'MCPSimpleAgent':
        """Create an MCPSimpleAgent that uses OpenAI for its model."""
        if not OPENAI_AVAILABLE:
            raise ImportError("OpenAI package is not installed. Please install it with 'pip install openai'.")
        
        # Create the OpenAI client and model function
        client = OpenAI(api_key=api_key)
        def model_function(messages):
            response = client.chat.completions.create(
                model=model, messages=messages, temperature=temperature,
                max_tokens=max_tokens, response_format={"type": "json_object"}
            )
            return response.choices[0].message.content
        
        return cls(
            server_parameters=server_parameters,
            model=model_function,
            system_prompt=system_prompt,
            max_steps=max_steps,
            verbosity_level=verbosity_level,
        ) 