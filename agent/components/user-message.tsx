"use client"

import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UserMessageProps {
  content: string
}

export function UserMessage({ content }: UserMessageProps) {
  // Check if the content starts with "Exit code:" to format tool execution results
  const isToolResult = content.startsWith("Exit code:") || content.startsWith("Final answer:")

  return (
    <div className="flex gap-2 group">
      <div className="w-8 h-8 rounded-full bg-secondary/90 flex items-center justify-center flex-shrink-0 shadow-sm">
        <User className="h-4 w-4 text-secondary-foreground" />
      </div>
      <div className="flex-1 max-w-[calc(100%-40px)]">
        <div className="bg-secondary/10 p-3 rounded-lg rounded-tl-none shadow-sm break-words">
          {isToolResult ? (
            <div className="space-y-2">
              <Badge variant="outline" className="bg-secondary/20 text-xs">
                Tool Result
              </Badge>
              <div className="whitespace-pre-wrap font-mono text-xs bg-background/80 p-2 rounded-md mt-2 break-words overflow-hidden">{content}</div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm break-words">{content}</div>
          )}
        </div>
      </div>
    </div>
  )
}

