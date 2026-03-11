import { Brain, Plus, History, ChevronRight } from 'lucide-react';
import { LearningModule } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  modules: LearningModule[];
  currentModuleId: string | null;
  onSelectModule: (id: string) => void;
  onNewModule: () => void;
}

export function Sidebar({ modules, currentModuleId, onSelectModule, onNewModule }: SidebarProps) {
  return (
    <div className="w-64 h-screen border-r border-[#262626] bg-[#0a0a0a] flex flex-col">
      <div className="p-4 border-b border-[#262626] flex items-center gap-2">
        <Brain className="w-6 h-6 text-blue-500" />
        <span className="font-mono font-medium text-sm tracking-tight text-[#f5f5f5]">COGNITIVE_ARCHITECT</span>
      </div>
      
      <div className="p-4">
        <button
          onClick={onNewModule}
          className="w-full flex items-center justify-center gap-2 bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] text-[#f5f5f5] py-2 px-4 rounded-md transition-colors font-mono text-xs"
        >
          <Plus className="w-4 h-4" />
          NEW MODULE
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 flex items-center gap-2 text-[#a3a3a3]">
          <History className="w-4 h-4" />
          <span className="font-mono text-xs uppercase tracking-wider">Spaced Repetition</span>
        </div>
        
        <div className="mt-2 flex flex-col gap-1 px-2">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between group ${
                currentModuleId === mod.id 
                  ? 'bg-[#1f1f1f] text-[#f5f5f5] border border-[#262626]' 
                  : 'text-[#a3a3a3] hover:bg-[#141414] hover:text-[#f5f5f5] border border-transparent'
              }`}
            >
              <div className="flex flex-col overflow-hidden">
                <span className="font-sans text-sm truncate">{mod.topic}</span>
                <span className="font-mono text-[10px] opacity-50">
                  {formatDistanceToNow(mod.createdAt, { addSuffix: true })}
                </span>
              </div>
              <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${currentModuleId === mod.id ? 'opacity-100' : ''}`} />
            </button>
          ))}
          {modules.length === 0 && (
            <div className="px-3 py-4 text-center text-[#a3a3a3] font-mono text-xs">
              No modules yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
