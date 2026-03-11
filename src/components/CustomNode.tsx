import { Handle, Position } from 'reactflow';

const levelConfig = {
  1: { color: 'from-blue-900/40 to-blue-900/10', border: 'border-blue-500/50', emoji: '🧠', shadow: 'shadow-blue-900/20' },
  2: { color: 'from-emerald-900/40 to-emerald-900/10', border: 'border-emerald-500/50', emoji: '🔬', shadow: 'shadow-emerald-900/20' },
  3: { color: 'from-orange-900/40 to-orange-900/10', border: 'border-orange-500/50', emoji: '💊', shadow: 'shadow-orange-900/20' },
  4: { color: 'from-purple-900/40 to-purple-900/10', border: 'border-purple-500/50', emoji: '🧬', shadow: 'shadow-purple-900/20' },
  5: { color: 'from-pink-900/40 to-pink-900/10', border: 'border-pink-500/50', emoji: '📈', shadow: 'shadow-pink-900/20' },
  6: { color: 'from-cyan-900/40 to-cyan-900/10', border: 'border-cyan-500/50', emoji: '🚀', shadow: 'shadow-cyan-900/20' },
};

export function CustomNode({ data }: any) {
  const config = levelConfig[data.level as keyof typeof levelConfig] || levelConfig[1];
  
  return (
    <div className={`px-4 py-3 shadow-xl rounded-xl border ${config.border} bg-gradient-to-br ${config.color} backdrop-blur-md min-w-[220px] max-w-[260px] flex items-center gap-4 transition-transform hover:scale-105 ${config.shadow}`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-[#a3a3a3] !border-none" />
      <div className="text-3xl drop-shadow-md">{config.emoji}</div>
      <div className="font-sans text-sm font-semibold text-[#f5f5f5] leading-snug">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-[#a3a3a3] !border-none" />
    </div>
  );
}
