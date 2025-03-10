import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import os from "os"

// Map of special directory IDs to their absolute paths
const EXTERNAL_DIRECTORIES: Record<string, string> = {
  "ai-agent-logs": path.join(os.homedir(), "Library/Application Support/AI-Agent-CLI/logs")
}

export async function DELETE(request: Request) {
  try {
    // Get the parameters from the request body
    const body = await request.json()
    const { directory, filename } = body
    
    if (!directory || !filename) {
      return NextResponse.json({ error: "Directory and filename are required" }, { status: 400 })
    }
    
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
    
    // Validate filename to prevent directory traversal attacks
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 })
    }
    
    const filePath = path.join(logsDir, filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Log file not found" }, { status: 404 })
    }

    // Delete the file
    fs.unlinkSync(filePath)

    return NextResponse.json({ success: true, message: "File deleted successfully" })
  } catch (error) {
    console.error("Error deleting log file:", error)
    return NextResponse.json({ error: "Failed to delete log file" }, { status: 500 })
  }
} 