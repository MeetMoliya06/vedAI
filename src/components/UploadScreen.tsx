"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Image as ImageIcon, X } from "lucide-react";
import { clsx } from "clsx";

interface UploadScreenProps {
  onProcess: (questionPaper: File[], answerSheet: File[]) => void;
  error: string | null;
}

export default function UploadScreen({ onProcess, error }: UploadScreenProps) {
  const [questionFiles, setQuestionFiles] = useState<File[]>([]);
  const [answerFiles, setAnswerFiles] = useState<File[]>([]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, type: "question" | "answer") => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || f.type === 'application/pdf');
    if (type === "question") setQuestionFiles(prev => [...prev, ...files]);
    else setAnswerFiles(prev => [...prev, ...files]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "question" | "answer") => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (type === "question") setQuestionFiles(prev => [...prev, ...files]);
      else setAnswerFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number, type: "question" | "answer") => {
    if (type === "question") setQuestionFiles(prev => prev.filter((_, i) => i !== index));
    else setAnswerFiles(prev => prev.filter((_, i) => i !== index));
  };

  const canProcess = questionFiles.length > 0 && answerFiles.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          VedaAI Assessment Extraction
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Upload a question paper and student answer sheet. Our AI will automatically map answers, grade them, and generate insights.
        </p>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-center">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Question Paper Dropzone */}
        <div 
          className={clsx(
            "relative group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all duration-300",
            questionFiles.length > 0 ? "border-indigo-500/50 bg-indigo-500/5" : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800/50"
          )}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, "question")}
        >
          <div className="absolute inset-0 w-full h-full glass-effect rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {questionFiles.length === 0 ? (
            <>
              <div className="w-16 h-16 mb-4 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">Question Paper</h3>
              <p className="text-zinc-500 text-sm text-center mb-6">Drag & drop PDF or images here, or click to browse</p>
            </>
          ) : (
            <div className="w-full flex flex-col items-center">
              <h3 className="text-lg font-medium text-indigo-400 mb-4">Question Paper ({questionFiles.length})</h3>
              <div className="w-full space-y-2 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {questionFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/50 border border-zinc-800">
                    <span className="text-sm truncate max-w-[200px] text-zinc-300">{f.name}</span>
                    <button onClick={() => removeFile(i, "question")} className="p-1 hover:bg-zinc-800 rounded-md transition-colors">
                      <X className="w-4 h-4 text-zinc-400 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <label className="cursor-pointer">
            <input 
              type="file" 
              multiple 
              accept="image/*,application/pdf" 
              className="hidden" 
              onChange={(e) => handleFileSelect(e, "question")}
            />
            <span className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors">
              Browse Files
            </span>
          </label>
        </div>

        {/* Answer Sheet Dropzone */}
        <div 
          className={clsx(
            "relative group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all duration-300",
            answerFiles.length > 0 ? "border-purple-500/50 bg-purple-500/5" : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800/50"
          )}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, "answer")}
        >
          {answerFiles.length === 0 ? (
            <>
              <div className="w-16 h-16 mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">Answer Sheet</h3>
              <p className="text-zinc-500 text-sm text-center mb-6">Drag & drop PDF or images here, or click to browse</p>
            </>
          ) : (
             <div className="w-full flex flex-col items-center">
              <h3 className="text-lg font-medium text-purple-400 mb-4">Answer Sheet ({answerFiles.length})</h3>
              <div className="w-full space-y-2 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {answerFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/50 border border-zinc-800">
                    <span className="text-sm truncate max-w-[200px] text-zinc-300">{f.name}</span>
                    <button onClick={() => removeFile(i, "answer")} className="p-1 hover:bg-zinc-800 rounded-md transition-colors">
                      <X className="w-4 h-4 text-zinc-400 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <label className="cursor-pointer">
            <input 
              type="file" 
              multiple 
              accept="image/*,application/pdf" 
              className="hidden" 
              onChange={(e) => handleFileSelect(e, "answer")}
            />
            <span className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors">
              Browse Files
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={() => onProcess(questionFiles, answerFiles)}
          disabled={!canProcess}
          className={clsx(
            "flex items-center space-x-2 px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)]",
            canProcess 
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white hover:scale-105 active:scale-95" 
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none"
          )}
        >
          <Upload className="w-5 h-5" />
          <span>Extract & Grade</span>
        </button>
      </div>
    </div>
  );
}
