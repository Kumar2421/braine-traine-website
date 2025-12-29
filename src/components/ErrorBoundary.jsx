import { Component } from 'react'
import './ErrorBoundary.css'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })

    // In production, you would send this to an error reporting service
    if (import.meta.env.PROD) {
      // Example: sendToErrorReportingService(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="errorBoundary">
          <div className="errorBoundary__container">
            <div className="errorBoundary__icon" aria-hidden="true">⚠️</div>
            <h1 className="errorBoundary__title">Something went wrong</h1>
            <p className="errorBoundary__message">
              We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="errorBoundary__details">
                <summary className="errorBoundary__summary">Error details (development only)</summary>
                <pre className="errorBoundary__pre">{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre className="errorBoundary__pre">{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}
            <div className="errorBoundary__actions">
              <button className="button button--primary" onClick={this.handleReset}>
                Go to Home
              </button>
              <button
                className="button button--outline"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

