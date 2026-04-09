import { ChevronRight, ChevronDown, Trash2, Edit2 } from 'lucide-react';

/**
 * BlockHeader — the inline config panel for every block type.
 *
 * This file is big. Each block type gets its own conditional JSX section
 * that renders the relevant inputs (dropdowns, text fields, toggles, etc.)
 * right inside the header bar. It functions as a giant switch on block.type,
 * but done via JSX conditionals so each section can render its own layout.
 *
 * Why stopPropagation is everywhere:
 *   The entire header div is the drag handle (via dragHandleProps). Without
 *   stopPropagation on inputs, clicking a text field would start a drag
 *   instead of focusing the input. So every interactive area calls
 *   onMouseDown -> e.stopPropagation() to opt out of drag behavior.
 *
 * Why the array-copy-mutate pattern:
 *   When updating params/members arrays, we do:
 *     const newPs = [...block.data.params];
 *     newPs[idx].type = e.target.value;
 *     onUpdate(block.id, { params: newPs });
 *   This creates a new array reference so React sees it as changed,
 *   but the inner objects are still the same refs (shallow copy).
 *   It works because onUpdate spreads into a new data object anyway.
 */
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

        {/* ═══════════════════════════════════════════════════════════
            STATE VARIABLE — type picker, visibility, constant/immutable,
            name (auto-uppercased if constant, prefixed if immutable),
            and initial value. The custom-type toggle swaps the dropdown
            for a free-text input so you can use enums/structs as types.
           ═══════════════════════════════════════════════════════════ */}
        {block.type === 'State Var' && (
          <div className="flex items-center gap-2 flex-1 flex-wrap" onMouseDown={(e) => e.stopPropagation()}>
            {!block.data?.isCustomType ? (
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
                <option value="address payable" className="bg-[#1a1a1a] text-white">address payable</option>
                <option value="bytes1" className="bg-[#1a1a1a] text-white">bytes1</option>
                <option value="bytes4" className="bg-[#1a1a1a] text-white">bytes4</option>
                <option value="bytes32" className="bg-[#1a1a1a] text-white">bytes32</option>
                <option value="bytes" className="bg-[#1a1a1a] text-white">bytes</option>
              </select>
            ) : (
              <input
                className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#569cd6] rounded-md px-2 py-1 cursor-pointer font-bold appearance-none hover:bg-[#252525] transition-all uppercase w-[75px] h-[28px] text-left shadow-inner"
                value={block.data?.customType || ''}
                onChange={(e) => onUpdate(block.id, { customType: e.target.value })}
                placeholder="Type..."
              />
            )}
            <button
              onClick={() => onUpdate(block.id, { isCustomType: !block.data?.isCustomType })}
              className={`p-1 rounded hover:bg-white/5 transition-all ${block.data?.isCustomType ? 'text-blue-400' : 'text-gray-600'}`}
            >
              <Edit2 size={10} />
            </button>

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
              className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white focus:text-blue-200 transition-colors w-48 p-0"
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

        {/* ═══════════════════════════════════════════════════════════
            FUNCTION — visibility, mutability, modifier text, virtual/override
            toggles, and the function name. The virtual/override buttons are
            tiny pill toggles; override optionally shows a parents input
            for multi-inheritance like override(A, B).
           ═══════════════════════════════════════════════════════════ */}
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
              className="font-code bg-transparent border-none outline-none text-[12px] text-orange-400/80 w-32 italic"
              value={block.data?.modifiers || ''}
              onChange={(e) => onUpdate(block.id, { modifiers: e.target.value })}
              placeholder="onlyOwner..."
              spellCheck="false"
            />

            {/* Virtual & Override Toggles */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdate(block.id, { isVirtual: !block.data?.isVirtual })}
                className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded transition-all ${block.data?.isVirtual ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-600 hover:text-gray-400'}`}
                title="Mark as Virtual"
              >
                virt
              </button>

              <div className="flex items-center gap-1 bg-white/5 rounded px-1 group">
                <button
                  onClick={() => onUpdate(block.id, { isOverride: !block.data?.isOverride })}
                  className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded transition-all ${block.data?.isOverride ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-600 hover:text-gray-400'}`}
                  title="Override Parent"
                >
                  over
                </button>
                {block.data?.isOverride && (
                  <input
                    className="font-code text-[10px] text-emerald-400/80 w-16 bg-transparent border-none outline-none italic"
                    value={block.data?.overrideParents || ''}
                    onChange={(e) => onUpdate(block.id, { overrideParents: e.target.value })}
                    placeholder="(A, B)"
                    spellCheck="false"
                  />
                )}
              </div>
            </div>

            <input
              className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white focus:text-blue-200 transition-colors w-full p-0 flex-1 min-w-[200px]"
              value={block.data?.name || ''}
              onChange={(e) => onUpdate(block.id, { name: e.target.value })}
              placeholder="myFunction"
              spellCheck="false"
            />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            MAPPING — supports nested mappings via a dynamic types array.
            Each type gets a dropdown; the "+" button between the second-to-last
            and last type inserts another nesting level.
            e.g. [address, address, uint256] → mapping(address => mapping(address => uint256))
           ═══════════════════════════════════════════════════════════ */}
        {block.type === 'Mapping' && (
          <div className="flex items-center gap-1 ml-1 flex-1 flex-wrap" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1 bg-white/5 p-1 px-2 rounded-lg border border-white/5">
              {(block.data?.types || ["address", "uint256"]).map((t, idx, arr) => (
                <div key={idx} className="flex items-center gap-1">
                  <select
                    className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[11px] text-[#569cd6] rounded px-1.5 py-0.5"
                    value={t}
                    onChange={(e) => {
                      const newTypes = [...(block.data?.types || ["address", "uint256"])];
                      newTypes[idx] = e.target.value;
                      onUpdate(block.id, { types: newTypes });
                    }}
                  >
                    <option value="address">address</option>
                    <option value="address payable">address payable</option>
                    <option value="uint256">uint256</option>
                    <option value="bool">bool</option>
                    <option value="string">string</option>
                    <option value="bytes32">bytes32</option>
                    <option value="bytes">bytes</option>
                  </select>
                  {idx < arr.length - 1 && <span className="text-gray-600 text-[10px]">⇒</span>}
                  {idx === arr.length - 2 && (
                    <button
                      onClick={() => {
                        const newTypes = [...(block.data?.types || ["address", "uint256"])];
                        newTypes.splice(idx + 1, 0, "address"); // Insert new key level
                        onUpdate(block.id, { types: newTypes });
                      }}
                      className="w-4 h-4 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all text-[10px]"
                    >+</button>
                  )}
                </div>
              ))}
            </div>

            <select
              className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[11px] text-[#6ed668] rounded px-2 py-1 cursor-pointer font-bold appearance-none hover:bg-[#252525] transition-all uppercase w-[80px]"
              value={block.data?.visibility || 'public'}
              onChange={(e) => onUpdate(block.id, { visibility: e.target.value })}
            >
              <option value="public" className="bg-[#1a1a1a] text-white">public</option>
              <option value="private" className="bg-[#1a1a1a] text-white">private</option>
              <option value="internal" className="bg-[#1a1a1a] text-white">internal</option>
            </select>

            <input
              className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white focus:text-blue-200 transition-colors w-24 ml-2"
              value={block.data?.name || ''}
              onChange={(e) => onUpdate(block.id, { name: e.target.value })}
              placeholder="myMap"
              spellCheck="false"
            />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            WHILE LOOP — just a condition input wrapped in parentheses.
           ═══════════════════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════════════════
            FOR LOOP — three inputs for init, condition, step,
            separated by semicolons just like how you'd write it.
           ═══════════════════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════════════════
            IF / ELSE IF — condition input. The actual else-chaining
            happens in the code generator, not here.
           ═══════════════════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════════════════
            TERNARY — condition ? trueVal : falseVal, rendered inline.
           ═══════════════════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════════════════
            ARRAY — type (or custom type), fixed size (empty = dynamic),
            visibility, name, and optional initial value.
            Same custom-type toggle pattern as State Var.
           ═══════════════════════════════════════════════════════════ */}
        {block.type === 'Array' && (
          <div className="flex items-center gap-1 ml-1 flex-1 flex-wrap" onMouseDown={(e) => e.stopPropagation()}>
            {!block.data?.isCustomType ? (
              <select
                className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#569cd6] rounded px-2 py-1 uppercase font-bold"
                value={block.data?.itemType || 'uint256'}
                onChange={(e) => onUpdate(block.id, { itemType: e.target.value })}
              >
                <option value="uint256">uint256</option>
                <option value="address">address</option>
                <option value="address payable">address payable</option>
                <option value="bool">bool</option>
              </select>
            ) : (
              <input
                className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#569cd6] rounded px-2 py-1 uppercase font-bold w-[80px]"
                value={block.data?.customType || ''}
                onChange={(e) => onUpdate(block.id, { customType: e.target.value })}
                placeholder="Status"
              />
            )}

            <button
              onClick={() => onUpdate(block.id, { isCustomType: !block.data?.isCustomType })}
              className={`p-1 rounded hover:bg-white/5 transition-all ${block.data?.isCustomType ? 'text-blue-400' : 'text-gray-600'}`}
            >
              <Edit2 size={10} />
            </button>

            <div className="flex items-center text-gray-500 font-bold ml-1">
              <span>[</span>
              <input
                className="bg-transparent border-none outline-none text-[11px] text-teal-400 w-6 text-center placeholder-teal-800"
                value={block.data?.fixedSize || ''}
                onChange={(e) => onUpdate(block.id, { fixedSize: e.target.value })}
                placeholder="..."
              />
              <span>]</span>
            </div>

            <select
              className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#6ed668] rounded px-2 py-1 uppercase font-bold w-[80px]"
              value={block.data?.visibility || 'public'}
              onChange={(e) => onUpdate(block.id, { visibility: e.target.value })}
            >
              <option value="public">public</option>
              <option value="private">private</option>
              <option value="internal">internal</option>
            </select>

            <input
              className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white focus:text-blue-200 transition-colors w-24 ml-2"
              value={block.data?.name || ''}
              onChange={(e) => onUpdate(block.id, { name: e.target.value })}
              placeholder="arr"
              spellCheck="false"
            />

            <span className="text-gray-600 font-bold">=</span>

            <input
              className="font-code bg-transparent border-none outline-none text-[13px] text-green-400/80 w-32 focus:text-green-300 transition-all font-medium"
              value={block.data?.value || ''}
              onChange={(e) => onUpdate(block.id, { value: e.target.value })}
              placeholder="[1, 2, 3];"
              spellCheck="false"
            />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ENUM — name + dynamic list of member values.
            Each member is an editable pill with a × to remove it.
           ═══════════════════════════════════════════════════════════ */}
        {block.type === 'Enum' && (
          <div className="flex items-center gap-2 flex-1 flex-wrap" onMouseDown={(e) => e.stopPropagation()}>
            <input
              className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white w-24"
              value={block.data?.name || ''}
              onChange={(e) => onUpdate(block.id, { name: e.target.value })}
              placeholder="Status"
            />

            <div className="flex items-center gap-1 ml-4 bg-white/5 p-1 rounded-md border border-white/5">
              {(block.data?.members || []).map((m, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded group">
                  <input
                    className="bg-transparent border-none outline-none text-[11px] text-amber-400 w-16"
                    value={m}
                    onChange={(e) => {
                      const newMs = [...block.data.members];
                      newMs[idx] = e.target.value;
                      onUpdate(block.id, { members: newMs });
                    }}
                  />
                  <button onClick={() => onUpdate(block.id, { members: block.data.members.filter((_, i) => i !== idx) })}
                    className="text-[10px] text-gray-700 hover:text-red-400">×</button>
                </div>
              ))}
              <button onClick={() => onUpdate(block.id, { members: [...(block.data?.members || []), `NewItem${block.data.members.length}`] })}
                className="w-4 h-4 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-[12px] text-gray-500">+</button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            USER-DEFINED VALUE TYPE — e.g. "type Duration is uint64;"
            Just a name and the underlying primitive type.
           ═══════════════════════════════════════════════════════════ */}
        {block.type === 'User-Defined Value Type' && (
          <div className="flex items-center gap-1 ml-1 flex-1 flex-wrap" onMouseDown={(e) => e.stopPropagation()}>
            <span className="text-gray-600 font-bold">TYPE</span>
            <input
              className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-pink-400 w-24 ml-2"
              value={block.data?.name || ''}
              onChange={(e) => onUpdate(block.id, { name: e.target.value })}
              placeholder="Duration"
            />
            <span className="text-gray-600 font-bold mx-2">IS</span>
            <select
              className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[11px] text-[#569cd6] rounded px-2 py-1 uppercase font-bold"
              value={block.data?.subType || 'uint64'}
              onChange={(e) => onUpdate(block.id, { subType: e.target.value })}
            >
              <option value="uint64">uint64</option>
              <option value="uint128">uint128</option>
              <option value="uint256">uint256</option>
            </select>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            LIBRARY — just a name input. Children go in the body.
           ═══════════════════════════════════════════════════════════ */}
        {block.type === 'Library' && (
          <input
            className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-cyan-400 w-full"
            value={block.data?.name || ''}
            onChange={(e) => onUpdate(block.id, { name: e.target.value })}
            placeholder="LibName"
            onMouseDown={(e) => e.stopPropagation()}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════
            STRUCT — name + dynamic list of typed members.
            Each member has a type input and a name input.
            Same pill-with-× pattern as Enum but with two fields per pill.
           ═══════════════════════════════════════════════════════════ */}
        {block.type === 'Struct' && (
          <div className="flex items-center gap-2 flex-1 flex-wrap" onMouseDown={(e) => e.stopPropagation()}>
            <input
              className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-violet-400 w-24"
              value={block.data?.name || ''}
              onChange={(e) => onUpdate(block.id, { name: e.target.value })}
              placeholder="Todo"
              spellCheck="false"
            />

            <div className="flex items-center gap-1 ml-4 bg-white/5 p-1 rounded-md border border-white/5">
              {(block.data?.members || []).map((m, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded group">
                  <input
                    className="bg-transparent border-none outline-none text-[11px] text-[#569cd6] w-16"
                    value={m.type}
                    onChange={(e) => {
                      const newMs = [...block.data.members];
                      newMs[idx].type = e.target.value;
                      onUpdate(block.id, { members: newMs });
                    }}
                  />
                  <input
                    className="bg-transparent border-none outline-none text-[11px] text-white/80 w-16"
                    value={m.name}
                    onChange={(e) => {
                      const newMs = [...block.data.members];
                      newMs[idx].name = e.target.value;
                      onUpdate(block.id, { members: newMs });
                    }}
                  />
                  <button onClick={() => onUpdate(block.id, { members: block.data.members.filter((_, i) => i !== idx) })}
                    className="text-[10px] text-gray-700 hover:text-red-400">×</button>
                </div>
              ))}
              <button onClick={() => onUpdate(block.id, { members: [...(block.data?.members || []), { type: 'uint256', name: `field${block.data.members.length}` }] })}
                className="w-4 h-4 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-[12px] text-gray-500">+</button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            MODIFIER / COMMENT / LOGIC — these three share the same simple
            name-only input. Contract and Constructor used to be here too
            but got their own specialized sections below.
           ═══════════════════════════════════════════════════════════ */}
        {(block.type === 'Modifier' || block.type === 'Comment' || block.type === 'Logic') && (
          <input
            className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white focus:text-blue-200 transition-colors w-full p-0"
            value={block.data?.name || ''}
            onChange={(e) => onUpdate(block.id, { name: e.target.value })}
            placeholder={block.type === 'Comment' ? "Comment summary..." : "Name..."}
            spellCheck="false"
            onMouseDown={(e) => e.stopPropagation()}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════
            ERROR DEFINITION — custom Solidity error with typed params.
            e.g. error InsufficientBalance(uint256 _balance);
            Uses the same params pill pattern as Function/Constructor.
           ═══════════════════════════════════════════════════════════ */}
        {block.type === 'ErrorDef' && (
          <div className="flex items-center gap-2 flex-1" onMouseDown={(e) => e.stopPropagation()}>
            <span className="text-rose-500 font-bold">error</span>
            <input
              className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white w-24"
              value={block.data?.name || ''}
              onChange={(e) => onUpdate(block.id, { name: e.target.value })}
              placeholder="ErrorName"
            />
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
                    className="bg-transparent border-none outline-none text-[13px] text-white/80 w-20"
                    value={p.name}
                    onChange={(e) => {
                      const newPs = [...block.data.params]; newPs[idx].name = e.target.value;
                      onUpdate(block.id, { params: newPs });
                    }}
                  />
                  <button onClick={() => onUpdate(block.id, { params: block.data.params.filter((_, i) => i !== idx) })}
                    className="text-[10px] text-gray-700 hover:text-red-400">×</button>
                </div>
              ))}
              <button onClick={() => onUpdate(block.id, { params: [...(block.data?.params || []), { type: 'uint256', name: `arg${block.data.params.length}` }] })}
                className="w-4 h-4 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-[12px] text-gray-500">+</button>
            </div>
            <span className="text-gray-600 font-bold">);</span>
          </div>
        )}
        {/* ═══════════════════════════════════════════════════════════
            REQUIRE / ASSERT / REVERT — error handling statements.
            Require and Assert get a condition + optional message.
            Revert just gets a message (or custom error call).
            The comma between condition and message only shows for Require.
           ═══════════════════════════════════════════════════════════ */}
        {(block.type === 'Require' || block.type === 'Assert' || block.type === 'Revert') && (
          <div className="flex items-center gap-2 flex-1" onMouseDown={(e) => e.stopPropagation()}>
            <span className="text-rose-500 font-bold lowercase text-[14px]">
              {block.type.toLowerCase()}(
            </span>

            {/* Condition (Only for Require/Assert) */}
            {(block.type === 'Require' || block.type === 'Assert') && (
              <input
                className="bg-transparent border-none outline-none text-[13px] text-pink-400 w-32"
                value={block.data?.condition || ''}
                onChange={(e) => onUpdate(block.id, { condition: e.target.value })}
                placeholder="condition"
              />
            )}
            {/* Comma (Only for Require) */}
            {block.type === 'Require' && <span className="text-gray-600">,</span>}
            {/* Message */}
            {(block.type === 'Require' || block.type === 'Revert' || block.type === 'Assert') && (
              <input
                className="bg-transparent border-none outline-none text-[13px] text-white/50 w-32"
                value={block.data?.message || ''}
                onChange={(e) => onUpdate(block.id, { message: e.target.value })}
                placeholder="'error message'"
              />
            )}

            <span className="text-rose-500 font-bold">);</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            EVENT — declaration with typed params that can be toggled
            as "indexed" via a tiny pill button. Up to 3 indexed params
            per event in Solidity, but we don't enforce that here.
           ═══════════════════════════════════════════════════════════ */}
        {block.type === 'Event' && (
          <div className="flex items-center gap-2 flex-1 flex-wrap" onMouseDown={(e) => e.stopPropagation()}>
            <span className="text-amber-500 font-bold">event</span>
            <input
              className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white w-24"
              value={block.data?.name || ''}
              onChange={(e) => onUpdate(block.id, { name: e.target.value })}
              placeholder="Log"
            />
            <span className="text-gray-600 font-bold">(</span>

            <div className="flex items-center gap-1 flex-wrap">
              {(block.data?.params || []).map((p, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-white/5 border border-white/5 rounded px-1 group">
                  {/* Type Input */}
                  <input
                    className="bg-transparent border-none outline-none text-[11px] text-[#569cd6] w-16"
                    value={p.type}
                    onChange={(e) => {
                      const newPs = [...block.data.params]; newPs[idx].type = e.target.value;
                      onUpdate(block.id, { params: newPs });
                    }}
                  />

                  {/* Indexed Toggle */}
                  <button
                    onClick={() => {
                      const newPs = [...block.data.params];
                      newPs[idx].indexed = !newPs[idx].indexed;
                      onUpdate(block.id, { params: newPs });
                    }}
                    className={`text-[9px] uppercase font-bold px-1 rounded transition-all ${p.indexed ? 'bg-amber-500 text-black' : 'text-gray-600 hover:text-gray-400'}`}
                    title="Toggle Indexed"
                  >
                    idx
                  </button>

                  {/* Name Input */}
                  <input
                    className="bg-transparent border-none outline-none text-[11px] text-white/70 w-16"
                    value={p.name}
                    onChange={(e) => {
                      const newPs = [...block.data.params]; newPs[idx].name = e.target.value;
                      onUpdate(block.id, { params: newPs });
                    }}
                  />

                  <button onClick={() => onUpdate(block.id, { params: block.data.params.filter((_, i) => i !== idx) })}
                    className="text-[10px] text-gray-700 hover:text-red-400">×</button>
                </div>
              ))}
              <button
                onClick={() => onUpdate(block.id, { params: [...(block.data?.params || []), { type: 'address', name: `arg${block.data.params.length}`, indexed: false }] })}
                className="w-4 h-4 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-[12px] text-gray-500"
              >+</button>
            </div>
            <span className="text-gray-600 font-bold">);</span>
          </div>
        )}
        {/* ═══════════════════════════════════════════════════════════
            EMIT — fires an event. Just a free-text statement input
            like "Transfer(msg.sender, 100)". No structured params here,
            the user types the full emit expression.
           ═══════════════════════════════════════════════════════════ */}
        {block.type === 'Emit' && (
          <div className="flex items-center gap-2 flex-1" onMouseDown={(e) => e.stopPropagation()}>
            <span className="text-amber-500 font-bold italic">emit</span>
            <input className="..." value={block.data?.statement} placeholder="Log(msg.sender)" />
            <span className="text-amber-500 font-bold">);</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            INTERFACE — just a name. Functions inside it automatically
            get semicolons instead of bodies (handled in the generator
            via the isInterface flag).
           ═══════════════════════════════════════════════════════════ */}
        {block.type === 'Interface' && (
          <input
            className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-sky-400 w-full"
            value={block.data?.name || ''}
            onChange={(e) => onUpdate(block.id, { name: e.target.value })}
            placeholder="IMyInterface"
            onMouseDown={(e) => e.stopPropagation()}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════
            CONTRACT — name + inheritance field. The inheritance field
            is a comma-separated string like "ERC20, Ownable" that gets
            baked into "contract MyToken is ERC20, Ownable { ... }".
            The generator also auto-adds OpenZeppelin imports based on this.
           ═══════════════════════════════════════════════════════════ */}
        {block.type === 'Contract' && (
          <div className="flex items-center gap-2 flex-1" onMouseDown={(e) => e.stopPropagation()}>
            <input
              className="font-code bg-transparent border-none outline-none font-bold text-[15px] text-white focus:text-blue-200 transition-colors w-24 p-0"
              value={block.data?.name || ''}
              onChange={(e) => onUpdate(block.id, { name: e.target.value })}
              placeholder="MyContract"
              spellCheck="false"
            />
            <span className="text-[11px] font-black uppercase text-gray-600 tracking-widest mr-[-2px]">is</span>
            <input
              className="font-code bg-transparent border-none outline-none text-[12px] text-teal-400/80 w-32 italic"
              value={block.data?.inheritance || ''}
              onChange={(e) => onUpdate(block.id, { inheritance: e.target.value })}
              placeholder="BaseX, BaseY..."
              spellCheck="false"
            />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            CONSTRUCTOR — mutability dropdown (payable or not).
            Params and initializers (like "ERC20('MyToken', 'MTK')")
            are handled by the shared params section below.
           ═══════════════════════════════════════════════════════════ */}
        {block.type === 'Constructor' && (
          <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
            <select
              className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[12px] text-[#eab308] rounded-md px-2 py-1 cursor-pointer font-bold appearance-none hover:bg-[#252525] transition-all uppercase w-[90px] h-[28px] text-left"
              value={block.data?.mutability || ''}
              onChange={(e) => onUpdate(block.id, { mutability: e.target.value })}
            >
              <option value="" className="bg-[#1a1a1a] text-white">mutability</option>
              <option value="payable" className="bg-[#1a1a1a] text-white">payable</option>
            </select>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            RECEIVE — special function for receiving plain ETH transfers.
            Always external + payable, no config needed. Just a label.
           ═══════════════════════════════════════════════════════════ */}
        {block.type === 'Receive' && (
          <span className="text-gray-500 text-[12px] font-medium uppercase tracking-widest italic ml-2">always external + payable</span>
        )}

        {/* ═══════════════════════════════════════════════════════════
            FALLBACK — catches calls to functions that don't exist.
            Always external, optionally payable.
           ═══════════════════════════════════════════════════════════ */}
        {block.type === 'Fallback' && (
          <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
            <select
              className="font-code bg-[#1a1a1a] border border-white/10 outline-none text-[11px] text-[#eab308] rounded px-1.5 py-0.5 uppercase"
              value={block.data?.mutability || ''}
              onChange={(e) => onUpdate(block.id, { mutability: e.target.value })}
            >
              <option value="">mutability</option>
              <option value="payable">payable</option>
            </select>
            <span className="text-gray-500 text-[11px] uppercase ml-2">external</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SHARED PARAMS SECTION — used by Function, Modifier, and
            Constructor. Each param is a {type, name} pill you can
            add/remove. Constructor also gets an "initializers" input
            for base contract calls like ERC20("Name", "SYM").
           ═══════════════════════════════════════════════════════════ */}
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

            {/* Constructor Initializers field */}
            {block.type === 'Constructor' && (
              <input
                className="font-code bg-transparent border-none outline-none text-[12px] text-orange-400/80 w-32 italic ml-2"
                value={block.data?.initializers || ''}
                onChange={(e) => onUpdate(block.id, { initializers: e.target.value })}
                placeholder="BaseX('msg')..."
                spellCheck="false"
              />
            )}
          </div>
        )}
      </div>

      {/* ═══════ BLOCK ID + DELETE BUTTON (pinned to the right) ═══════ */}
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
