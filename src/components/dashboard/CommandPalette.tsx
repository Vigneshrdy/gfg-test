import { useEffect, useState, useCallback } from 'react'
import {
  Plus, Upload, History, Share2, FileDown, Settings, Moon, Sun,
  Search, Terminal, X,
} from 'lucide-react'

interface Command {
  id: string
  label: string
  shortcut?: string
  icon: React.ReactNode
  action: () => void
}

interface CommandPaletteProps {
  onNewDashboard: () => void
  onUploadCSV: () => void
  onNavigateHistory: () => void
  onNavigateSettings: () => void
  onToggleTheme: () => void
  onShareDashboard?: () => void
  onExportDashboard?: () => void
  onRunQuery: (q: string) => void
  isDark: boolean
  hasDashboard: boolean
}

export default function CommandPalette({
  onNewDashboard,
  onUploadCSV,
  onNavigateHistory,
  onNavigateSettings,
  onToggleTheme,
  onShareDashboard,
  onExportDashboard,
  onRunQuery,
  isDark,
  hasDashboard,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const close = useCallback(() => {
    setOpen(false)
    setSearch('')
  }, [])

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [close])

  const commands: Command[] = [
    {
      id: 'new', label: 'New Dashboard', shortcut: '⌘ N', icon: <Plus className="w-4 h-4" />,
      action: () => { onNewDashboard(); close() },
    },
    {
      id: 'csv', label: 'Upload CSV', shortcut: '', icon: <Upload className="w-4 h-4" />,
      action: () => { onUploadCSV(); close() },
    },
    {
      id: 'history', label: 'View History', shortcut: '', icon: <History className="w-4 h-4" />,
      action: () => { onNavigateHistory(); close() },
    },
    {
      id: 'settings', label: 'Settings', shortcut: '', icon: <Settings className="w-4 h-4" />,
      action: () => { onNavigateSettings(); close() },
    },
    {
      id: 'theme', label: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode', shortcut: '', icon: isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      action: () => { onToggleTheme(); close() },
    },
    ...(hasDashboard && onShareDashboard ? [{
      id: 'share', label: 'Share Dashboard', shortcut: '', icon: <Share2 className="w-4 h-4" />,
      action: () => { onShareDashboard!(); close() },
    }] : []),
    ...(hasDashboard && onExportDashboard ? [{
      id: 'export', label: 'Export Dashboard', shortcut: '', icon: <FileDown className="w-4 h-4" />,
      action: () => { onExportDashboard!(); close() },
    }] : []),
  ]

  const filtered = search.trim()
    ? commands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()))
    : commands

  const isQueryMode = search.trim() && filtered.length === 0

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(8,11,14,0.85)', backdropFilter: 'blur(20px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) close() }}
    >
      <div
        className="w-full max-w-[560px] mx-4 rounded-xl overflow-hidden shadow-modal"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-default)' }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && isQueryMode && search.trim()) {
                onRunQuery(search.trim())
                close()
              }
            }}
            placeholder="Search commands or type a query..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-base)' }}
          />
          <button onClick={close} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Commands list */}
        <div className="py-2 max-h-[360px] overflow-y-auto">
          {isQueryMode ? (
            <button
              onClick={() => { onRunQuery(search.trim()); close() }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
              style={{ background: 'var(--accent-dim)', color: 'var(--text-accent)' }}
            >
              <Terminal className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Run query: <strong>"{search.trim()}"</strong></span>
              <span className="ml-auto text-xs" style={{ color: 'var(--text-tertiary)' }}>↵ Enter</span>
            </button>
          ) : (
            filtered.map(cmd => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-overlay)] transition-colors group"
              >
                <span style={{ color: 'var(--text-tertiary)' }} className="group-hover:text-[var(--accent-base)] transition-colors">
                  {cmd.icon}
                </span>
                <span className="text-sm flex-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-base)' }}>
                  {cmd.label}
                </span>
                {cmd.shortcut && (
                  <span className="text-xs px-1.5 py-0.5 rounded font-mono"
                    style={{ color: 'var(--text-tertiary)', background: 'var(--bg-sunken)', border: '1px solid var(--border-faint)' }}>
                    {cmd.shortcut}
                  </span>
                )}
              </button>
            ))
          )}
          {!isQueryMode && filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-base)' }}>
              No commands found
            </p>
          )}
        </div>

        <div className="px-4 py-2 border-t text-xs font-mono flex items-center gap-4" style={{ borderColor: 'var(--border-faint)', color: 'var(--text-tertiary)' }}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>Esc close</span>
          <span className="ml-auto">Ctrl+K to open</span>
        </div>
      </div>
    </div>
  )
}
