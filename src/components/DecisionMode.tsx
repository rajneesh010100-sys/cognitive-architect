import { useState } from 'react';
import { DecisionCase } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle } from 'lucide-react';

export function DecisionMode({ cases }: { cases: DecisionCase[] }) {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-sans font-semibold tracking-tight mb-2">Decision Mode</h2>
        <p className="text-[#a3a3a3] font-serif italic text-sm">
          Real-world clinical cases with incomplete data. Force your diagnostic reasoning.
        </p>
      </div>

      {cases.map((c, i) => (
        <CaseCard key={c.id} data={c} index={i} />
      ))}
    </div>
  );
}

function CaseCard({ data, index }: { data: DecisionCase; index: number }) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
      <div className="p-6 border-b border-[#262626] bg-[#1a1a1a]">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-mono text-xs">
            {index + 1}
          </span>
          <h3 className="font-mono text-sm uppercase tracking-wider text-[#a3a3a3]">Clinical Presentation</h3>
        </div>
        <p className="text-[#f5f5f5] leading-relaxed text-sm md:text-base">
          {data.presentation}
        </p>
      </div>

      <div className="p-6 space-y-3">
        <h4 className="font-mono text-xs uppercase text-[#525252] mb-4 tracking-wider">Select Management Option</h4>
        
        {(data.options || []).map((option) => {
          const isSelected = selectedOptionId === option.id;
          const showFeedback = selectedOptionId !== null;
          const isCorrect = option.isCorrect;

          let buttonClass = "w-full text-left p-4 rounded-lg border transition-all duration-200 text-sm ";
          
          if (!showFeedback) {
            buttonClass += "border-[#262626] bg-[#1a1a1a] hover:border-[#525252] hover:bg-[#1f1f1f] text-[#d4d4d4]";
          } else if (isSelected) {
            buttonClass += isCorrect 
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" 
              : "border-red-500/50 bg-red-500/10 text-red-400";
          } else if (isCorrect) {
            buttonClass += "border-emerald-500/30 bg-emerald-500/5 text-emerald-400/70";
          } else {
            buttonClass += "border-[#262626] bg-[#141414] text-[#525252] opacity-50";
          }

          return (
            <div key={option.id} className="space-y-2">
              <button
                onClick={() => !showFeedback && setSelectedOptionId(option.id)}
                disabled={showFeedback}
                className={buttonClass}
              >
                <div className="flex items-start justify-between gap-4">
                  <span>{option.text}</span>
                  {showFeedback && isSelected && (
                    isCorrect ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {showFeedback && (isSelected || isCorrect) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`p-4 rounded-lg text-sm border-l-2 ${
                      isCorrect ? 'border-emerald-500 bg-emerald-500/5 text-emerald-200' : 'border-red-500 bg-red-500/5 text-red-200'
                    }`}
                  >
                    <span className="font-mono text-xs uppercase tracking-wider block mb-1 opacity-70">
                      Consultant Feedback
                    </span>
                    {option.feedback}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
