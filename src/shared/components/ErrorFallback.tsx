import { Component, type ReactNode } from 'react'

interface Props {
  fallback: ReactNode | ((error: Error) => ReactNode)
  onError?: (error: Error) => void
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error): void {
    this.props.onError?.(error)
  }

  override render(): ReactNode {
    const { error } = this.state
    if (error) {
      const { fallback } = this.props
      return typeof fallback === 'function' ? fallback(error) : fallback
    }
    return this.props.children
  }
}

export function AppErrorFallback({ error }: { error: Error }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <p className="font-hand text-2xl text-terracotta">Well, that's embarrassing.</p>
      <h1 className="mt-2 text-3xl">Something went wrong while drawing the corridor.</h1>
      <p className="mt-4 text-graphite">
        Reloading the page usually fixes it. If it keeps happening, the browser may be blocking
        WebGL or JavaScript modules.
      </p>
      {import.meta.env.DEV && (
        <pre className="mt-6 overflow-auto rounded bg-paper-deep p-4 text-xs text-graphite">
          {error.message}
        </pre>
      )}
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="sketch-border mt-8 w-fit bg-ink px-5 py-2.5 text-cream"
      >
        Reload
      </button>
    </main>
  )
}
