import { useState, useEffect } from 'react';
import { MicroInteraction } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, HelpCircle, Eye, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function MicroInteractions({ interactions }: { interactions: MicroInteraction[] }) {
  return (
    <div className="space-y-6">
      <h3 className="font-mono text-sm uppercase text-[#a3a3a3] mb-4">Micro-Interactions</h3>
      {interactions.map((interaction) => (
        <InteractionCard key={interaction.id} interaction={interaction} />
      ))}
    </div>
  );
}

function InteractionCard({ interaction }: { interaction: MicroInteraction }) {
  if (interaction.type === 'quiz') {
    return <QuizInteraction interaction={interaction} />;
  }
  if (interaction.type === 'reveal') {
    return <RevealInteraction interaction={interaction} />;
  }
  if (interaction.type === 'sequence') {
    return <SequenceInteraction interaction={interaction} />;
  }
  return null;
}

function QuizInteraction({ interaction }: { interaction: MicroInteraction }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[#f5f5f5] font-medium leading-relaxed">{interaction.question}</p>
      </div>
      
      <AnimatePresence>
        {showAnswer ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-[#1f1f1f] rounded-lg p-4 border border-[#262626] text-[#d4d4d4] text-sm"
          >
            {interaction.answer}
          </motion.div>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            className="text-xs font-mono uppercase tracking-wider text-[#a3a3a3] hover:text-white transition-colors"
          >
            Reveal Answer
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}

function RevealInteraction({ interaction }: { interaction: MicroInteraction }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <Eye className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <p className="text-[#f5f5f5] font-medium leading-relaxed">{interaction.question}</p>
      </div>
      
      <AnimatePresence>
        {revealed ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-[#1f1f1f] rounded-lg p-4 border border-purple-500/30 text-[#d4d4d4] text-sm"
          >
            {interaction.consequence}
          </motion.div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-3 border border-dashed border-[#525252] rounded-lg text-[#a3a3a3] hover:border-purple-500/50 hover:text-purple-400 transition-colors text-sm font-mono"
          >
            Click to Reveal Consequence
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}

function SortableItem({ id, text }: { id: string; text: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 bg-[#1f1f1f] border border-[#262626] rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-[#525252] transition-colors"
    >
      <GripVertical className="w-4 h-4 text-[#525252]" />
      <span className="text-sm text-[#d4d4d4]">{text}</span>
    </div>
  );
}

function SequenceInteraction({ interaction }: { interaction: MicroInteraction }) {
  const [items, setItems] = useState(() => {
    // Shuffle initial items
    const original = interaction.steps || [];
    return [...original].sort(() => Math.random() - 0.5).map((text, i) => ({ id: `step-${i}`, text, originalIndex: original.indexOf(text) }));
  });
  const [isCorrect, setIsCorrect] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // We can check correctness here but we shouldn't call setIsCorrect inside setState.
        // Instead, we can just return newItems and use a useEffect to check correctness.
        return newItems;
      });
    }
  };

  useEffect(() => {
    const correct = items.every((item, idx) => item.originalIndex === idx);
    setIsCorrect(correct);
  }, [items]);

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isCorrect ? 'text-emerald-400' : 'text-orange-400'}`} />
        <p className="text-[#f5f5f5] font-medium leading-relaxed">{interaction.question}</p>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((item) => (
              <SortableItem key={item.id} id={item.id} text={item.text} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {isCorrect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm font-mono text-emerald-400 text-center uppercase tracking-wider"
        >
          Sequence Correct
        </motion.div>
      )}
    </div>
  );
}
