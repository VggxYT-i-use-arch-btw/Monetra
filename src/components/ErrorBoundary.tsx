import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  crashed: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { crashed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { crashed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // A tela de recuperação mantém o app navegável depois de uma falha de renderização.
  }

  private returnHome = (): void => {
    window.location.hash = '#/';
    this.setState({ crashed: false });
  };

  render() {
    if (this.state.crashed) {
      return (
        <main className="crash-fallback" role="alert">
          <span className="brand-name">Monetra<small>by Boreas</small></span>
          <h1>Não foi possível abrir esta página.</h1>
          <p>Você pode voltar ao início e continuar usando o Monetra.</p>
          <button className="button button-primary" onClick={this.returnHome}>Voltar ao início</button>
        </main>
      );
    }
    return this.props.children;
  }
}
