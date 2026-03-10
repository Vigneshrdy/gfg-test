import { useState, useEffect } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

const STEPS = [
  'Understanding your question',
  'Generating SQL query',
  'Fetching from database',
  'Building your dashboard',
]

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    const delays = [0, 700, 1400, 2100]
    const timers: ReturnType<typeof setTimeout>[] = []

    delays.forEach((delay, i) => {
      timers.push(setTimeout(() => {
        setCurrentStep(i)
        if (i > 0) {
          setCompletedSteps(prev => [...prev, i - 1])
        }
      }, delay))
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="rounded-2xl border border-[#6366f1]/20 bg-[#16162a] p-6 animate-[pulseGlow_2s_ease-in-out_infinite]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse" />
        <span className="text-xs text-[#6366f1] font-mono uppercase tracking-wider">QueryMind is working</span>
      </div>
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const isCompleted = completedSteps.includes(i)
          const isCurrent = currentStep === i && !isCompleted
          const isPending = i > currentStep

          return (
            <div key={step} className={`flex items-center gap-3 transition-all duration-300 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-[#6366f1] animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-[#1e1e35]" />
                )}
              </div>
              <span className={`text-sm font-mono transition-colors ${isCompleted ? 'text-[#10b981]' : isCurrent ? 'text-[#e2e8f0]' : 'text-[#4a4a6a]'}`}>
                {step}
                {isCompleted && ' ✓'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
