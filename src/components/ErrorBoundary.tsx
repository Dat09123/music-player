"use client"

import { Component, type ReactNode, type ErrorInfo } from "react"
import { WarningIcon } from "@/components/Icons"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  label?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? ` - ${this.props.label}` : ""}]:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
            <WarningIcon className="w-6 h-6 text-red-400" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
            {this.props.label || "Something went wrong"}
          </p>
          <p className="text-xs text-[var(--text-muted)] max-w-sm">
            This section encountered an error. Try refreshing the page.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
