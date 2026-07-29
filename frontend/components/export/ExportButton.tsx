'use client';

import React, { useState } from 'react';
import { useDashboard } from '../dashboard/DashboardContext';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';

export default function ExportButton() {
  const { data } = useDashboard();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (loading || !data) return;

    setLoading(true);
    setError(null);

    try {
      // Dynamic imports to prevent SSR (Server-Side Rendering) failures in Next.js
      const { toPng } = await import('html-to-image');
      const { default: jsPDF } = await import('jspdf');

      const node = document.getElementById('executive-summary');
      if (!node) {
        throw new Error('Export summary node not found in DOM.');
      }

      // Render hidden node to high-res PNG
      const dataUrl = await toPng(node, {
        pixelRatio: 2, // Retain sharp details and text quality
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
      // Maintain exact aspect ratio of rendering node
      const pdfHeight = (node.scrollHeight * pdfWidth) / node.scrollWidth;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      // Generate clean filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      pdf.save(`workforce-pulse-executive-summary-${timestamp}.pdf`);
    } catch (err: any) {
      console.error('PDF Export Error:', err);
      setError(err?.message || 'Failed to render PDF summary.');
      // Auto-clear error after 4 seconds
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
        className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-emerald-500/5 select-none"
      >
        {loading ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>Generating Report...</span>
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
        <div className="absolute right-0 top-full mt-2 bg-rose-50 border border-rose-100 rounded-lg p-2.5 shadow-md flex items-center space-x-2 text-rose-800 text-[10px] font-bold z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
