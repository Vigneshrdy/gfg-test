import { useState } from 'react'
import { ChevronDown, ChevronUp, Copy, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'

interface SQLBlockProps {
  sql: string
  generatedIn?: number
}

export default function SQLBlock({ sql, generatedIn }: SQLBlockProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sql)
    setCopied(true)
    toast({ title: 'SQL copied to clipboard', variant: 'default' })
    setTimeout(() => setCopied(false), 2000)
  }

  // Simple SQL syntax highlighting (keyword coloring)
  const highlightSQL = (sql: string) => {
    const keywords = /\b(SELECT|FROM|WHERE|JOIN|ON|GROUP BY|ORDER BY|HAVING|LIMIT|AS|AND|OR|NOT|IN|LIKE|BETWEEN|NULL|IS|INNER|LEFT|RIGHT|OUTER|DISTINCT|COUNT|SUM|AVG|MAX|MIN|ROUND|TO_CHAR|DATE_TRUNC|TABLE|CREATE|INSERT|UPDATE|DELETE|CASE|WHEN|THEN|ELSE|END)\b/g
    const numbers = /\b(\d+)\b/g
    const strings = /('([^']*)')/g

    return sql
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(strings, '<span style="color:#10b981">$1</span>')
      .replace(numbers, '<span style="color:#f59e0b">$1</span>')
      .replace(keywords, '<span style="color:#818cf8;font-weight:600">$1</span>')
  }

  return (
    <div className="rounded-xl border border-[#1e1e35] overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#0d0d1a] hover:bg-[#111128] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono text-[#94a3b8]">{'</>'} View Generated SQL</span>
          {generatedIn && (
            <Badge variant="success" className="text-xs gap-1">
              Generated in {generatedIn}s
            </Badge>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[#4a4a6a]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#4a4a6a]" />
        )}
      </button>

      {expanded && (
        <div className="relative sql-block">
          <div className="absolute top-3 right-3 z-10">
            <Button size="icon-sm" variant="ghost" onClick={handleCopy} className="h-7 w-7 text-[#4a4a6a] hover:text-[#e2e8f0]">
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
          <pre className="p-4 overflow-x-auto text-xs leading-relaxed">
            <code
              className="font-mono"
              dangerouslySetInnerHTML={{ __html: highlightSQL(sql) }}
            />
          </pre>
        </div>
      )}
    </div>
  )
}
