import { useRef, useEffect } from 'react'
import { Sparkles, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QueryInputProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
  suggestions?: string[]
}

export default function QueryInput({ value, onChange, onSubmit, disabled, suggestions = [] }: QueryInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 100) + 'px'
  }, [value])

  // Register "/" shortcut to focus this input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        textareaRef.current?.focus()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        textareaRef.current?.focus()
        textareaRef.current?.select()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !disabled) onSubmit()
    }
  }

  return (
    <div className="space-y-3">
      <div className={`relative rounded-2xl border transition-all duration-300 bg-[#11111c] ${disabled ? 'opacity-60' : 'border-[#1e1e35] focus-within:border-[#6366f1]/60 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]'}`}>
        <div className="flex items-start gap-3 p-4">
          <Sparkles className="w-5 h-5 text-[#6366f1] flex-shrink-0 mt-1" />
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask a business question... (e.g. Show me Q3 revenue by region)"
            rows={1}
            className="flex-1 bg-transparent text-[#e2e8f0] placeholder:text-[#4a4a6a] resize-none focus:outline-none text-sm leading-relaxed min-h-[28px] font-sans"
          />
          <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
            <span className="hidden sm:inline text-xs text-[#4a4a6a] font-mono">⌘ Enter</span>
            <Button size="sm" onClick={onSubmit} disabled={disabled || !value.trim()} className="h-8 gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Suggestion chips */}
      {suggestions.length > 0 && !disabled && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onChange(s)}
              className="px-3 py-1.5 rounded-full text-xs border border-[#1e1e35] text-[#94a3b8] hover:text-[#e2e8f0] hover:border-[#6366f1]/40 hover:bg-[#16162a] transition-all cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
