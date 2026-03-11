import { useState, useCallback, useRef } from 'react'
import { Upload, X, FileText, CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { uploadCSV } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import type { SchemaColumn } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface CSVUploadModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (filename: string, schema: SchemaColumn[], tableName: string, schemaDescription: string, rowCount?: number) => void
}

type Step = 'drop' | 'preview' | 'processing' | 'done'

function inferType(values: string[]): SchemaColumn['type'] {
  const sample = values.filter(Boolean).slice(0, 10)
  if (sample.every(v => !isNaN(Number(v)))) return 'number'
  if (sample.every(v => /^\d{4}-\d{2}-\d{2}/.test(v))) return 'date'
  return 'text'
}

function parseCSVPreview(content: string): { headers: string[]; rows: Record<string, string>[]; schema: SchemaColumn[] } {
  const lines = content.split('\n').filter(Boolean)
  if (lines.length < 2) return { headers: [], rows: [], schema: [] }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1, 6).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']))
  })

  const schema: SchemaColumn[] = headers.map((name, colIdx) => ({
    name,
    type: inferType(lines.slice(1, 20).map(l => l.split(',')[colIdx]?.trim() || '')),
  }))

  return { headers, rows, schema }
}

export default function CSVUploadModal({ open, onClose, onSuccess }: CSVUploadModalProps) {
  const [step, setStep] = useState<Step>('drop')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<{ headers: string[]; rows: Record<string, string>[]; schema: SchemaColumn[] } | null>(null)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStep('drop')
    setFile(null)
    setPreview(null)
    setProgress(0)
  }

  const processFile = useCallback((f: File) => {
    if (!f.name.endsWith('.csv')) {
      toast({ title: 'Invalid file type', description: 'Please upload a .csv file', variant: 'destructive' })
      return
    }
    setFile(f)
    const reader = new FileReader()
    reader.onload = e => {
      const content = e.target?.result as string
      const parsed = parseCSVPreview(content)
      setPreview(parsed)
      setStep('preview')
    }
    reader.readAsText(f)
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setStep('processing')
    setProgress(0)

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) { clearInterval(interval); return p }
        return p + Math.random() * 15
      })
    }, 200)

    try {
      const res = await uploadCSV(file)
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => {
        setStep('done')
        toast({ title: `"${file.name}" uploaded successfully!`, description: `${res.row_count} rows indexed.` })
        onSuccess(file.name, res.schema, res.table_name, res.schema_description ?? '', res.row_count)
      }, 500)
    } catch (err) {
      clearInterval(interval)
      toast({ title: 'Upload failed', description: String(err), variant: 'destructive' })
      setStep('preview')
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const typeColors: Record<string, string> = {
    number: 'text-[#6ee7b7] border-[#10b981]/30 bg-[#10b981]/10',
    date: 'text-[#60A5FA] border-[#3B82F6]/30 bg-[#1E3A5F]/40',
    text: 'text-[#fcd34d] border-[#f59e0b]/30 bg-[#f59e0b]/10',
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload CSV Data</DialogTitle>
        </DialogHeader>

        {step === 'drop' && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-2 border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${dragOver ? 'border-[#2DD4BF] bg-[#2DD4BF]/5' : 'border-[#1C2730] hover:border-[#2DD4BF]/40 hover:bg-[#0F3D38]/30'}`}
          >
            <div className="w-16 h-16 rounded-2xl bg-[#0F3D38] border border-[#2DD4BF]/20 flex items-center justify-center animate-float">
              <Upload className="w-8 h-8 text-[#2DD4BF]" />
            </div>
            <div className="text-center">
              <p className="text-[#e2e8f0] font-medium mb-1">Drop your CSV here, or click to browse</p>
              <p className="text-xs text-[#4a4a6a]">Supports .csv files up to 50MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
          </div>
        )}

        {step === 'preview' && preview && file && (
          <div className="mt-2 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#131920] border border-[#1C2730]">
              <FileText className="w-5 h-5 text-[#2DD4BF] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#e2e8f0]">{file.name}</p>
                <p className="text-xs text-[#4a4a6a]">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={reset} className="text-[#4a4a6a] hover:text-[#ef4444] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Schema */}
            <div>
              <p className="text-xs font-mono font-semibold text-[#8FA3B8] uppercase tracking-wider mb-2">Detected Schema</p>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                {preview.schema.map(col => (
                  <div key={col.name} className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#e2e8f0] font-mono">{col.name}</span>
                    <span className={`px-1.5 py-0.5 rounded border text-xs font-mono ${typeColors[col.type] || typeColors.text}`}>
                      {col.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview table */}
            <div>
              <p className="text-xs font-mono font-semibold text-[#8FA3B8] uppercase tracking-wider mb-2">Data Preview (first 5 rows)</p>
              <div className="overflow-x-auto overflow-y-auto max-h-48 rounded-xl border border-[#1C2730]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1C2730] bg-[#131920] sticky top-0">
                      {preview.headers.map(h => (
                        <th key={h} className="px-3 py-2 text-left font-mono text-[#8FA3B8] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, i) => (
                      <tr key={i} className="border-b border-[#1C2730]/50 hover:bg-[#131920]/70">
                        {preview.headers.map(h => (
                          <td key={h} className="px-3 py-2 font-mono text-[#8FA3B8] whitespace-nowrap">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button onClick={reset} className="text-xs text-[#4a4a6a] hover:text-[#94a3b8] transition-colors">
                Upload a different file
              </button>
              <Button onClick={handleUpload} className="gap-2 bg-[#2DD4BF] text-[#080B0E] hover:bg-[#2DD4BF]/90 font-semibold">
                Start Querying This Data
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="mt-2 space-y-4 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#0F3D38] border border-[#2DD4BF]/20 flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-[#2DD4BF] animate-bounce" />
            </div>
            <div>
              <p className="text-[#e2e8f0] font-medium mb-1">Uploading and indexing your data...</p>
              <p className="text-xs text-[#4a4a6a] mb-4">{file?.name}</p>
              <Progress value={progress} className="w-full max-w-xs mx-auto" />
              <p className="text-xs text-[#4a4a6a] mt-2 font-mono">{Math.round(progress)}%</p>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="mt-2 py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
            </div>
            <div>
              <p className="text-[#e2e8f0] font-medium mb-1">Data ready!</p>
              <p className="text-xs text-[#4a4a6a]">Your CSV has been indexed. Start asking questions!</p>
            </div>
            <Button onClick={handleClose} className="mx-auto bg-[#2DD4BF] text-[#080B0E] hover:bg-[#2DD4BF]/90 font-semibold">Start Querying</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
