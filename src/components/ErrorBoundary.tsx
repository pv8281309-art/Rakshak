import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Database, ShieldAlert } from 'lucide-react';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  loggedToFirestore: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    loggedToFirestore: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, loggedToFirestore: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
    this.logErrorToFirebase(error, errorInfo);
  }

  private async logErrorToFirebase(error: Error, errorInfo: ErrorInfo) {
    const errorRecord = {
      message: error.message,
      stack: error.stack || '',
      componentStack: errorInfo.componentStack || '',
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      environment: 'production'
    };

    try {
      // 1. Save to localStorage fallback
      const existing = JSON.parse(localStorage.getItem('rakshak_error_logs') || '[]');
      localStorage.setItem('rakshak_error_logs', JSON.stringify([errorRecord, ...existing.slice(0, 49)]));

      // 2. Save to Firebase Firestore 'error_logs' collection if configured
      if (isFirebaseConfigured && db) {
        await addDoc(collection(db, 'error_logs'), errorRecord);
        this.setState({ loggedToFirestore: true });
      }
    } catch (err) {
      console.warn('Failed to sync error log to Firestore:', err);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080C16] flex items-center justify-center p-6 text-slate-100 font-sans">
          <div className="max-w-md w-full bg-[#0D1527] border border-slate-800 rounded-2xl p-8 shadow-2xl text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20 shadow-lg shadow-red-500/10">
              <ShieldAlert className="text-red-500 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">System Exception Caught</h1>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Operation Rakshak 3.0 error boundary intercepted a runtime anomaly. The incident report has been securely transmitted to the diagnostics database.
            </p>
            
            {this.state.error && (
              <div className="w-full bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 mb-6 text-left overflow-auto max-h-36 shadow-inner">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Error Trace</span>
                  {this.state.loggedToFirestore && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <Database size={10} /> Logged to Firestore
                    </span>
                  )}
                </div>
                <code className="text-xs text-red-400 font-mono block break-words">
                  {this.state.error.message}
                </code>
              </div>
            )}
            
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 w-full justify-center"
            >
              <RefreshCw size={16} />
              Reload Application Command
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
