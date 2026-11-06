import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import ErrorPage from "./ErrorPage";

interface State {
  hasError: boolean;
}

/**
 * Catches errors thrown while rendering (a bug in a page, a failed lazy
 * chunk after a deploy) and shows the 500 page instead of a blank screen.
 * Error boundaries must be class components.
 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          code={500}
          message="This page crashed unexpectedly. Reloading usually fixes it — if it keeps happening, contact an administrator."
          actions={["retry", "home"]}
        />
      );
    }
    return this.props.children;
  }
}
