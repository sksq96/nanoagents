export interface ConversationMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface LogFile {
  messages: ConversationMessage[]
}

