import { useState } from 'react';
import { Mic, X, Send, Loader2, Sparkles } from 'lucide-react';
import { answerGlobalQuery } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';

interface GlobalTutorProps {
  topic: string;
}

export function GlobalTutor({ topic }: GlobalTutorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsQuerying(true);
    try {
      const res = await answerGlobalQuery(topic, query);
      setResult(res);
    } catch (error) {
      console.error("Failed to answer query:", error);
      setResult("Failed to retrieve information. Please try again.");
    } finally {
      setIsQuerying(false);
    }
  };

  const toggleListen = () => {
    if (isListening) return;
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(prev => prev ? prev + ' ' + transcript : transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-105 z-40 flex items-center justify-center"
        title="Ask AI Tutor"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-8 w-96 bg-[#141414]/95 backdrop-blur-xl border border-[#262626] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[600px]"
          >
            <div className="flex justify-between items-center p-4 border-b border-[#262626] bg-[#0a0a0a]">
              <h3 className="font-mono text-sm font-bold text-[#f5f5f5] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Ask AI Tutor
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-[#a3a3a3] hover:text-white bg-[#262626] p-1 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              {result ? (
                <div className="text-sm text-[#e5e5e5] leading-relaxed whitespace-pre-wrap font-sans">
                  {result}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#525252] space-y-4 py-8">
                  <div className="w-16 h-16 rounded-full bg-[#262626] flex items-center justify-center">
                    <Mic className="w-8 h-8 text-[#a3a3a3]" />
                  </div>
                  <p className="text-xs font-mono uppercase tracking-wider">
                    Ask anything about<br/>
                    <span className="text-blue-400">{topic}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#262626] bg-[#0a0a0a]">
              <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type or use microphone..."
                    className="w-full bg-[#141414] border border-[#262626] rounded-xl py-3 pl-4 pr-12 text-sm text-[#f5f5f5] placeholder-[#525252] focus:outline-none focus:border-blue-500/50 shadow-inner"
                  />
                  <button 
                    type="button"
                    onClick={toggleListen}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isListening ? 'text-red-500 animate-pulse' : 'text-[#525252] hover:text-[#a3a3a3]'}`}
                    title="Use Microphone"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  type="submit" 
                  disabled={isQuerying || !query.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl disabled:opacity-50 transition-colors shadow-lg"
                >
                  {isQuerying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
