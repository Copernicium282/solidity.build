import {
  Square, Box, Zap, Settings, Globe,
  ChevronDown, Plus, FolderOpen, Slash
} from 'lucide-react';

export default function Palette({ onSelectBlock, selectedBlockType, onAddBlock }) {
  const categories = [
    {
      label: 'Definitions',
      isOpen: true,
      blocks: [
        { name: 'Contract', color: 'bg-contract', icon: <Box size={14} /> },
        { name: 'Constructor', color: 'bg-constructor', icon: <Plus size={14} /> },
      ]
    },
    {
      label: 'Variables',
      isOpen: true,
      blocks: [
        { name: 'State Var', color: 'bg-stateVar', icon: <Square size={14} /> },
        { name: 'Comment', color: 'bg-stateVar', icon: <Slash size={14} /> },
        { name: 'Mapping', color: 'bg-stateVar', icon: <Globe size={14} /> },
      ]
    },
    {
      label: 'Logic',
      isOpen: true,
      blocks: [
        { name: 'Function', color: 'bg-func', icon: <Zap size={14} /> },
        { name: 'Logic', color: 'bg-[#569cd6]', icon: <Zap size={14} /> },
        { name: 'Modifier', color: 'bg-modifier', icon: <Settings size={14} /> },
      ]
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0b0b]">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0d0d0d]">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
          <FolderOpen size={14} className="text-gray-600" />
          BLOCK EXPLORER
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto pt-2">
        {categories.map((cat) => (
          <div key={cat.label} className="mb-2">
            <div className="flex items-center gap-2 px-4 py-1.5 hover:bg-white/5 transition-colors group cursor-pointer">
              <ChevronDown size={14} className="text-gray-600 group-hover:text-gray-400" />
              <span className="text-[12px] font-bold text-gray-500 group-hover:text-gray-300">{cat.label}</span>
            </div>

            <div className="pl-6 pr-4 py-1 space-y-0.5">
              {cat.blocks.map((block) => (
                <div
                  key={block.name}
                  onClick={() => onAddBlock(block.name)}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-md cursor-pointer transition-all text-sm
                    ${selectedBlockType === block.name
                      ? 'bg-contract/20 text-white border-l-2 border-contract ring-1 ring-contract/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                >
                  <div className={`${block.color} p-1 rounded-sm shadow-sm opacity-80`}>
                    {block.icon}
                  </div>
                  <span className="font-medium">{block.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}