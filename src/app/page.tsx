"use client";

import { useState } from "react";
import UploadScreen from "@/components/UploadScreen";
import LoadingScreen from "@/components/LoadingScreen";
import ResultsViewer from "@/components/ResultsViewer";

export type AssessmentData = {
  questions: Array<{
    id: string;
    question_text: string;
    student_answer: string;
    is_correct: boolean;
    score: number;
    feedback: string;
    bounding_box: [number, number, number, number] | null;
  }>;
  summary: {
    total_score: number;
    max_score: number;
    feedback: string;
  };
};

export default function Home() {
  const [stage, setStage] = useState<"upload" | "loading" | "results">("upload");
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [answerSheetUrl, setAnswerSheetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async (questionPaper: File[], answerSheet: File[]) => {
    setStage("loading");
    setError(null);

    // Save answer sheet for displaying in the results viewer
    if (answerSheet.length > 0) {
      setAnswerSheetUrl(URL.createObjectURL(answerSheet[0]));
    }

    const formData = new FormData();
    questionPaper.forEach((file) => formData.append("questionPaper", file));
    answerSheet.forEach((file) => formData.append("answerSheet", file));

    try {
      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process documents");
      }

      setAssessmentData(data);
      setStage("results");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setStage("upload");
    }
  };

  const handleReset = () => {
    setAssessmentData(null);
    setAnswerSheetUrl(null);
    setStage("upload");
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#09090b] to-[#09090b] -z-10" />
      
      {stage === "upload" && (
        <UploadScreen onProcess={handleProcess} error={error} />
      )}
      
      {stage === "loading" && <LoadingScreen />}
      
      {stage === "results" && assessmentData && answerSheetUrl && (
        <ResultsViewer 
          data={assessmentData} 
          answerSheetUrl={answerSheetUrl} 
          onReset={handleReset} 
        />
      )}
    </main>
  );
}
