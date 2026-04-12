import SmartBlock from './SmartBlock';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

export default function BlockBody({ block, onUpdate, onRemove, getColor }) {
  // ═══════ DROP ZONE CONFIG ═══════
  // Droppable nested children check.
  // True: enable dnd-kit node ref. False: drop = reorder sibling.
  const isContainer = ['Contract', 'Function', 'Constructor', 'Modifier', 'While', 'For', 'If', 'ElseIf', 'Else', 'Library', 'Interface', 'Receive', 'Fallback'].includes(block.type);

  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${block.id}`,
    disabled: !isContainer,
  });

  const childIds = (block.children || []).map(c => c.id);

  return (
    <div className="border-t border-white/5">
      { /* FUNCTION SPECIFIC: Returns & Body */}
      {/* onMouseDown stopPropagation: block drag sensor from stealing input click. */}
      {block.type === 'Function' && (
        <div className="px-14 py-4 bg-black/20 flex flex-col gap-6 pb-8" onMouseDown={(e) => e.stopPropagation()}>
          {/* Returns */}
          <div className="flex items-center gap-4">
            <span className="font-code uppercase text-[12px] font-black tracking-tighter text-gray-500/60 min-w-[70px]">
              Returns
            </span>
            <input
              className="bg-transparent border-b border-gray-800 text-[13px] text-[#ce9178] w-full font-code outline-none focus:border-func/30 transition-all"
              value={block.data?.returns || ''}
              onChange={(e) => onUpdate(block.id, { returns: e.target.value })}
              placeholder="uint256..."
              spellCheck="false"
            />
          </div>
        </div>
      )}

      {block.type === 'Logic' && (
        <div className="px-14 py-4" onMouseDown={(e) => e.stopPropagation()}>
          <textarea
            rows="2"
            className="font-code bg-transparent border-none outline-none text-[13px] text-blue-300 w-full resize-none"
            placeholder="Type logic here (e.g., count += 1;)"
            value={block.data?.code || ''}
            onChange={(e) => onUpdate(block.id, { code: e.target.value })}
            spellCheck="false"
          />
        </div>
      )}

      {/* Recursable blocks */}
      {isContainer && (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            className={`min-h-[60px] border-2 border-dashed rounded-xl p-4 transition-all duration-200 relative
              ${isOver ? 'border-func bg-func/10 ring-4 ring-func/20' : 'border-white/5 bg-black/5'}
              ${block.type === 'Function' ? 'bg-blue-500/5' : ''}`}
          >
            {block.children?.map((child, idx) => (
              <SmartBlock
                key={child.id}
                block={child}
                index={idx}
                onUpdateBlock={onUpdate}
                onRemoveBlock={onRemove}
                getColor={getColor}
              />
            ))}
          </div>
        </SortableContext>
      )}

      { /* COMMENT SPECIFIC: Full text */}
      {block.type === 'Comment' && (
        <div className="px-14 py-4 bg-black/20 pb-8" onMouseDown={(e) => e.stopPropagation()}>
          <textarea
            rows="4"
            className="font-code bg-transparent border-none outline-none text-[13px] text-lime-400/40 w-full resize-none leading-relaxed"
            placeholder="Type your notes here..."
            value={block.data?.text || ''}
            onChange={(e) => onUpdate(block.id, { text: e.target.value })}
            spellCheck="false"
          />
        </div>
      )}

    </div>
  );
}
