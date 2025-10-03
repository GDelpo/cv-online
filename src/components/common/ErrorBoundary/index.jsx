import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { COMMON_STYLES } from '@constants/styles';
import Button from '@ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(caughtError, errorInfo) {
    this.setState({
      error: caughtError,
      errorInfo: errorInfo
    });

    // Log del error para debugging
    console.error('ErrorBoundary caught an error:', caughtError, errorInfo);

    // Aquí podrías enviar el error a un servicio de monitoreo
    // como Sentry, LogRocket, etc.
    if (this.props.onError) {
      this.props.onError(caughtError, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback personalizable
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // UI de fallback por defecto
      return (
        <div className={`
          p-6 rounded-lg border border-red-200 dark:border-red-800
          bg-red-50 dark:bg-red-950/50
          ${COMMON_STYLES.transition}
        `}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-2 rounded-full bg-red-100 dark:bg-red-900/50">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                {this.props.title || 'Algo salió mal'}
              </h3>
              
              <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                {this.props.message || 'Ha ocurrido un error inesperado. Por favor, intenta recargar la sección.'}
              </p>

              {/* Mostrar detalles del error en desarrollo */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded border text-xs">
                  <summary className="cursor-pointer font-medium text-red-700 dark:text-red-300 mb-2">
                    Detalles del error (desarrollo)
                  </summary>
                  <pre className="whitespace-pre-wrap text-red-600 dark:text-red-400 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRetry}
                  className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
                
                {this.props.showReloadButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/50"
                  >
                    Recargar página
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;