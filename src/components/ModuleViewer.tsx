import { useState } from 'react';
import { LearningModule } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Layers } from 'lucide-react';
import { SystemMap } from './SystemMap';
import { MicroInteractions } from './MicroInteractions';
import { DecisionMode } from './DecisionMode';
import { GlobalTutor } from './GlobalTutor';

interface ModuleViewerProps {
  module: LearningModule;
  onUpdateModule: (updatedModule: LearningModule) => void;
}

export function ModuleViewer({ module, onUpdateModule }: ModuleViewerProps) {
  const [activeTab, setActiveTab] = useState<'system' | 'decision'>('system');
  const [currentPhase, setCurrentPhase] = useState<number>(6);

  const phases = [
    { id: 1, label: 'Phase 1: Overview' },
    { id: 2, label: 'Phase 2: Mechanism' },
    { id: 3, label: 'Phase 3: Clinical' },
    { id: 4, label: 'Phase 4: Edge Cases' },
    { id: 5, label: 'Phase 5: Research' },
    { id: 6, label: 'Phase 6: Future' },
  ];

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0a0a0a] text-[#f5f5f5] relative">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 border-b border-[#262626] pb-6">
            <h1 className="text-3xl md:text-4xl font-sans font-semibold tracking-tight mb-4">
              {module.topic}
            </h1>
            <div className="flex gap-4 font-mono text-xs text-[#a3a3a3] uppercase tracking-wider">
              <span>Score: {module.score}/100</span>
              <span>Reviews: {module.reviewCount}</span>
              <span>ID: {module.id.slice(0, 8)}</span>
            </div>
          </div>

          {/* Top Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('system')}
              className={`px-6 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-colors ${
                activeTab === 'system'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#141414] text-[#a3a3a3] hover:bg-[#1f1f1f] border border-[#262626]'
              }`}
            >
              System Map
            </button>
            <button
              onClick={() => setActiveTab('decision')}
              className={`px-6 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-colors ${
                activeTab === 'decision'
                  ? 'bg-orange-600 text-white'
                  : 'bg-[#141414] text-[#a3a3a3] hover:bg-[#1f1f1f] border border-[#262626]'
              }`}
            >
              Decision Mode
            </button>
          </div>

          {activeTab === 'system' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Phase Toggle */}
              <div className="flex items-center gap-4 bg-[#141414] border border-[#262626] p-2 rounded-xl overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-2 px-4 text-[#525252]">
                  <Layers className="w-4 h-4" />
                  <span className="font-mono text-xs uppercase tracking-wider">Phase</span>
                </div>
                {phases.map((phase) => (
                  <button
                    key={phase.id}
                    onClick={() => setCurrentPhase(phase.id)}
                    className={`px-4 py-2 rounded-lg font-mono text-xs whitespace-nowrap transition-colors ${
                      currentPhase >= phase.id
                        ? 'bg-[#262626] text-[#f5f5f5]'
                        : 'text-[#525252] hover:text-[#a3a3a3]'
                    }`}
                  >
                    {phase.label}
                  </button>
                ))}
              </div>

              {/* Visual System Map */}
              <SystemMap 
                nodes={module.content.nodes || []} 
                edges={module.content.edges || []} 
                currentPhase={currentPhase}
              />

              <div className="flex justify-center pt-2 pb-4">
                <button 
                  onClick={() => {
                    document.getElementById('questions-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-[#262626] text-[#a3a3a3] hover:text-white hover:bg-[#1f1f1f] transition-colors font-mono text-xs uppercase tracking-wider"
                >
                  ↓ Scroll down to view questions
                </button>
              </div>

              {/* Micro-Interactions */}
              <div id="questions-section" className="pt-8 border-t border-[#262626]">
                <MicroInteractions interactions={module.content.microInteractions || []} />
              </div>
            </motion.div>
          )}

          {activeTab === 'decision' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <DecisionMode cases={module.content.decisionCases || []} />
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Global AI Tutor with Mic */}
      <GlobalTutor topic={module.topic} />
    </div>
  );
}
