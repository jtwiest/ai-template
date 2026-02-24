export function ThinkingIndicator() {
  return (
    <div className="flex gap-3 p-4">
      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
        <span className="text-xs">A</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium mb-2">Assistant</p>
        <div className="flex gap-1">
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  )
}
