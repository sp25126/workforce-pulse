'use client';

import React, { useState } from 'react';
import { useDashboard } from '../dashboard/DashboardContext';
import { Download, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ExportButton() {
  const { data } = useDashboard();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (loading || !data) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Dynamic imports to prevent SSR failures in Next.js
      const { toPng } = await import('html-to-image');
      const { default: jsPDF } = await import('jspdf');

      const node = document.getElementById('executive-summary');
      if (!node) {
        throw new Error('Export summary node not found in DOM.');
      }

      // Render hidden node to high-res PNG
      const dataUrl = await toPng(node, {
        pixelRatio: 2, // High resolution crisp text
        cacheBust: true,
        style: {
          position: 'static',
          left: '0',
          top: '0',
          transform: 'none'
        }
      });

      // Create A4 PDF (210mm x 297mm)
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = 210;
      const pdfHeight = (node.scrollHeight * pdfWidth) / node.scrollWidth;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      const timestamp = new Date().toISOString().slice(0, 10);
      pdf.save(`workforce-pulse-executive-summary-${timestamp}.pdf`);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('PDF Export Error:', err);
      setError(err?.message || 'Failed to render PDF summary.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center">
      <button
        onClick={handleExport}
        disabled={loading || !data}
        className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer select-none ${
          success
            ? 'bg-emerald-600 text-white border border-emerald-700'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700/30 hover:shadow-md hover:shadow-emerald-600/10'
        }`}
      >
        {loading ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />
            <span>Downloaded!</span>
          </>
        ) : (
          <>
            <Download className="h-3.5 w-3.5" />
            <span>Export Summary</span>
          </>
        )}
      </button>

      {/* Floating Error Alert */}
      {error && (
        <div className="absolute right-0 top-full mt-2 bg-rose-50 border border-rose-200 rounded-xl p-2.5 shadow-lg flex items-center space-x-2 text-rose-800 text-[11px] font-bold z-50 animate-in fade-in slide-in-from-top-2 duration-150 whitespace-nowrap">
          <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
