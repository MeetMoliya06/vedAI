"use client";

import { useState, useRef, useEffect } from "react";
import { AssessmentData } from "@/app/page";
import { ArrowLeft, CheckCircle, XCircle, Search, HelpCircle, FileQuestion } from "lucide-react";
import { clsx } from "clsx";
// pdfjs-dist is imported dynamically to avoid SSR issues (DOMMatrix is browser-only)

interface ResultsViewerProps {
  data: AssessmentData;
  answerSheetUrl: string;
  onReset: () => void;
}

export default function ResultsViewer({ data, answerSheetUrl, onReset }: ResultsViewerProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(answerSheetUrl);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgDims, setImgDims] = useState({ width: 0, height: 0 });
  const [mobileTab, setMobileTab] = useState<"questions" | "answerSheet">("questions");

  // Handle PDF conversion if the uploaded file was a PDF
  useEffect(() => {
    const convertPdfToImage = async () => {
      try {
        const response = await fetch(answerSheetUrl);
        const blob = await response.blob();
        
        if (blob.type === 'application/pdf') {
          const arrayBuffer = await blob.arrayBuffer();
          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          const page = await pdf.getPage(1); // For simplicity, grab first page
          const viewport = page.getViewport({ scale: 2 });
          
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({ canvasContext: ctx, viewport }).promise;
          setImageUrl(canvas.toDataURL("image/png"));
        }
      } catch (err) {
        console.error("Error handling PDF", err);
      }
    };
    
    convertPdfToImage();
  }, [answerSheetUrl]);

  // Update dimensions when image loads or resizes
  useEffect(() => {
    const updateDims = () => {
      if (imgRef.current) {
        setImgDims({
          width: imgRef.current.clientWidth,
          height: imgRef.current.clientHeight,
        });
      }
    };
    
    window.addEventListener("resize", updateDims);
    // Initial delay to allow image render
    setTimeout(updateDims, 500);
    
    return () => window.removeEventListener("resize", updateDims);
  }, [imageUrl]);

  const activeQuestion = data.questions.find(q => q.id === selectedQuestion);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="h-16 shrink-0 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onReset}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors flex items-center space-x-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm hidden md:inline">Upload New</span>
          </button>
          <div className="h-6 w-px bg-zinc-800 mx-2 hidden md:block" />
          <h1 className="text-lg md:text-xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Assessment Results
          </h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Score</span>
            <span className="text-lg md:text-xl font-bold text-white">
              <span className="text-indigo-400">{data.summary.total_score}</span> / {data.summary.max_score}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="flex md:hidden border-b border-zinc-800 bg-zinc-900/50">
        <button 
          onClick={() => setMobileTab("questions")}
          className={clsx(
            "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
            mobileTab === "questions" ? "border-indigo-500 text-indigo-400" : "border-transparent text-zinc-400"
          )}
        >
          Questions
        </button>
        <button 
          onClick={() => setMobileTab("answerSheet")}
          className={clsx(
            "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
            mobileTab === "answerSheet" ? "border-purple-500 text-purple-400" : "border-transparent text-zinc-400"
          )}
        >
          Answer Map
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel - Questions List */}
        <div className={clsx(
          "w-full md:w-1/2 lg:w-[45%] flex-col border-r border-zinc-800 bg-zinc-950/50 absolute inset-0 z-10 md:static md:flex",
          mobileTab === "questions" ? "flex" : "hidden"
        )}>
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <h2 className="text-sm font-medium text-zinc-400 flex items-center space-x-2">
              <FileQuestion className="w-4 h-4" />
              <span>Extracted Questions ({data.questions.length})</span>
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {data.questions.map((q) => {
              const isSelected = selectedQuestion === q.id;
              
              return (
                <div 
                  key={q.id}
                  onClick={() => setSelectedQuestion(q.id)}
                  className={clsx(
                    "p-5 rounded-xl border transition-all duration-200 cursor-pointer group",
                    isSelected 
                      ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]" 
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-800/60"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={clsx(
                        "flex items-center justify-center min-w-[28px] h-[28px] px-2 rounded bg-zinc-800 text-xs font-bold font-mono",
                        isSelected ? "text-indigo-300" : "text-zinc-400"
                      )}>
                        Q{q.id}
                      </span>
                      {q.is_correct !== undefined && (
                        q.is_correct 
                          ? <CheckCircle className="w-5 h-5 text-green-500" />
                          : <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="text-sm font-mono font-medium">
                      {q.score !== undefined ? <span className={q.score > 0 ? "text-green-400" : "text-zinc-500"}>{q.score} pts</span> : <span className="text-zinc-500">-</span>}
                    </div>
                  </div>
                  
                  <p className="text-zinc-200 text-sm mb-4 leading-relaxed font-medium">
                    {q.question_text}
                  </p>
                  
                  <div className="bg-black/30 rounded-lg p-3 mb-3 border border-zinc-800/50">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1 block">Student Answer</span>
                    {q.student_answer ? (
                      <p className="text-zinc-300 text-sm italic font-serif">"{q.student_answer}"</p>
                    ) : (
                      <p className="text-zinc-600 text-sm italic">No answer found</p>
                    )}
                  </div>
                  
                  {q.feedback && (
                    <p className="text-xs text-zinc-400">
                      <span className="font-semibold text-zinc-500">AI Feedback:</span> {q.feedback}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Answer Sheet Viewer */}
        <div className={clsx(
          "flex-1 bg-zinc-900 overflow-hidden flex-col relative",
          mobileTab === "answerSheet" ? "flex" : "hidden md:flex"
        )}>
          <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-zinc-800 text-xs font-medium text-zinc-300 shadow-xl flex items-center space-x-2">
            <Search className="w-3 h-3 text-indigo-400" />
            <span>Answer Sheet Viewer</span>
          </div>
          
          {activeQuestion && !activeQuestion.bounding_box && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/50 text-orange-200 text-sm flex items-center space-x-2 backdrop-blur-md shadow-xl">
              <HelpCircle className="w-4 h-4" />
              <span>Location not found on page</span>
            </div>
          )}

          <div className="flex-1 overflow-auto flex items-start justify-center p-8 custom-scrollbar">
            <div className="relative inline-block max-w-full shadow-2xl rounded-sm overflow-hidden border border-zinc-800/50 ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                ref={imgRef}
                src={imageUrl} 
                alt="Student Answer Sheet" 
                className="max-w-full h-auto object-contain block"
                onLoad={() => {
                  if (imgRef.current) {
                    setImgDims({
                      width: imgRef.current.clientWidth,
                      height: imgRef.current.clientHeight,
                    });
                  }
                }}
              />
              
              {/* Bounding Box Overlay */}
              {activeQuestion?.bounding_box && imgDims.width > 0 && (
                <div 
                  className="absolute border-2 border-indigo-500 bg-indigo-500/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out z-10 rounded-sm pointer-events-none flex items-start justify-end"
                  style={{
                    top: `${(activeQuestion.bounding_box[0] / 1000) * 100}%`,
                    left: `${(activeQuestion.bounding_box[1] / 1000) * 100}%`,
                    height: `${((activeQuestion.bounding_box[2] - activeQuestion.bounding_box[0]) / 1000) * 100}%`,
                    width: `${((activeQuestion.bounding_box[3] - activeQuestion.bounding_box[1]) / 1000) * 100}%`,
                  }}
                >
                  <div className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-sm pointer-events-none">
                    Q{activeQuestion.id}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
