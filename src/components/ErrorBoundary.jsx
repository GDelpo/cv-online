import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, info) {
    console.error('cv-online: render failed', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    // INTENTIONAL: no content or ui strings here, because bad content is one of the things that lands here.
    return (
      <p role="alert" className="wrap section">
        Algo salió mal al mostrar esta página. Something went wrong showing this page.
      </p>
    )
  }
}
