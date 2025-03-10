"use client"

import { useState } from "react"
import { AgentInterface } from "@/components/agent-interface"
import { LogSelector } from "@/components/log-selector"
import { DirectorySelector } from "@/components/directory-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import { Separator } from "@/components/ui/separator"

export default function Home() {
  const [selectedLog, setSelectedLog] = useState<string>("")
  const [selectedDirectory, setSelectedDirectory] = useState<string>("logs")

  // Reset selected log when directory changes
  const handleDirectoryChange = (directory: string) => {
    setSelectedDirectory(directory)
    setSelectedLog("")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">Agent Interface</h1>
        <ThemeToggle />
      </header>
      
      <div className="flex flex-col md:flex-row flex-1 h-[calc(100vh-64px)]">
        <div className="md:w-64 p-4 border-r overflow-y-auto">
          <div className="space-y-4">
            <DirectorySelector 
              onSelectDirectory={handleDirectoryChange} 
              selectedDirectory={selectedDirectory} 
            />
            
            <Separator />
            
            {selectedDirectory && (
              <LogSelector 
                onSelectLog={setSelectedLog} 
                selectedLog={selectedLog} 
                directory={selectedDirectory} 
              />
            )}
          </div>
        </div>
        <div className="flex-1 p-4">
          {selectedLog ? (
            <AgentInterface 
              logFile={selectedLog} 
              directory={selectedDirectory} 
            />
          ) : (
            <div className="flex items-center justify-center h-full border rounded-lg bg-card text-card-foreground">
              <p className="text-muted-foreground">Select a log file to view the conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
