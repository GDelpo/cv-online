import React from 'react';
import ErrorBoundary from './index';

// Componente funcional helper para crear ErrorBoundaries más fácilmente
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  const WithErrorBoundaryComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithErrorBoundaryComponent;
};

// Hook para reportar errores manualmente
export const useErrorHandler = () => {
  return React.useCallback((error, errorInfo = {}) => {
    console.error('Manual error report:', error, errorInfo);
    
    // Aquí podrías integrar con servicios de monitoreo
    // reportErrorToService(error, errorInfo);
  }, []);
};