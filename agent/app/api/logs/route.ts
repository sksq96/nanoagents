import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import os from "os"

// Map of special directory IDs to their absolute paths
const EXTERNAL_DIRECTORIES: Record<string, string> = {
  "ai-agent-logs": path.join(os.homedir(), "Library/Application Support/AI-Agent-CLI/logs")
}

export async function GET(request: Request) {
  try {
    // Get the directory from the query parameters
    const url = new URL(request.url)
    const directory = url.searchParams.get('directory') || 'logs' // Default to 'logs' if not specified
    
    let logsDir: string

    // Check if this is an external directory
    if (directory in EXTERNAL_DIRECTORIES) {
      logsDir = EXTERNAL_DIRECTORIES[directory]
    } else {
      // Validate directory to prevent directory traversal attacks
      if (directory.includes('..') || directory.includes('/') || directory.includes('\\')) {
        return NextResponse.json({ error: "Invalid directory name" }, { status: 400 })
      }
      
      // Use relative path for internal directories
      logsDir = path.join(process.cwd(), directory)
    }

    // Check if directory exists
    if (!fs.existsSync(logsDir)) {
      return NextResponse.json({ logs: [] })
    }

    const files = fs.readdirSync(logsDir).filter((file) => file.endsWith(".jsonl"))

    return NextResponse.json({ logs: files })
  } catch (error) {
    console.error("Error reading logs directory:", error)
    return NextResponse.json({ error: "Failed to read logs" }, { status: 500 })
  }
}

