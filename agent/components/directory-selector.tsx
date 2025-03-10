"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Folder } from "lucide-react"

interface DirectorySelectorProps {
  onSelectDirectory: (directory: string) => void
  selectedDirectory: string
}

export function DirectorySelector({ onSelectDirectory, selectedDirectory }: DirectorySelectorProps) {
  const [directories, setDirectories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDirectories() {
      try {
        const response = await fetch("/api/directories")
        const data = await response.json()
        setDirectories(data.directories)
        
        // If there are directories and none is selected, select the first one
        if (data.directories.length > 0 && !selectedDirectory) {
          onSelectDirectory(data.directories[0])
        }
      } catch (error) {
        console.error("Failed to fetch directories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDirectories()
  }, [onSelectDirectory, selectedDirectory])

  if (loading) {
    return <Skeleton className="h-10 w-full" />
  }

  if (directories.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2 border rounded-md">
        No log directories found
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Folder className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedDirectory} onValueChange={onSelectDirectory}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select directory" />
        </SelectTrigger>
        <SelectContent>
          {directories.map((dir) => (
            <SelectItem key={dir} value={dir}>
              {dir}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 