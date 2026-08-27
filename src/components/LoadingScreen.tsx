"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, Cpu, Search } from "lucide-react";
import { useEffect, useState } from "react";

const steps = [
  { icon: Search, text: "Scanning documents..." },
  { icon: Brain, text: "Extracting questions..." },
  { icon: Cpu, text: "Mapping student answers..." },
  { icon: Sparkles, text: "Evaluating and grading..." },
];

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="relative">
        <div className="absolute -inset-10 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <motion.div 
          className="relative w-32 h-32 mb-12 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 shadow-2xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 opacity-50" />
          <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 opacity-50" />
          <Brain className="w-12 h-12 text-indigo-400" />
        </motion.div>
      </div>
      
      <div className="h-20 flex flex-col items-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: currentStep === index ? 1 : 0, 
                y: currentStep === index ? 0 : -10,
                display: currentStep === index ? "flex" : "none"
              }}
              className="items-center space-x-3 text-xl font-medium text-zinc-300"
            >
              <Icon className="w-6 h-6 text-indigo-400 animate-pulse" />
              <span>{step.text}</span>
            </motion.div>
          );
        })}
      </div>
      
      <p className="mt-8 text-sm text-zinc-500">This may take up to a minute depending on document size.</p>
    </div>
  );
}
