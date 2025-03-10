import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import os from "os"

// Define base directories to check for logs
const BASE_DIRECTORIES = [
  "logs", // Default logs directory
  "sample-logs", // Sample logs directory
  "conversation-logs", // Another potential logs directory
]

// Define external directories with absolute paths
const EXTERNAL_DIRECTORIES = [
  {
    id: "ai-agent-logs",
    path: path.join(os.homedir(), "Library/Application Support/AI-Agent-CLI/logs")
  }
]

export async function GET() {
  try {
    const projectRoot = process.cwd()
    const availableDirs = []

    // Check which local directories exist and contain .jsonl files
    for (const dir of BASE_DIRECTORIES) {
      const dirPath = path.join(projectRoot, dir)
      
      if (fs.existsSync(dirPath)) {
        try {
          const files = fs.readdirSync(dirPath)
          const hasJsonlFiles = files.some(file => file.endsWith('.jsonl'))
          
          if (hasJsonlFiles) {
            availableDirs.push(dir)
          }
        } catch (error) {
          console.error(`Error reading directory ${dir}:`, error)
        }
      }
    }

    // Check external directories
    for (const extDir of EXTERNAL_DIRECTORIES) {
      if (fs.existsSync(extDir.path)) {
        try {
          const files = fs.readdirSync(extDir.path)
          const hasJsonlFiles = files.some(file => file.endsWith('.jsonl'))
          
          if (hasJsonlFiles) {
            availableDirs.push(extDir.id)
          }
        } catch (error) {
          console.error(`Error reading external directory ${extDir.path}:`, error)
        }
      }
    }

    return NextResponse.json({ directories: availableDirs })
  } catch (error) {
    console.error("Error listing directories:", error)
    return NextResponse.json({ error: "Failed to list directories" }, { status: 500 })
  }
} 