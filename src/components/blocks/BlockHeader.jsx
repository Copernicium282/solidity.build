import { ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import {
  StateVarField, FunctionField, MappingField, WhileField, ForField,
  IfElseIfField, TernaryField, ArrayField, EnumField, UserDefinedValueTypeField,
  LibraryField, StructField, ModifierCommentLogicField, ErrorDefField,
  RequireAssertRevertField, EventField, EmitField, InterfaceField,
  ContractField, ConstructorField, ReceiveField, FallbackField,
  ModifierFunctionConstructorField
} from './headers/BlockFields';

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
        { block.type === 'State Var'  && <StateVarField block={block} onUpdate={onUpdate} /> }
        { block.type === 'Function'  && <FunctionField block={block} onUpdate={onUpdate} /> }
        { block.type === 'Mapping'  && <MappingField block={block} onUpdate={onUpdate} /> }
        { block.type === 'While'  && <WhileField block={block} onUpdate={onUpdate} /> }
        { block.type === 'For'  && <ForField block={block} onUpdate={onUpdate} /> }
        { (block.type === 'If' || block.type === 'ElseIf')  && <IfElseIfField block={block} onUpdate={onUpdate} /> }
        { block.type === 'Ternary'  && <TernaryField block={block} onUpdate={onUpdate} /> }
        { block.type === 'Array'  && <ArrayField block={block} onUpdate={onUpdate} /> }
        { block.type === 'Enum'  && <EnumField block={block} onUpdate={onUpdate} /> }
        { block.type === 'User-Defined Value Type'  && <UserDefinedValueTypeField block={block} onUpdate={onUpdate} /> }
        { block.type === 'Library'  && <LibraryField block={block} onUpdate={onUpdate} /> }
        { block.type === 'Struct'  && <StructField block={block} onUpdate={onUpdate} /> }
        { (block.type === 'Modifier' || block.type === 'Comment' || block.type === 'Logic')  && <ModifierCommentLogicField block={block} onUpdate={onUpdate} /> }
        { block.type === 'ErrorDef'  && <ErrorDefField block={block} onUpdate={onUpdate} /> }
        { (block.type === 'Require' || block.type === 'Assert' || block.type === 'Revert')  && <RequireAssertRevertField block={block} onUpdate={onUpdate} /> }
        { block.type === 'Event'  && <EventField block={block} onUpdate={onUpdate} /> }
        { block.type === 'Emit'  && <EmitField block={block} onUpdate={onUpdate} /> }
        { block.type === 'Interface'  && <InterfaceField block={block} onUpdate={onUpdate} /> }
        { block.type === 'Contract'  && <ContractField block={block} onUpdate={onUpdate} /> }
        { block.type === 'Constructor'  && <ConstructorField block={block} onUpdate={onUpdate} /> }
        { block.type === 'Receive'  && <ReceiveField block={block} onUpdate={onUpdate} /> }
        { block.type === 'Fallback'  && <FallbackField block={block} onUpdate={onUpdate} /> }
        { (block.type === 'Modifier' || block.type === 'Function' || block.type === 'Constructor')  && <ModifierFunctionConstructorField block={block} onUpdate={onUpdate} /> }
      </div>

      {/* block stats */}
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
