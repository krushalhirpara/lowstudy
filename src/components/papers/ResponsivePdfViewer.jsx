"use client";

import { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Lock, 
  ExternalLink,
  AlertCircle,
  Eye
} from 'lucide-react';

export default function ResponsivePdfViewer({
  fileUrl,
  paperTitle,
  allowDownload = true,
  fallbackStructuredData = null
}) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 15, 175));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 15, 60));
  const handleResetZoom = () => setZoomLevel(100);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.warn('Fullscreen error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    if (!allowDownload) return;
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `${paperTitle || 'university-paper'}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[650px] sm:h-[750px]'
      }`}
    >
      {/* Viewer Controls Toolbar */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
            {paperTitle || 'Examination Question Paper'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom Buttons */}
          <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5 text-slate-300">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold px-2 text-slate-400 min-w-[40px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded border-l border-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Download Button / Permission Guard */}
          {allowDownload ? (
            <button
              onClick={handleDownload}
              disabled={!fileUrl}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          ) : (
            <span className="px-2.5 py-1.5 bg-slate-800/80 border border-slate-700 text-slate-400 text-[11px] font-semibold rounded-lg flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Institutional View Only</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Viewer Body */}
      <div className="flex-1 bg-slate-950 overflow-auto relative p-4 flex items-center justify-center">
        {fileUrl ? (
          <div 
            className="w-full h-full flex items-center justify-center transition-transform origin-top"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <iframe
              src={`${fileUrl}#toolbar=0&navpanes=0`}
              title={paperTitle}
              className="w-full h-full rounded-lg border border-slate-800 bg-white"
            />
          </div>
        ) : fallbackStructuredData ? (
          /* Structured Fallback Document when PDF URL is archived in database */
          <div 
            className="w-full max-w-3xl bg-white text-slate-900 rounded-lg p-6 sm:p-10 shadow-2xl space-y-6 overflow-y-auto max-h-full font-serif"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            {/* University Paper Header */}
            <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
              <div className="text-xs font-bold tracking-widest uppercase text-slate-700">
                {fallbackStructuredData.university?.name || 'Saurashtra University, Rajkot'}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
                {fallbackStructuredData.course?.name || 'LL.B. (Three Year Degree Course)'} Examination
              </h2>
              <div className="text-sm font-bold text-slate-800">
                {fallbackStructuredData.subject?.title} (Paper Code: {fallbackStructuredData.paperCode || fallbackStructuredData.subject?.shortCode})
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 pt-2 border-t border-slate-300 mt-3">
                <span>Time: {fallbackStructuredData.durationMinutes || 180} Minutes</span>
                <span>Session: {fallbackStructuredData.examSession} {fallbackStructuredData.examYear}</span>
                <span>Total Marks: {fallbackStructuredData.totalMarks || 70}</span>
              </div>
            </div>

            {/* General Instructions */}
            <div className="bg-slate-100 p-3 rounded text-xs font-sans text-slate-700 border border-slate-200">
              <strong className="block mb-0.5">Instructions:</strong>
              {fallbackStructuredData.instructions || '1. All questions are compulsory. 2. Figures to the right indicate full marks. 3. Cite statutory provisions and relevant case laws.'}
            </div>

            {/* Sections and Questions */}
            <div className="space-y-6">
              {fallbackStructuredData.sections?.map((sec, secIdx) => (
                <div key={secIdx} className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1">
                    {sec.name}
                  </h3>
                  <div className="space-y-4">
                    {sec.questions?.map((q, qIdx) => (
                      <div key={q.mappingId || qIdx} className="flex items-start justify-between gap-4 text-sm leading-relaxed">
                        <div className="space-y-1">
                          <span className="font-bold mr-2">{q.questionNumber}.</span>
                          <span className="font-medium text-slate-900">{q.questionText}</span>
                          {q.questionTextGu && (
                            <div className="text-xs text-slate-600 font-sans mt-0.5 font-gujarati">
                              {q.questionTextGu}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-xs shrink-0 text-slate-800 bg-slate-100 px-2 py-1 rounded">
                          [{q.marks} Marks]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-8 border-t border-slate-300 text-xs text-slate-500 font-sans">
              — End of Examination Question Paper —
            </div>
          </div>
        ) : (
          <div className="text-center p-8 space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Paper Document Ingested as Structured Exam Mode</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              This paper is available in interactive question practice mode and official mock test simulation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
