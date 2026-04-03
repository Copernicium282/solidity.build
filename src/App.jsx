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
   const [solVersion, setSolVersion] = useState("0.8.30");

   const generateSolidity = () => {
      let code = "// SPDX-License-Identifier: MIT\n";
      code += `pragma solidity ${solVersion};\n\n`;
      const contractBlock = blocks.find(b => b.type === 'Contract');
      if (contractBlock) {
         const contractName = contractBlock.data?.name || "MyContract";
         code += `contract ${contractName} {\n`;
         blocks.filter(b => b.type !== 'Contract').forEach(b => {
            const name = b.data?.name || "val";
            if (b.type === 'State Var') {
               const varType = b.data?.varType || "uint256";
               const visibility = b.data?.visibility || "public";
               const varName = b.data?.name || "myVar";
               code += `    ${varType} ${visibility} ${varName};\n`;
            }
            if (b.type === 'Mapping') code += `    mapping(address => uint256) public ${name};\n`;
            if (b.type === 'Constructor') code += "\n    constructor() {\n        // Logic\n    }\n";
            if (b.type === 'Function') {
               const visibility = b.data?.visibility || "public";
               const mutability = b.data?.mutability || "";
               const name = b.data?.name || "myFunc";
               const returns = b.data?.returns ? ` returns (${b.data.returns})` : "";
               const rawBody = b.data?.body || "";
               const indentedBody = rawBody
                  .split('\n')
                  .map(line => `        ${line}`)
                  .join('\n');

               code += `\n    function ${name}() ${visibility} ${mutability}${returns} {\n${indentedBody}\n    }\n`;
            }
         });
         code += "\n}";
      } else {
         code += "// Drag a 'Contract' block to begin...";
      }
      setGeneratedCode(code);
   };

   useEffect(() => {
      generateSolidity();
   }, [blocks, solVersion]);

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
               solVersion={solVersion}
               setSolVersion={setSolVersion}
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
