import { ChevronRight, ChevronDown, Trash2 } from 'lucide-react';

export default function BlockHeader({ block, onUpdate, onRemove, dragHandleProps }) {
  const isOpen = block.data?.isOpen ?? true;

  return (
    <div {...dragHandleProps} className="px-6 py-4 flex items-center justify-between bg-black/5 min-w-0">
      <div className="flex items-center gap-4 flex-1 min-w-0 flex-wrap">

        { /* Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate(block.id, { isOpen: !isOpen });
          }}
          className="text-gray-500 hover:text-white transition-colors"
        >
          {isOpen ? <ChevronDown size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
        </button>

        { /* Type Label */}
        <span className="font-code uppercase text-[13px] font-black tracking-tighter text-gray-400/80 min-w-[90px] leading-relaxed">
          {block.type}
        </span>

        { /* State Var */}
        {block.type === 'State Var' && (
          <div className="flex items-center gap-2 flex-1 flex-wrap" onMouseDown={(e) => e.stopPropagation()}>
            <select
              className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#569cd6] rounded-md px-2 py-1 cursor-pointer font-bold appearance-none hover:bg-[#252525] transition-all uppercase w-[75px] h-[28px] text-left shadow-inner"
              value={block.data?.varType || 'uint256'}
              onChange={(e) => onUpdate(block.id, { varType: e.target.value })}
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
              className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#6ed668] rounded-md px-2 py-1 cursor-pointer font-bold appearance-none hover:bg-[#252525] transition-all uppercase w-[85px] h-[28px] text-left"
              value={block.data?.visibility || 'public'}
              onChange={(e) => onUpdate(block.id, { visibility: e.target.value })}
            >
              <option value="public" className="bg-[#1a1a1a] text-white">public</option>
              <option value="private" className="bg-[#1a1a1a] text-white">private</option>
              <option value="internal" className="bg-[#1a1a1a] text-white">internal</option>
            </select>

            <select
              className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#ff771d] rounded-md px-2 py-1 cursor-pointer font-bold appearance-none hover:bg-[#252525] transition-all uppercase w-[85px] h-[28px] text-left"
              value={block.data?.isConst ? 'constant' : (block.data?.isImm ? 'immutable' : 'none')}
              onChange={(e) => {
                const val = e.target.value;
                onUpdate(block.id, {
                  isConst: val === 'constant',
                  isImm: val === 'immutable'
                });
              }}
            >
              <option value="none" className="bg-[#1a1a1a] text-white">None</option>
              <option value="constant" className="bg-[#1a1a1a] text-white">Constant</option>
              <option value="immutable" className="bg-[#1a1a1a] text-white">Immutable</option>
            </select>

            <input
              className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white focus:text-blue-200 transition-colors w-24 p-0"
              value={block.data?.isConst
                ? (block.data?.name || '').toUpperCase()
                : (block.data?.isImm
                  ? `i_${block.data?.name || ''}`
                  : (block.data?.name || ''))}
              onChange={(e) => onUpdate(block.id, { name: e.target.value })}
              placeholder="myVar"
              spellCheck="false"
            />

            <span className="text-gray-600 font-bold">=</span>

            <input
              className="bg-transparent border-none outline-none font-code text-[14px] text-green-400/80 w-24 p-0"
              placeholder="initial value..."
              value={block.data?.value || ''}
              onChange={(e) => onUpdate(block.id, { value: e.target.value })}
              spellCheck="false"
            />
          </div>
        )}

        { /* Function */}
        {block.type === 'Function' && (
          <div className="flex items-center gap-2 flex-1 flex-wrap" onMouseDown={(e) => e.stopPropagation()}>
            <select
              className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#6ed668] rounded-md px-2 py-1 cursor-pointer font-bold appearance-none hover:bg-[#252525] transition-all uppercase w-[85px] h-[28px] text-left"
              value={block.data?.visibility || 'public'}
              onChange={(e) => onUpdate(block.id, { visibility: e.target.value })}
            >
              <option value="public" className="bg-[#1a1a1a] text-white">public</option>
              <option value="private" className="bg-[#1a1a1a] text-white">private</option>
              <option value="internal" className="bg-[#1a1a1a] text-white">internal</option>
              <option value="external" className="bg-[#1a1a1a] text-white">external</option>
            </select>

            <select
              className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#eab308] rounded-md px-2 py-1 cursor-pointer font-bold appearance-none hover:bg-[#252525] transition-all uppercase w-[90px] h-[28px] text-left"
              value={block.data?.mutability || ''}
              onChange={(e) => onUpdate(block.id, { mutability: e.target.value })}
            >
              <option value="" className="bg-[#1a1a1a] text-white">mutability</option>
              <option value="view" className="bg-[#1a1a1a] text-white">view</option>
              <option value="pure" className="bg-[#1a1a1a] text-white">pure</option>
              <option value="payable" className="bg-[#1a1a1a] text-white">payable</option>
            </select>

            <input
              className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white focus:text-blue-200 transition-colors w-full p-0"
              value={block.data?.name || ''}
              onChange={(e) => onUpdate(block.id, { name: e.target.value })}
              placeholder="myFunction"
              spellCheck="false"
            />
          </div>
        )}

        { /* Mapping */}
        {block.type === 'Mapping' && (
          <div className="flex items-center gap-2 flex-1 flex-wrap" onMouseDown={(e) => e.stopPropagation()}>
            <select
              className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#6ed668] rounded-md px-2 py-1 cursor-pointer font-bold appearance-none hover:bg-[#252525] transition-all uppercase w-[85px] h-[28px] text-left"
              value={block.data?.varType1 || 'address'}
              onChange={(e) => onUpdate(block.id, { varType1: e.target.value })}
            >
              <option value="uint256" className="bg-[#1a1a1a] text-white">uint256</option>
              <option value="int256" className="bg-[#1a1a1a] text-white">int256</option>
              <option value="string" className="bg-[#1a1a1a] text-white">string</option>
              <option value="bool" className="bg-[#1a1a1a] text-white">bool</option>
              <option value="address" className="bg-[#1a1a1a] text-white">address</option>
              <option value="bytes1" className="bg-[#1a1a1a] text-white">bytes1</option>
            </select>

            <select
              className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#6ed668] rounded-md px-2 py-1 cursor-pointer font-bold appearance-none hover:bg-[#252525] transition-all uppercase w-[85px] h-[28px] text-left"
              value={block.data?.varType2 || 'uint256'}
              onChange={(e) => onUpdate(block.id, { varType2: e.target.value })}
            >
              <option value="uint256" className="bg-[#1a1a1a] text-white">uint256</option>
              <option value="int256" className="bg-[#1a1a1a] text-white">int256</option>
              <option value="string" className="bg-[#1a1a1a] text-white">string</option>
              <option value="bool" className="bg-[#1a1a1a] text-white">bool</option>
              <option value="address" className="bg-[#1a1a1a] text-white">address</option>
              <option value="bytes1" className="bg-[#1a1a1a] text-white">bytes1</option>
            </select>

            <select
              className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#6ed668] rounded-md px-2 py-1 cursor-pointer font-bold appearance-none hover:bg-[#252525] transition-all uppercase w-[85px] h-[28px] text-left"
              value={block.data?.visibility || 'public'}
              onChange={(e) => onUpdate(block.id, { visibility: e.target.value })}
            >
              <option value="public" className="bg-[#1a1a1a] text-white">public</option>
              <option value="private" className="bg-[#1a1a1a] text-white">private</option>
              <option value="internal" className="bg-[#1a1a1a] text-white">internal</option>
            </select>

            <input
              className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white focus:text-blue-200 transition-colors w-full p-0"
              value={block.data?.name || ''}
              onChange={(e) => onUpdate(block.id, { name: e.target.value })}
              placeholder="myMapping"
              spellCheck="false"
            />
          </div>
        )}

        {/* While */}
        {block.type === 'While' && (
          <div className="flex items-center gap-2 flex-1" onMouseDown={(e) => e.stopPropagation()}>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500/60 min-w-[70px]">
              While
            </span>
            <span>(</span>
            <input
              className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white focus:text-blue-200 transition-colors w-full p-0"
              value={block.data?.condition || ''}
              onChange={(e) => onUpdate(block.id, { condition: e.target.value })}
              placeholder="true"
              spellCheck="false"
            />
            <span>)</span>
          </div>
        )}

        {/* For Loop */}
        {block.type === 'For' && (
          <div className="flex items-center gap-1 flex-1 font-code text-[13px]" onMouseDown={(e) => e.stopPropagation()}>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500/60 min-w-[70px]">
              For
            </span>
            <span className="text-gray-600 font-bold">(</span>
            <input
              className="bg-transparent border-none outline-none text-[#569cd6] w-28"
              value={block.data?.init || ''}
              onChange={(e) => onUpdate(block.id, { init: e.target.value })}
              placeholder="uint256 i = 0"
              spellCheck="false"
            />
            <span className="text-gray-600 font-bold">;</span>
            <input
              className="bg-transparent border-none outline-none text-pink-400 w-20"
              value={block.data?.condition || ''}
              onChange={(e) => onUpdate(block.id, { condition: e.target.value })}
              placeholder="i < 10"
              spellCheck="false"
            />
            <span className="text-gray-600 font-bold">;</span>
            <input
              className="bg-transparent border-none outline-none text-green-400 w-16"
              value={block.data?.step || ''}
              onChange={(e) => onUpdate(block.id, { step: e.target.value })}
              placeholder="i++"
              spellCheck="false"
            />
            <span className="text-gray-600 font-bold">)</span>
          </div>
        )}

        {/* If & ElseIf */}
        {(block.type === 'If' || block.type === 'ElseIf') && (
          <div className="flex items-center gap-1 ml-1 text-gray-600 font-mono text-[10px] uppercase font-black">
            <span className="text-gray-400/50">Condition</span>
            <span className="ml-2">(</span>
            <input
              className="bg-transparent border-none outline-none text-[13px] text-pink-400 w-32 focus:text-pink-300 transition-all normal-case"
              value={block.data?.condition || ''}
              onChange={(e) => onUpdate(block.id, { condition: e.target.value })}
              placeholder="x < 10"
              spellCheck="false"
            />
            <span>)</span>
          </div>
        )}

        {/* Ternary */}
        {block.type === 'Ternary' && (
          <div className="flex items-center gap-2 ml-1 text-gray-500 font-code text-[13px]">
            <span>return</span>
            <input className="bg-transparent border-none outline-none text-purple-300 w-24" value={block.data?.condition || ''} onChange={(e) => onUpdate(block.id, { condition: e.target.value })} placeholder="cond" />
            <span className="text-gray-700">?</span>
            <input className="bg-transparent border-none outline-none text-white w-12" value={block.data?.trueVal || ''} onChange={(e) => onUpdate(block.id, { trueVal: e.target.value })} placeholder="true" />
            <span className="text-gray-700">:</span>
            <input className="bg-transparent border-none outline-none text-white w-12" value={block.data?.falseVal || ''} onChange={(e) => onUpdate(block.id, { falseVal: e.target.value })} placeholder="false" />
          </div>
        )}

        { /* Contract, Constructor, Modifier, Comment, Logic */}
        {(block.type === 'Contract' || block.type === 'Constructor' || block.type === 'Modifier' || block.type === 'Comment' || block.type === 'Logic') && (
          <input
            className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white focus:text-blue-200 transition-colors w-full p-0"
            value={block.data?.name || ''}
            onChange={(e) => onUpdate(block.id, { name: e.target.value })}
            placeholder={block.type === 'Comment' ? "Comment summary..." : "Name..."}
            spellCheck="false"
            onMouseDown={(e) => e.stopPropagation()}
          />
        )}

        {/* Params to break your head */}
        {(block.type === 'Modifier' || block.type === 'Function' || block.type === 'Constructor') && (
          <div className="flex items-center gap-1 ml-2">
            <span className="text-gray-600 font-bold">(</span>
            <div className="flex items-center gap-1 flex-wrap">
              {(block.data?.params || []).map((p, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-white/5 border border-white/5 rounded px-1 group">
                  <input
                    className="bg-transparent border-none outline-none text-[13px] text-[#569cd6] w-20 font-medium"
                    value={p.type}
                    onChange={(e) => {
                      const newPs = [...block.data.params]; newPs[idx].type = e.target.value;
                      onUpdate(block.id, { params: newPs });
                    }}
                  />
                  <input
                    className="bg-transparent border-none outline-none text-[13px] text-white/90 w-20 font-bold"
                    value={p.name}
                    onChange={(e) => {
                      const newPs = [...block.data.params]; newPs[idx].name = e.target.value;
                      onUpdate(block.id, { params: newPs });
                    }}
                  />
                  <button className="text-[10px] text-gray-700 hover:text-red-400"
                    onClick={() => onUpdate(block.id, { params: block.data.params.filter((_, i) => i !== idx) })}>
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => onUpdate(block.id, { params: [...(block.data?.params || []), { type: 'uint256', name: `_arg${(block.data?.params || []).length}` }] })}
              className="w-4 h-4 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-[12px] text-gray-500"
            >
              +
            </button>
            <span className="text-gray-600 font-bold">)</span>
          </div>
        )}
      </div>

      { /* hmm what does this do? remove block i think */}
      <div className="flex items-center gap-4 flex-shrink-0 ml-auto pl-4 border-l border-white/5 bg-black/5">
        <div className="text-[10px] text-gray-600 font-mono opacity-40">
          #{block.id.toString().slice(-4)}
        </div>
        <button
          onClick={() => onRemove(block.id)}
          className="text-gray-600 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-500/10"
          title="Remove Block"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div >
  );
}
