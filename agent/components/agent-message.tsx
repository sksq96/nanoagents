"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Bot } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

interface AgentMessageProps {
  content: string
}

export function AgentMessage({ content }: AgentMessageProps) {
  const [parsedContent, setParsedContent] = useState<any>(null)
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    try {
      // Try to parse the content as JSON
      const parsed = JSON.parse(content)
      setParsedContent(parsed)
      setIsValid(true)
    } catch (e) {
      // If it's not valid JSON, just display as text
      setParsedContent(null)
      setIsValid(false)
    }
  }, [content])

  return (
    <div className="flex gap-2 group">
      <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex-1 max-w-[calc(100%-40px)]">
        <div className="bg-primary/10 p-3 rounded-lg rounded-tl-none shadow-sm break-words">
          {isValid && parsedContent ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/20 text-xs">
                  Tool Call
                </Badge>
                <span className="font-semibold text-sm">{parsedContent.name}</span>
              </div>

              {parsedContent.arguments && (
                <div className="bg-background/80 p-2 rounded-md mt-2">
                  <pre className="text-xs whitespace-pre-wrap overflow-hidden">{JSON.stringify(parsedContent.arguments, null, 2)}</pre>
                </div>
              )}
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm break-words">{content}</div>
          )}
        </div>
      </div>
    </div>
  )
}

