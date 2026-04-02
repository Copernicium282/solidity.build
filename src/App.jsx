import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Palette from "./components/Palette";
import Workspace from "./components/Workspace";
import CodePanel from "./components/CodePanel";

function App() {
   const [blocks, setBlocks] = useState([]);
   const [isCodeOpen, setIsCodeOpen] = useState(true);
   const [isFullscreenCode, setIsFullscreenCode] = useState(false);
   const [generatedCode, setGeneratedCode] = useState("");

   const generateSolidity = () => {
      let code = "// SPDX-License-Identifier: MIT\n";
      code += "pragma solidity ^0.8.20;\n\n";
      const contractBlock = blocks.find(b => b.type === 'Contract');
      if (contractBlock) {
         const contractName = contractBlock.data?.name || "MyContract";
         code += `contract ${contractName} {\n`;
         blocks.filter(b => b.type !== 'Contract').forEach(b => {
            const name = b.data?.name || "val";
            if (b.type === 'State Var') code += `    uint256 public ${name};\n`;
            if (b.type === 'Mapping') code += `    mapping(address => uint256) public ${name};\n`;
            if (b.type === 'Constructor') code += "\n    constructor() {\n        // Logic\n    }\n";
            if (b.type === 'Function') code += `\n    function ${b.data?.name || 'myFunc'}() public {\n        // Logic\n    }\n`;
         });
         code += "\n}";
      } else {
         code += "// Drag a 'Contract' block to begin...";
      }
      setGeneratedCode(code);
   };

   useEffect(() => {
      generateSolidity();
   }, [blocks]);

   const addBlock = (type) => {
      const newBlock = {
         id: Date.now(),
         type,
         data: { name: type === 'Contract' ? 'MyContract' : type, isOpen: true }
      };
      setBlocks([...blocks, newBlock]);
   };

   const updateBlock = (id, newData) => {
      setBlocks(blocks.map(b => b.id === id ? { ...b, data: { ...b.data, ...newData } } : b));
   };

   const removeBlock = (id) => {
      setBlocks(blocks.filter(block => block.id !== id));
   };

   return (
      <div className="flex h-screen bg-background text-white overflow-hidden font-sans select-none">
         <Sidebar onToggleFullscreen={() => setIsFullscreenCode(!isFullscreenCode)} />

         <div className={`transition-all duration-300 border-r border-gray-800 flex flex-col bg-[#0b0b0b] min-w-0
                       ${isFullscreenCode ? 'w-0 opacity-0' : 'w-68 opacity-100'}`}>
            <Palette onAddBlock={addBlock} />
         </div>

         <div className={`transition-all duration-300 flex flex-col bg-[#111] min-w-0
                       ${isFullscreenCode ? 'w-0 flex-0 opacity-0' : 'flex-1 opacity-100'}`}>
            <Workspace
               blocks={blocks}
               onUpdateBlock={updateBlock}
               onRemoveBlock={removeBlock}
               isCodeOpen={isCodeOpen}
               onToggleCode={() => setIsCodeOpen(!isCodeOpen)}
            />
         </div>

         {/* FIXED: Added 'flex flex-col' here to force full height for CodePanel */}
         <div className={`transition-all duration-500 border-l border-gray-800 bg-[#050505] overflow-hidden flex flex-col
                       ${isFullscreenCode ? 'flex-1' : (isCodeOpen ? 'w-[450px]' : 'w-0')}`}>
            <CodePanel code={generatedCode} />
         </div>
      </div>
   )
}

export default App
