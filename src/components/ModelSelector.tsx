import React from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import agentService, { ModelOption, MODELS } from "@/services/agentService"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ModelSelectorProps {
  onModelChange?: (model: ModelOption) => void
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  onModelChange,
}) => {
  const { toast } = useToast()
  const currentModel = agentService.getCurrentModel()

  const handleModelChange = (model: ModelOption) => {
    if (model.provider === "groq" && !agentService.getApiKey()) {
      toast({
        title: "Groq API Key Required",
        description: "Please set your Groq API key to use this model",
        variant: "destructive",
      })
      return
    }

    agentService.setCurrentModel(model)
    onModelChange?.(model)

    toast({
      title: "Model Changed",
      description: `Now using ${model.name}`,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center justify-between gap-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 w-full md:w-48"
        >
          <div className="flex items-center gap-2 truncate">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                currentModel.provider === "groq"
                  ? "bg-purple-500"
                  : "bg-blue-500"
              )}
            />
            <span className="truncate">{currentModel.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {MODELS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              currentModel.id === model.id && "bg-zinc-800/50"
            )}
            onClick={() => handleModelChange(model)}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    model.provider === "groq"
                      ? "bg-purple-500"
                      : "bg-blue-500"
                  )}
                />
                <span>{model.name}</span>
              </div>
              <span className="text-xs text-muted-foreground mt-0.5">
                {model.description}
              </span>
            </div>
            {currentModel.id === model.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ModelSelector
