import type { ConversationMessage } from "@/lib/types"
import { AgentMessage } from "@/components/agent-message"
import { UserMessage } from "@/components/user-message"

interface MessageListProps {
  messages: ConversationMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {messages.map((message, index) => (
        <div key={index} className="w-full">
          {message.role === "assistant" ? (
            <AgentMessage content={message.content} />
          ) : (
            <UserMessage content={message.content} />
          )}
        </div>
      ))}
    </div>
  )
}

