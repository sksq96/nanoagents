from setuptools import setup, find_packages

setup(
    name="ai-agent-cli",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "httpx",
        "fastmcp",
        "python-dotenv",
        "aider-chat",  # Assuming this is the correct package name for aider
    ],
    entry_points={
        "console_scripts": [
            "agent=agent_cli:main",
        ],
    },
    python_requires=">=3.8",
    description="A CLI utility for running an AI agent that can execute commands from any directory",
    author="Your Name",
    author_email="your.email@example.com",
    url="https://github.com/yourusername/ai-agent-cli",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
    ],
) 