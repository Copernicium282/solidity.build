import { ChevronRight, ChevronDown, Trash2, Edit2 } from 'lucide-react';

/**
 * BlockHeader: inline config panel per block type.
 *
 * Big file. Conditional JSX sections per type render inputs in header.
 * Acts like giant switch on block.type for custom layouts.
 *
 * stopPropagation rationale:
 *   Header = drag handle. stopPropagation prevents inputs starting drags.
 *   All interactive areas need `e.stopPropagation()`.
 *
 * Array copy-mutate rationale:
 *   Update params/members: shallow copy array `[...params]`, mutate idx, `onUpdate`.
 *   New array ref triggers React render. Inner objects share ref.
 *   Works because `onUpdate` spreads into new data object.
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
            STATE VAR: type picker, vis, const/imm, name, value.
            Const/imm logic auto-formats string.
            Custom-type toggle swaps dropdown for free-text input.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'State Var'  && <StateVarField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            FUNC: vis, mut, modifiers, virt/over, name.
            Virt/Over = pills. Over shows parent params for multi-inheritance.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'Function'  && <FunctionField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            MAPPING: nested mapping via dynamic array.
            "+" inserts nesting level.
            Ex: [addr, addr, uint] → mapping(addr => mapping(addr => uint)).
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'Mapping'  && <MappingField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            WHILE: condition input in parens.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'While'  && <WhileField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            FOR: init, condition, step inputs. Semicolon separated.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'For'  && <ForField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            IF / ELSEIF: condition input. Else-chain handles in generator.
           ═══════════════════════════════════════════════════════════ */}
        { (block.type === 'If' || block.type === 'ElseIf')  && <IfElseIfField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            TERNARY: inline cond ? true : false.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'Ternary'  && <TernaryField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            ARRAY: type, size (empty=dynamic), vis, name, init val.
            Custom-type toggle = State Var toggle mode.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'Array'  && <ArrayField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            ENUM: name + dynamic member list (pills + ×).
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'Enum'  && <EnumField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            USER VALUE TYPE: name + base type.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'User-Defined Value Type'  && <UserDefinedValueTypeField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            LIBRARY: name. Body holds children.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'Library'  && <LibraryField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            STRUCT: name + typed member list (pills: type + name + ×).
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'Struct'  && <StructField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            MOD/COM/LOGIC: simple shared name input.
           ═══════════════════════════════════════════════════════════ */}
        { (block.type === 'Modifier' || block.type === 'Comment' || block.type === 'Logic')  && <ModifierCommentLogicField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            ERROR DEF: custom error via param pills.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'ErrorDef'  && <Errordef Field block={block} onUpdate={onUpdate} /> }
        {/* ═══════════════════════════════════════════════════════════
            REQ/ASSERT/REVERT: error flows.
            Req/Assert: condition + opt message.
            Revert: message/trace only.
           ═══════════════════════════════════════════════════════════ */}
        { (block.type === 'Require' || block.type === 'Assert' || block.type === 'Revert')  && <RequireAssertRevert Field block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            EVENT: params + 'indexed' pill toggle.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'Event'  && <EventField block={block} onUpdate={onUpdate} /> }
        {/* ═══════════════════════════════════════════════════════════
            EMIT: free text statement. No structured params.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'Emit'  && <EmitField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            INTERFACE: name. Generator marks child functions as semicolon.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'Interface'  && <InterfaceField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            CONTRACT: name + inheritance string (CSV). Auto-inject OZ imports.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'Contract'  && <ContractField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            CONSTRUCTOR: mut dropdown. Params share bottom logic.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'Constructor'  && <ConstructorField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            RECEIVE — special function for receiving plain ETH transfers.
            Always external + payable, no config needed. Just a label.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'Receive'  && <ReceiveField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            FALLBACK — catches calls to functions that don't exist.
            Always external, optionally payable.
           ═══════════════════════════════════════════════════════════ */}
        { block.type === 'Fallback'  && <FallbackField block={block} onUpdate={onUpdate} /> }

        {/* ═══════════════════════════════════════════════════════════
            SHARED PARAMS SECTION — used by Function, Modifier, and
            Constructor. Each param is a {type, name} pill you can
            add/remove. Constructor also gets an "initializers" input
            for base contract calls like ERC20("Name", "SYM").
           ═══════════════════════════════════════════════════════════ */}
        { (block.type === 'Modifier' || block.type === 'Function' || block.type === 'Constructor')  && <ModifierFunctionConstructorField block={block} onUpdate={onUpdate} /> }
      </div>

      {/* ═══════ BLOCK ID + DELETE BTN (right) ═══════ */}
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
