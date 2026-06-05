"use client"
import { WarningIcon } from "@/components/Icons"

interface Props {
  error?: string | null
  onRetry?: () => void
}

export default function ErrorFallback({ error, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mb-5">
        <WarningIcon className="w-8 h-8 text-red-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Something went wrong</h2>
      {error && (
        <p className="text-sm text-[var(--text-muted)] mb-4 max-w-md">{error}</p>
      )}
      <div className="flex items-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-[var(--accent)] hover:opacity-90 text-white font-medium px-5 py-2 rounded-lg text-sm transition-all"
          >
            Try again
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="border border-[var(--border)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium px-5 py-2 rounded-lg text-sm transition-all"
        >
          Reload page
        </button>
      </div>
    </div>
  )
}
