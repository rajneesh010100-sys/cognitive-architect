export interface SystemNode {
  id: string;
  label: string;
  level: number; // 1 to 4
  explanation: string;
  mechanism: string;
  clinicalCorrelation: string;
  insight: string;
}

export interface SystemEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface MicroInteraction {
  id: string;
  type: 'sequence' | 'reveal' | 'quiz';
  question: string;
  steps?: string[]; // For sequence (correct order)
  consequence?: string; // For reveal
  answer?: string; // For quiz
}

export interface CompressionData {
  fiveLines: string[];
  flow: string;
  unifyingPrinciple: string;
}

export interface DecisionCase {
  id: string;
  presentation: string;
  options: { id: string; text: string; isCorrect: boolean; feedback: string }[];
}

export interface LearningModule {
  id: string;
  topic: string;
  createdAt: number;
  lastReviewedAt: number;
  reviewCount: number;
  score: number;
  imageUrl?: string;
  content: {
    nodes: SystemNode[];
    edges: SystemEdge[];
    microInteractions: MicroInteraction[];
    compression: CompressionData;
    decisionCases: DecisionCase[];
  };
}


