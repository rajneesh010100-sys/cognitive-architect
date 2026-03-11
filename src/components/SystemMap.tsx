import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { SystemNode, SystemEdge } from '../types';
import { X, Search, Loader2, Mic } from 'lucide-react';
import { generateDeepDive } from '../services/gemini';
import { CustomNode } from './CustomNode';

const nodeWidth = 240;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'LR' ? Position.Left : Position.Top;
    node.sourcePosition = direction === 'LR' ? Position.Right : Position.Bottom;

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

interface SystemMapProps {
  nodes: SystemNode[];
  edges: SystemEdge[];
  currentPhase: number;
}

export function SystemMap({ nodes: rawNodes, edges: rawEdges, currentPhase }: SystemMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(null);
  
  // Deep dive state
  const [deepDiveQuery, setDeepDiveQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [deepDiveResult, setDeepDiveResult] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  useEffect(() => {
    const filteredNodes = rawNodes.filter((n) => n.level <= currentPhase);
    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = rawEdges.filter(
      (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );

    const initialNodes: Node[] = filteredNodes.map((n) => ({
      id: n.id,
      type: 'custom',
      data: { label: n.label, level: n.level },
      position: { x: 0, y: 0 },
    }));

    const initialEdges: Edge[] = filteredEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: true,
      style: { stroke: '#60a5fa', strokeWidth: 2, opacity: 0.7 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#60a5fa',
      },
      labelStyle: { fill: '#e5e5e5', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 'bold' },
      labelBgStyle: { fill: '#141414', fillOpacity: 0.9, rx: 4, ry: 4 },
      labelBgPadding: [4, 4],
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [rawNodes, rawEdges, currentPhase, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const fullNode = rawNodes.find((n) => n.id === node.id);
      if (fullNode) {
        setSelectedNode(fullNode);
        setDeepDiveResult(null);
        setDeepDiveQuery('');
      }
    },
    [rawNodes]
  );

  const handleDeepDive = async (query: string) => {
    if (!selectedNode || !query.trim()) return;
    setIsQuerying(true);
    try {
      const result = await generateDeepDive(selectedNode.label, query);
      setDeepDiveResult(result);
    } catch (error) {
      console.error("Failed to generate deep dive:", error);
      setDeepDiveResult("Failed to retrieve information. Please try again.");
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
      setDeepDiveQuery(prev => prev ? prev + ' ' + transcript : transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  return (
    <div className="flex-1 relative h-[500px] bg-[#0a0a0a] rounded-xl border border-[#262626] overflow-hidden shadow-2xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        panOnScroll={false}
        zoomOnScroll={false}
        attributionPosition="bottom-right"
      >
        <Background color="#262626" gap={20} size={2} />
        <Controls className="bg-[#141414] border-[#262626] fill-[#f5f5f5]" />
      </ReactFlow>

      {selectedNode && (
        <div className="absolute top-4 right-4 w-96 max-h-[460px] overflow-y-auto bg-[#141414]/95 backdrop-blur-xl border border-[#262626] rounded-xl shadow-2xl p-5 z-10 scrollbar-hide">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-sans text-lg font-bold text-[#f5f5f5] leading-tight pr-4">{selectedNode.label}</h3>
            <button onClick={() => setSelectedNode(null)} className="text-[#a3a3a3] hover:text-white bg-[#262626] p-1 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4 text-sm mb-6">
            <div>
              <p className="text-[#d4d4d4] leading-relaxed">{selectedNode.explanation}</p>
            </div>
            
            <div className="border-t border-[#262626] pt-3">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-wider block mb-1 flex items-center gap-2">
                <span>⚙️</span> Mechanism
              </span>
              <p className="text-[#a3a3a3]">{selectedNode.mechanism}</p>
            </div>
            
            <div className="border-t border-[#262626] pt-3">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-2">
                <span>🏥</span> Clinical
              </span>
              <p className="text-[#a3a3a3]">{selectedNode.clinicalCorrelation}</p>
            </div>
          </div>

          {/* Deep Dive Section */}
          <div className="border-t border-[#262626] pt-4">
            <h4 className="font-mono text-xs uppercase text-[#a3a3a3] mb-3 tracking-wider flex items-center gap-2">
              <Search className="w-3 h-3" />
              Explore Deeper
            </h4>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <button 
                onClick={() => handleDeepDive("Latest research and clinical trials")}
                className="text-[10px] font-mono bg-[#1f1f1f] hover:bg-[#262626] text-[#d4d4d4] px-2 py-1 rounded border border-[#262626] transition-colors"
              >
                Latest Research
              </button>
              <button 
                onClick={() => handleDeepDive("New and emerging drugs targeting this")}
                className="text-[10px] font-mono bg-[#1f1f1f] hover:bg-[#262626] text-[#d4d4d4] px-2 py-1 rounded border border-[#262626] transition-colors"
              >
                New Drugs
              </button>
              <button 
                onClick={() => handleDeepDive("Detailed molecular mechanism")}
                className="text-[10px] font-mono bg-[#1f1f1f] hover:bg-[#262626] text-[#d4d4d4] px-2 py-1 rounded border border-[#262626] transition-colors"
              >
                Molecular Detail
              </button>
            </div>

            <form 
              onSubmit={(e) => { e.preventDefault(); handleDeepDive(deepDiveQuery); }}
              className="relative flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={deepDiveQuery}
                  onChange={(e) => setDeepDiveQuery(e.target.value)}
                  placeholder="Ask a specific question..."
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md py-2 pl-3 pr-10 text-xs text-[#f5f5f5] placeholder-[#525252] focus:outline-none focus:border-blue-500/50"
                />
                <button 
                  type="button"
                  onClick={toggleListen}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 ${isListening ? 'text-red-500 animate-pulse' : 'text-[#525252] hover:text-[#a3a3a3]'}`}
                  title="Use Microphone"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <button 
                type="submit" 
                disabled={isQuerying || !deepDiveQuery.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-md disabled:opacity-50 transition-colors"
              >
                {isQuerying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </form>

            {deepDiveResult && (
              <div className="mt-4 p-4 bg-[#0a0a0a] border border-blue-500/30 rounded-lg shadow-inner">
                <p className="text-sm text-[#e5e5e5] leading-relaxed whitespace-pre-wrap font-sans">
                  {deepDiveResult}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
