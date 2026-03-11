import { CompressionData } from '../types';
import { Zap, AlignLeft, GitMerge } from 'lucide-react';

export function CompressionPanel({ data }: { data: CompressionData }) {
  return (
    <div className="w-80 shrink-0 bg-[#141414] border-l border-[#262626] p-6 overflow-y-auto hidden lg:block">
      <h3 className="font-mono text-xs uppercase text-[#a3a3a3] mb-6 tracking-wider">Compression Panel</h3>
      
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-3 text-yellow-400">
            <AlignLeft className="w-4 h-4" />
            <h4 className="font-mono text-xs uppercase tracking-wide">5-Line Summary</h4>
          </div>
          <ul className="space-y-3">
            {(data.fiveLines || []).map((line, i) => (
              <li key={i} className="text-sm text-[#d4d4d4] leading-relaxed flex gap-3">
                <span className="text-[#525252] font-mono mt-0.5">{i + 1}.</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-[#262626] pt-6">
          <div className="flex items-center gap-2 mb-3 text-blue-400">
            <GitMerge className="w-4 h-4" />
            <h4 className="font-mono text-xs uppercase tracking-wide">System Flow</h4>
          </div>
          <p className="text-sm text-[#d4d4d4] leading-relaxed italic border-l-2 border-blue-500/30 pl-3">
            {data.flow}
          </p>
        </div>

        <div className="border-t border-[#262626] pt-6">
          <div className="flex items-center gap-2 mb-3 text-purple-400">
            <Zap className="w-4 h-4" />
            <h4 className="font-mono text-xs uppercase tracking-wide">Unifying Principle</h4>
          </div>
          <p className="text-sm text-[#d4d4d4] leading-relaxed font-serif">
            {data.unifyingPrinciple}
          </p>
        </div>
      </div>
    </div>
  );
}
