import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Sparkles, XCircle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMessageStore } from "@/store/messageStore"
import MessageBubble from "@/components/ui/MessageBubble"
import ApiKeyForm from "@/components/ui/ApiKeyForm"
import ModelSelector from "@/components/ModelSelector"
import agentService from "@/services/agentService"
import {
  createReadFileTool,
  createListFilesTool,
  createEditFileTool,
  createCreateFileTool,
} from "@/services/agentTools"

const AgentPanel: React.FC = () => {
  const [prompt, setPrompt] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { messages, addMessage, isLoading, setLoading, clearMessages } =
    useMessageStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const [, setForceUpdate] = useState(0)
  const [firstLoadComplete, setFirstLoadComplete] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      agentService.registerTools([
        createReadFileTool(),
        createListFilesTool(),
        createEditFileTool(),
        createCreateFileTool(),
      ])
      setIsInitialized(true)
    }
  }, [isInitialized])

  useEffect(() => {
    if (isInitialized && !firstLoadComplete) {
      setFirstLoadComplete(true)
    }
  }, [isInitialized, firstLoadComplete])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      })
      return
    }

    if (!agentService.hasRequiredApiKey()) {
      const currentModel = agentService.getCurrentModel()
      toast({
        title: `${
          currentModel.provider === "groq" ? "Groq" : "Gemini"
        } API Key Required`,
        description: `Please set your ${
          currentModel.provider === "groq" ? "Groq" : "Gemini"
        } API key first`,
        variant: "destructive",
      })
      return
    }

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: prompt,
      timestamp: new Date(),
    }

    addMessage(userMessage)
    setPrompt("")
    setLoading(true)

    try {
      await agentService.sendMessage(prompt)
      const conversation = agentService.getConversation()

      const newMessages = conversation.filter(
        (msg) =>
          msg.role !== "system" &&
          msg.timestamp > userMessage.timestamp &&
          !messages.some((existingMsg) => existingMsg.id === msg.id)
      )

      for (const msg of newMessages) {
        addMessage(msg)
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          (error as Error).message || "Failed to get agent response",
        variant: "destructive",
      })
      console.error("Agent error:", error)

      addMessage({
        id: Date.now().toString(),
        role: "assistant",
        content: `Error: ${(error as Error).message}`,
        timestamp: new Date(),
      })
    } finally {
      setLoading(false)
    }
  }

  const currentModel = agentService.getCurrentModel()
  const isUsingDefaultKey = agentService.isUsingDefaultKey()
  const hasActiveApiKey = agentService.hasRequiredApiKey()

  const filteredMessages = firstLoadComplete
    ? messages
    : messages.filter((msg, idx, arr) => {
        if (
          msg.role === "assistant" &&
          msg.content ===
            "Hi, I'm the ZneT IDE code assistant. I can help you with your project — just tell me what file or feature you want to work on."
        ) {
          const sameMessages = arr.filter(
            (m) =>
              m.role === "assistant" &&
              m.content ===
                "Hi, I'm the ZneT IDE code assistant. I can help you with your project — just tell me what file or feature you want to work on."
          )

          return sameMessages.indexOf(msg) === sameMessages.length - 1
        }
        return true
      })

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/40">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg mr-3">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
            AI Agent
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white"
            onClick={() => {
              clearMessages()
              agentService.clearConversation()
            }}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <ApiKeyForm
            onSuccess={() => setForceUpdate((prev) => prev + 1)}
          />
        </div>
      </div>

      <div className="border-b border-zinc-800 px-4 py-2 bg-black/20">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <ModelSelector
            onModelChange={() => setForceUpdate((prev) => prev + 1)}
          />

          {currentModel.provider === "groq" &&
            isUsingDefaultKey &&
            hasActiveApiKey && (
              <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1 rounded-md text-sm">
                <Info className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <p className="text-zinc-300">
                  Using default API key with rate limits
                </p>
              </div>
            )}

          {!hasActiveApiKey && (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/20 px-3 py-1 rounded-md text-sm">
              <Info className="h-4 w-4 text-red-400 flex-shrink-0" />
              <p className="text-zinc-300">
                Missing{" "}
                {currentModel.provider === "groq" ? "Groq" : "Gemini"} API
                key
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {filteredMessages.map((msg, idx) => (
          <MessageBubble key={msg.id + "-" + idx} message={msg} />
        ))}
        <div ref={messagesEndRef} />

        {isLoading && (
          <div className="flex justify-start px-4 py-2">
            <div className="bg-zinc-800/50 text-zinc-300 rounded-lg px-4 py-2 flex items-center space-x-2">
              <div className="flex space-x-1">
                <span
                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
              <span className="text-sm font-medium">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800 bg-black/40">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask about your code..."
            className="flex-1 min-h-[80px] max-h-[160px] bg-zinc-800/50 border-zinc-700 focus:border-purple-500 placeholder:text-zinc-500 text-white resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <Button
            type="submit"
            disabled={isLoading || !prompt.trim() || !hasActiveApiKey}
            className="self-end bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default AgentPanel
