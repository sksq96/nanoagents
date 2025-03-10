import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import os from "os"
import type { ConversationMessage } from "@/lib/types"

// Map of special directory IDs to their absolute paths
const EXTERNAL_DIRECTORIES: Record<string, string> = {
  "ai-agent-logs": path.join(os.homedir(), "Library/Application Support/AI-Agent-CLI/logs")
}

export async function GET(request: Request, { params }: { params: { filename: string } }) {
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
    
    const filename = params.filename
    const filePath = path.join(logsDir, filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Log file not found" }, { status: 404 })
    }

    const fileContent = fs.readFileSync(filePath, "utf-8")

    // Parse JSONL content
    let messages: ConversationMessage[] = []
    try {
      // First try to parse as a JSON array
      messages = JSON.parse(fileContent)
    } catch (e) {
      // If that fails, try to parse as JSONL (one JSON object per line)
      messages = fileContent
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line))
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error reading log file:", error)
    return NextResponse.json({ error: "Failed to read log file" }, { status: 500 })
  }
}

