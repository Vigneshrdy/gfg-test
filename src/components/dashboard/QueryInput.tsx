import { useRef, useEffect, useState, useCallback } from 'react'
import { Sparkles, Send, Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QueryInputProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
  suggestions?: string[]
  placeholder?: string
}

// Typed SpeechRecognition for browsers
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
}

export default function QueryInput({ value, onChange, onSubmit, disabled, suggestions = [], placeholder }: QueryInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const autoSubmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasSpeechRecognition = typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)

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
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsRecording(false)
    if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current)
  }, [])

  const startRecording = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsRecording(true)
    recognition.onend = () => {
      setIsRecording(false)
      recognitionRef.current = null
    }
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }
      onChange(final || interim)
      if (final) {
        if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current)
        autoSubmitTimerRef.current = setTimeout(() => onSubmit(), 800)
      }
    }
    recognition.onerror = () => {
      setIsRecording(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [onChange, onSubmit])

  const toggleMic = useCallback(() => {
    if (isRecording) stopRecording()
    else startRecording()
  }, [isRecording, startRecording, stopRecording])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !disabled) onSubmit()
    }
  }

  return (
    <div className="space-y-3">
      <div className={`relative rounded-2xl border transition-all duration-300 bg-[var(--bg-raised)] ${
        disabled
          ? 'opacity-60'
          : 'border-[var(--border-default)] focus-within:border-[var(--accent-base)]/60 focus-within:shadow-[0_0_0_3px_rgba(45,212,191,0.1)]'
      }`}>
        <div className="flex items-start gap-3 p-4">
          <Sparkles className="w-5 h-5 text-[var(--accent-base)] flex-shrink-0 mt-1" />
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder || 'Ask a business question... (e.g. Show me Q3 revenue by region)'}
            rows={1}
            className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] resize-none focus:outline-none text-sm leading-relaxed min-h-[28px] font-sans"
          />
          <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
            {hasSpeechRecognition && (
              <button
                type="button"
                onClick={toggleMic}
                disabled={disabled}
                title={isRecording ? 'Stop recording' : 'Voice input'}
                className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all ${
                  isRecording
                    ? 'text-[#ef4444] bg-[#ef4444]/10 animate-mic-pulse'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--accent-base)] hover:bg-[var(--bg-overlay)]'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
            <span className="hidden sm:inline text-xs text-[var(--text-disabled)] font-mono">⌘ Enter</span>
            <Button size="sm" onClick={onSubmit} disabled={disabled || !value.trim()} className="h-8 gap-1.5 bg-[var(--accent-base)] hover:bg-[var(--accent-bright)] text-[var(--text-inverse)]">
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask</span>
            </Button>
          </div>
        </div>
        {isRecording && (
          <div className="px-4 pb-3 flex items-center gap-2">
            <div className="flex gap-0.5">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-0.5 bg-[#ef4444] rounded-full animate-pulse" style={{ height: `${8 + (i % 2) * 4}px`, animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <span className="text-xs text-[#ef4444] font-mono">Listening...</span>
          </div>
        )}
      </div>

      {/* Suggestion chips */}
      {suggestions.length > 0 && !disabled && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onChange(s)}
              className="px-3 py-1.5 rounded-full text-xs border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-base)]/40 hover:bg-[var(--bg-overlay)] transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="text-[var(--accent-base)]">→</span>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
