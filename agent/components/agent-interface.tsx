"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageList } from "@/components/message-list"
import type { ConversationMessage } from "@/lib/types"

interface AgentInterfaceProps {
  logFile: string
  directory: string
}

export function AgentInterface({ logFile, directory }: AgentInterfaceProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchLogData() {
      setLoading(true)
      try {
        const response = await fetch(`/api/logs/${logFile}?directory=${encodeURIComponent(directory)}`)
        const data = await response.json()
        setMessages([])
        setCurrentIndex(0)
      } catch (error) {
        console.error("Failed to fetch log data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (logFile && directory) {
      fetchLogData()
    }
  }, [logFile, directory])

  useEffect(() => {
    async function fetchLogData() {
      try {
        const response = await fetch(`/api/logs/${logFile}?directory=${encodeURIComponent(directory)}`)
        const data = await response.json()

        // Filter out system messages for display
        const displayMessages = data.messages.filter((msg: ConversationMessage) => msg.role !== "system")

        // Show messages incrementally
        if (currentIndex < displayMessages.length) {
          setMessages(displayMessages.slice(0, currentIndex + 1))

          // Add delay before showing next message
          const timer = setTimeout(() => {
            setCurrentIndex((prev) => prev + 1)
          }, 500)

          return () => clearTimeout(timer)
        }
      } catch (error) {
        console.error("Failed to fetch log data:", error)
      }
    }

    if (logFile && directory && !loading) {
      fetchLogData()
    }
  }, [logFile, directory, currentIndex, loading])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="text-lg font-medium mb-2">Agent Conversation</div>
      <div className="flex-1 relative border rounded-md overflow-hidden" ref={scrollAreaRef}>
        <ScrollArea className="h-full w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="p-4 w-full max-w-full">
              <MessageList messages={messages} />
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}

