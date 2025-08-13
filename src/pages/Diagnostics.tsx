import { DiagnosticPanel } from '@/components/DiagnosticPanel';

export default function Diagnostics() {
  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-3">
              System Diagnostics
            </h1>
            <p className="text-text-secondary text-lg">
              Comprehensive testing and troubleshooting for your document processing system
            </p>
          </div>

          <DiagnosticPanel />
        </div>
      </div>
    </div>
  );
}