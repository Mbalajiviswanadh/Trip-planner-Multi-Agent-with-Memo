import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('UI crashed:', error, info)
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="font-display text-3xl">Something broke on this screen</h1>
        <p className="max-w-sm text-sm text-muted">Your chats are safe. Reload the page to continue.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
      </div>
    )
  }
}
