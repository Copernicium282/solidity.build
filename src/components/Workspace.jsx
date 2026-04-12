import { Play, Code, LayoutPanelTop, ExternalLink, Zap, Activity } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import SmartBlock from './blocks/SmartBlock';

export default function Workspace({ blocks, isCodeOpen, onToggleCode, onUpdateBlock, onRemoveBlock, solVersion, setSolVersion, ethPrice, gasPrice, onOpenInRemix }) {

  // Maps block types to Tailwind tokens.
  // Tokens (e.g., bg-contract) global in index.css.
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
      case 'While': return 'border-while bg-while/10';
      case 'If': return 'border-if bg-if/10';
      case 'ElseIf': return 'border-elseif bg-elseif/10';
      case 'Else': return 'border-else bg-else/10';
      case 'Ternary': return 'border-ternary bg-ternary/10';
      case 'For': return 'border-for bg-for/10';
      case 'Array': return 'border-array bg-array/10';
      case 'Enum': return 'border-enum bg-enum/10';
      case 'Library': return 'border-library bg-library/10';
      case 'User-Defined Value Type': return 'border-udvt bg-udvt/10';
      case 'Struct': return 'border-struct bg-struct/10';
      case 'ErrorDef':
      case 'Require':
      case 'Assert':
      case 'Revert': return 'border-error bg-error/10';
      case 'Emit': return 'border-event bg-event/10';
      case 'Interface': return 'border-interface bg-interface/10';
      case 'Receive':
      case 'Fallback': return 'border-safety bg-safety/10';
      default: return 'border-gray-800 bg-gray-900';
    }
  };

  const { setNodeRef } = useDroppable({ id: 'workspace-drop' });
  const blockIds = blocks.map(b => b.id);

  return (
    <div className="flex-1 flex flex-col bg-[#111111] overflow-hidden">
      {/* Workspace Header */}
      <div className="h-[68px] border-b border-gray-800 flex justify-between items-center bg-[#0d0d0d] px-6">
        <div className="flex items-center gap-6">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Canvas</h2>
          
          <div className="h-4 w-px bg-gray-800" />
          
          {/* Price APIs */}
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 group cursor-help" title="Live ETH Price (CoinGecko)">
                <Activity size={14} className="text-blue-500" />
                <span className="text-[12px] font-bold text-blue-400/80 group-hover:text-blue-400 transition-colors">{ethPrice}</span>
             </div>
             <div className="flex items-center gap-2 group cursor-help" title="Live Network Gas">
                <Zap size={14} className="text-purple-500" />
                <span className="text-[12px] font-bold text-purple-400/80 group-hover:text-purple-400 transition-colors">{gasPrice}</span>
             </div>
          </div>

          <div className="h-4 w-px bg-gray-800" />

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600">Solc:</span>
            <select
              className="bg-transparent border-none outline-none text-[12px] font-bold text-[#569cd6] cursor-pointer appearance-none hover:text-blue-400 transition-colors"
              value={solVersion}
              onChange={(e) => setSolVersion(e.target.value)}
            >
              <option value="^0.8.0">0.8.x</option>
              <option value="^0.7.0">0.7.x</option>
              <option value="^0.6.0">0.6.x</option>
              <option value="^0.5.0">0.5.x</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
             onClick={onOpenInRemix}
             className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-full font-bold text-xs text-gray-300 transition-all active:scale-95 group shadow-inner"
          >
            <ExternalLink size={14} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
            Open in Remix
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