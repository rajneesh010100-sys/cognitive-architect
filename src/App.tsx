import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ModuleViewer } from './components/ModuleViewer';
import { LearningModule } from './types';
import { generateModule, generateModuleImage } from './services/gemini';
import { Loader2, BrainCircuit } from 'lucide-react';

export default function App() {
  const [modules, setModules] = useState<LearningModule[]>(() => {
    const saved = localStorage.getItem('cognitive_architect_modules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filter out old modules that don't match the new schema
        return parsed.filter((m: any) => m.content && Array.isArray(m.content.nodes));
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topicInput, setTopicInput] = useState('');

  useEffect(() => {
    localStorage.setItem('cognitive_architect_modules', JSON.stringify(modules));
  }, [modules]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const [content, imageUrl] = await Promise.all([
        generateModule(topicInput),
        generateModuleImage(topicInput)
      ]);
      
      const newModule: LearningModule = {
        id: crypto.randomUUID(),
        topic: topicInput,
        createdAt: Date.now(),
        lastReviewedAt: Date.now(),
        reviewCount: 0,
        score: 0,
        imageUrl,
        content
      };

      setModules(prev => [newModule, ...prev]);
      setCurrentModuleId(newModule.id);
      setTopicInput('');
    } catch (error) {
      console.error("Failed to generate module:", error);
      alert("Failed to generate module. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateModule = (updatedModule: LearningModule) => {
    // Calculate total score based on decision cases
    let totalScore = 0;
    let scoredItems = 0;

    (updatedModule.content.decisionCases || []).forEach(c => {
      // Assuming score logic might be added later, for now just keep it simple
      // or we can remove the score calculation if it's not needed yet.
      // Let's just keep the structure for future updates.
    });

    // const finalScore = scoredItems > 0 ? Math.round((totalScore / (scoredItems * 10)) * 100) : 0;
    // updatedModule.score = finalScore;

    setModules(prev => prev.map(m => m.id === updatedModule.id ? updatedModule : m));
  };

  const currentModule = modules.find(m => m.id === currentModuleId);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-[#f5f5f5] overflow-hidden font-sans">
      <Sidebar 
        modules={modules} 
        currentModuleId={currentModuleId} 
        onSelectModule={setCurrentModuleId}
        onNewModule={() => setCurrentModuleId(null)}
      />
      
      <main className="flex-1 flex flex-col relative">
        {currentModule ? (
          <ModuleViewer 
            module={currentModule} 
            onUpdateModule={handleUpdateModule} 
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-xl w-full">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-6">
                  <BrainCircuit className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-3xl font-semibold tracking-tight mb-4">Cognitive Architect</h1>
                <p className="text-[#a3a3a3] font-serif italic">
                  Enter a medical topic to generate a deep, systems-level learning module designed for consultant-level reasoning.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="relative">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g., Acute kidney graft rejection, Sepsis-induced coagulopathy..."
                  className="w-full bg-[#141414] border border-[#262626] rounded-lg py-4 pl-6 pr-32 text-[#f5f5f5] placeholder-[#a3a3a3] focus:outline-none focus:border-blue-500/50 font-mono text-sm shadow-2xl"
                  disabled={isGenerating}
                />
                <button
                  type="submit"
                  disabled={isGenerating || !topicInput.trim()}
                  className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-md font-mono text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      BUILDING
                    </>
                  ) : (
                    'GENERATE'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
