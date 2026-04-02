import { Play, Code, ChevronRight, ChevronDown, LayoutPanelTop, Trash2 } from 'lucide-react';

export default function Workspace({ blocks, isCodeOpen, onToggleCode, onUpdateBlock, onRemoveBlock }) {

  const getBlockColor = (type) => {
    switch (type) {
      case 'Contract': return 'border-contract bg-contract/10';
      case 'Constructor': return 'border-constructor bg-constructor/10';
      case 'Function': return 'border-func bg-func/10';
      case 'Modifier': return 'border-modifier bg-modifier/10';
      default: return 'border-gray-800 bg-gray-900';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#111111] overflow-hidden">
      {/* Workspace Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0d0d0d]">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Canvas</h2>
          <div className="h-4 w-px bg-gray-800" />
          <span className="text-sm font-medium text-gray-400">Main.sol</span>
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
          <div className="w-full max-w-2xl flex flex-col -space-y-[1px]">
            {blocks.map((block, index) => {
              const baseColorClass = getBlockColor(block.type);
              const isFirst = index === 0;
              const isLast = index === blocks.length - 1;
              const isOpen = block.data?.isOpen ?? true;

              return (
                <div
                  key={block.id}
                  className={`relative border transition-all group shadow-xl shadow-black/10 overflow-hidden
                             ${baseColorClass} 
                             ${isFirst ? 'rounded-t-2xl' : ''} 
                             ${isLast ? 'rounded-b-2xl' : 'block-connector'}`}
                >
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => onUpdateBlock(block.id, { isOpen: !isOpen })}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        {isOpen ? <ChevronDown size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
                      </button>

                      <span className="uppercase text-[9px] font-black tracking-tighter text-gray-400/50 min-w-[64px]">
                        {block.type}
                      </span>

                      <input
                        className="bg-transparent border-none outline-none font-bold text-white focus:text-blue-200 transition-colors w-full p-0"
                        value={block.data?.name || ''}
                        onChange={(e) => onUpdateBlock(block.id, { name: e.target.value })}
                        spellCheck="false"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-[10px] text-gray-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        #{block.id.toString().slice(-4)}
                      </div>
                      <button
                        onClick={() => onRemoveBlock(block.id)}
                        className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10"
                        title="Remove Block"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-14 py-2 border-t border-white/5 bg-black/10 text-[11px] text-gray-500 italic pb-5">
                      {block.type === 'Function' ? '// Click the explorer to add logic inside...' : '// Block properties...'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}