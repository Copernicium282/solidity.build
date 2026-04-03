import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BlockHeader from './BlockHeader';
import BlockBody from './BlockBody';

export default function SmartBlock({ block, index, onUpdateBlock, onRemoveBlock, getColor }) {
  const isOpen = block.data?.isOpen ?? true;
  const baseColorClass = getColor(block.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group mb-4 rounded-xl border border-white/5 bg-[#1a1a1a]/40 backdrop-blur-sm
        ${isDragging ? 'opacity-50 scale-[1.02] shadow-2xl z-50' : ''}`}
    >
      <div
        className={`relative border transition-all shadow-xl shadow-black/10 ${baseColorClass} rounded-2xl`}
      >
        <BlockHeader
          block={block}
          onUpdate={onUpdateBlock}
          onRemove={onRemoveBlock}
          dragHandleProps={listeners}
        />

        {isOpen && (
          <BlockBody
            block={block}
            onUpdate={onUpdateBlock}
            onRemove={onRemoveBlock}
            getColor={getColor}
          />
        )}
      </div>
    </div>
  );
}
