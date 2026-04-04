import { Play, Code, LayoutPanelTop } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import SmartBlock from './blocks/SmartBlock';

export default function Workspace({ blocks, isCodeOpen, onToggleCode, onUpdateBlock, onRemoveBlock, solVersion, setSolVersion }) {

  const getBlockColor = (type) => {
    switch (type) {
      case 'Contract': return 'border-contract bg-contract/10';
      case 'Constructor': return 'border-constructor bg-constructor/10';
      case 'Function': return 'border-func bg-func/10';
      case 'Modifier': return 'border-modifier bg-modifier/10';
      case 'Comment': return 'border-comment bg-comment/10';
      case 'State Var': return 'border-stateVar bg-stateVar/10';
      case 'Mapping': return 'border-mapping bg-mapping/10';
      case 'Logic': return 'border-logic bg-logic/10';
      case 'Event': return 'border-event bg-event/10';
      default: return 'border-gray-800 bg-gray-900';
    }
  };

  const { setNodeRef } = useDroppable({ id: 'workspace-drop' });
  const blockIds = blocks.map(b => b.id);

  return (
    <div className="flex-1 flex flex-col bg-[#111111] overflow-hidden">
      {/* Workspace Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0d0d0d]">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Canvas</h2>
          <div className="h-4 w-px bg-gray-800" />
          <span className="text-sm font-medium text-gray-400">Main.sol</span>

          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm font-medium text-gray-500">Compiler Version:</span>
            <input
              className="bg-transparent border-none outline-none text-sm font-medium text-[#569cd6] w-16 p-0"
              value={solVersion}
              onChange={(e) => setSolVersion(e.target.value)}
              spellCheck="false"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-contract hover:bg-opacity-80 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95 group">
            <Play size={16} fill="white" className="group-hover:translate-x-0.5 transition-transform" />
            Deploy
          </button>

          <button
            onClick={onToggleCode}
            className={`p-2 rounded-lg border transition-all ${isCodeOpen ? 'bg-white/10 border-gray-700 text-white' : 'hover:bg-white/5 border-gray-800 text-gray-400'}`}
            title="Toggle Code"
          >
            <Code size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-auto p-12 bg-grid flex flex-col items-center">
        {blocks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-800 border-2 border-dashed border-gray-700 rounded-2xl mx-auto mb-4 flex items-center justify-center text-gray-500">
              <LayoutPanelTop size={24} />
            </div>
            <p className="text-gray-500 text-sm font-medium max-w-xs leading-relaxed">
              Drag blocks from the explorer to begin. <br /> <span className="opacity-50">Start with a "Contract".</span>
            </p>
          </div>
        ) : (
          <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
            <div
              ref={setNodeRef}
              className="w-full max-w-2xl flex flex-col gap-2"
            >
              {blocks.map((block, index) => (
                <SmartBlock
                  key={block.id}
                  block={block}
                  index={index}
                  onUpdateBlock={onUpdateBlock}
                  onRemoveBlock={onRemoveBlock}
                  getColor={getBlockColor}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}