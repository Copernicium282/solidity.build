import { Play, Code, ChevronRight, ChevronDown, LayoutPanelTop, Trash2 } from 'lucide-react';

export default function Workspace({ blocks, isCodeOpen, onToggleCode, onUpdateBlock, onRemoveBlock, solVersion, setSolVersion }) {

  const getBlockColor = (type) => {
    switch (type) {
      case 'Contract': return 'border-contract bg-contract/10';
      case 'Constructor': return 'border-constructor bg-constructor/10';
      case 'Function': return 'border-func bg-func/10';
      case 'Modifier': return 'border-modifier bg-modifier/10';
      case 'Comment': return 'border-lime-500/30 bg-lime-500/5 text-lime-200/50';
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
                  { /* --- BLOCK HEADER --- */}
                  <div className="px-6 py-4 flex items-center justify-between bg-black/5">
                    <div className="flex items-center gap-4 flex-1">

                      { /* 1. Toggle Button */}
                      <button
                        onClick={() => onUpdateBlock(block.id, { isOpen: !isOpen })}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        {isOpen ? <ChevronDown size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
                      </button>

                      { /* 2. Type Label */}
                      <span className="font-code uppercase text-[13px] font-black tracking-tighter text-gray-400/80 min-w-[90px] leading-relaxed">
                        {block.type}
                      </span>

                      { /* 3. STATE VAR CONTROLS */}
                      {block.type === 'State Var' && (
                        <div className="flex items-center gap-2 flex-1">
                          <select
                            className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#569cd6] rounded-md px-2 py-1 cursor-pointer font-bold appearance-none hover:bg-[#252525] transition-all uppercase w-[75px] h-[28px] text-left shadow-inner"
                            value={block.data?.varType || 'uint256'}
                            onChange={(e) => onUpdateBlock(block.id, { varType: e.target.value })}
                          >
                            <option value="uint8" className="bg-[#1a1a1a] text-white">uint8</option>
                            <option value="uint16" className="bg-[#1a1a1a] text-white">uint16</option>
                            <option value="uint32" className="bg-[#1a1a1a] text-white">uint32</option>
                            <option value="uint64" className="bg-[#1a1a1a] text-white">uint64</option>
                            <option value="uint128" className="bg-[#1a1a1a] text-white">uint128</option>
                            <option value="uint256" className="bg-[#1a1a1a] text-white">uint256</option>
                            <option value="int8" className="bg-[#1a1a1a] text-white">int8</option>
                            <option value="int16" className="bg-[#1a1a1a] text-white">int16</option>
                            <option value="int32" className="bg-[#1a1a1a] text-white">int32</option>
                            <option value="int64" className="bg-[#1a1a1a] text-white">int64</option>
                            <option value="int128" className="bg-[#1a1a1a] text-white">int128</option>
                            <option value="int256" className="bg-[#1a1a1a] text-white">int256</option>
                            <option value="string" className="bg-[#1a1a1a] text-white">string</option>
                            <option value="bool" className="bg-[#1a1a1a] text-white">bool</option>
                            <option value="address" className="bg-[#1a1a1a] text-white">address</option>
                            <option value="bytes1" className="bg-[#1a1a1a] text-white">bytes1</option>
                          </select>

                          <select
                            className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#6ed668] rounded-md px-2 py-1 cursor-pointer font-bold appearance-none hover:bg-[#252525] transition-all uppercase w-[90px] h-[28px] text-left"
                            value={block.data?.visibility || 'public'}
                            onChange={(e) => onUpdateBlock(block.id, { visibility: e.target.value })}
                          >
                            <option value="public" className="bg-[#1a1a1a] text-white">public</option>
                            <option value="private" className="bg-[#1a1a1a] text-white">private</option>
                            <option value="internal" className="bg-[#1a1a1a] text-white">internal</option>
                          </select>

                          <input
                            className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white focus:text-blue-200 transition-colors w-32 p-0"
                            value={block.data?.name || ''}
                            onChange={(e) => onUpdateBlock(block.id, { name: e.target.value })}
                            placeholder="myVar"
                            spellCheck="false"
                          />

                          <span className="text-gray-600 font-bold">=</span>

                          <input
                            className="bg-transparent border-none outline-none font-code text-[14px] text-green-400/80 flex-1 p-0"
                            placeholder="initial value..."
                            value={block.data?.value || ''}
                            onChange={(e) => onUpdateBlock(block.id, { value: e.target.value })}
                          />
                        </div>
                      )}

                      { /* 4. FUNCTION CONTROLS */}
                      {block.type === 'Function' && (
                        <div className="flex items-center gap-2 flex-1">
                          <select
                            className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#6ed668] rounded-md px-2 py-1 cursor-pointer font-bold appearance-none hover:bg-[#252525] transition-all uppercase w-[85px] h-[28px] text-left"
                            value={block.data?.visibility || 'public'}
                            onChange={(e) => onUpdateBlock(block.id, { visibility: e.target.value })}
                          >
                            <option value="public" className="bg-[#1a1a1a] text-white">public</option>
                            <option value="private" className="bg-[#1a1a1a] text-white">private</option>
                            <option value="internal" className="bg-[#1a1a1a] text-white">internal</option>
                            <option value="external" className="bg-[#1a1a1a] text-white">external</option>
                          </select>

                          <select
                            className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#eab308] rounded-md px-2 py-1 cursor-pointer font-bold appearance-none hover:bg-[#252525] transition-all uppercase w-[90px] h-[28px] text-left"
                            value={block.data?.mutability || ''}
                            onChange={(e) => onUpdateBlock(block.id, { mutability: e.target.value })}
                          >
                            <option value="" className="bg-[#1a1a1a] text-white">mutability</option>
                            <option value="view" className="bg-[#1a1a1a] text-white">view</option>
                            <option value="pure" className="bg-[#1a1a1a] text-white">pure</option>
                            <option value="payable" className="bg-[#1a1a1a] text-white">payable</option>
                          </select>

                          <input
                            className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white focus:text-blue-200 transition-colors w-full p-0"
                            value={block.data?.name || ''}
                            onChange={(e) => onUpdateBlock(block.id, { name: e.target.value })}
                            placeholder="myFunction"
                            spellCheck="false"
                          />
                        </div>
                      )}

                      { /* 5. CONTRACT / CONSTRUCTOR / COMMENT (Simple Name) */}
                      {(block.type === 'Contract' || block.type === 'Constructor' || block.type === 'Comment') && (
                        <input
                          className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white focus:text-blue-200 transition-colors w-full p-0"
                          value={block.data?.name || ''}
                          onChange={(e) => onUpdateBlock(block.id, { name: e.target.value })}
                          placeholder={block.type === 'Comment' ? "Comment summary..." : "Name..."}
                          spellCheck="false"
                        />
                      )}
                    </div>

                    { /* 6. Right Actions */}
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

                  { /* --- EXPANDED AREA --- */}
                  {isOpen && (
                    <div className="border-t border-white/5">

                      { /* Placeholder / Instruction */}
                      <div className="px-14 py-2 bg-black/10 text-[11px] text-gray-500 italic">
                        {block.type === 'Function' ? '// Function Details' :
                          block.type === 'Comment' ? '// Write your multiline comment below' :
                            '// Block settings...'}
                      </div>

                      { /* FUNCTION SPECIFIC: Returns & Body */}
                      {block.type === 'Function' && (
                        <div className="px-14 py-4 bg-black/20 flex flex-col gap-6 pb-8">
                          {/* Returns */}
                          <div className="flex items-center gap-4">
                            <span className="font-code uppercase text-[12px] font-black tracking-tighter text-gray-500/60 min-w-[70px]">
                              Returns
                            </span>
                            <input
                              className="bg-transparent border-b border-gray-800 text-[13px] text-[#ce9178] w-full font-code outline-none focus:border-func/30 transition-all"
                              value={block.data?.returns || ''}
                              onChange={(e) => onUpdateBlock(block.id, { returns: e.target.value })}
                              placeholder="uint256..."
                              spellCheck="false"
                            />
                          </div>
                          {/* Body */}
                          <div className="flex flex-col gap-2">
                            <span className="font-code uppercase text-[12px] font-black tracking-tighter text-gray-500/60 min-w-[70px]">
                              Logic
                            </span>
                            <textarea
                              rows="3"
                              className="font-code bg-transparent border-none outline-none text-[13px] text-[#9cdcfe] w-full resize-none leading-relaxed placeholder:opacity-20"
                              placeholder="// count += 1;"
                              value={block.data?.body || ''}
                              onChange={(e) => onUpdateBlock(block.id, { body: e.target.value })}
                              spellCheck="false"
                            />
                          </div>
                        </div>
                      )}

                      { /* COMMENT SPECIFIC: Full text */}
                      {block.type === 'Comment' && (
                        <div className="px-14 py-4 bg-black/20 pb-8">
                          <textarea
                            rows="4"
                            className="font-code bg-transparent border-none outline-none text-[13px] text-lime-400/40 w-full resize-none leading-relaxed"
                            placeholder="Type your notes here..."
                            value={block.data?.text || ''}
                            onChange={(e) => onUpdateBlock(block.id, { text: e.target.value })}
                            spellCheck="false"
                          />
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div >
  );
}