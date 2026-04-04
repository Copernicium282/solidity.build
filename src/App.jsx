import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Palette from "./components/Palette";
import Workspace from "./components/Workspace";
import CodePanel from "./components/CodePanel";
import { DndContext, pointerWithin, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';

function App() {
   const [blocks, setBlocks] = useState([]);
   const [isCodeOpen, setIsCodeOpen] = useState(true);
   const [isFullscreenCode, setIsFullscreenCode] = useState(false);
   const [generatedCode, setGeneratedCode] = useState("");
   const [solVersion, setSolVersion] = useState("^0.8.30");

   const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
   );

   const handleDragEnd = (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      // Clone tree
      const newBlocks = structuredClone(blocks);

      // Remove from current position
      const findAndRemove = (list, id) => {
         for (let i = 0; i < list.length; i++) {
            if (String(list[i].id) === id) return list.splice(i, 1)[0];
            if (list[i].children) {
               const found = findAndRemove(list[i].children, id);
               if (found) return found;
            }
         }
      };

      // Find a block's parent list and index
      const findBlockLocation = (list, id) => {
         for (let i = 0; i < list.length; i++) {
            if (String(list[i].id) === id) return { parent: list, index: i };
            if (list[i].children) {
               const found = findBlockLocation(list[i].children, id);
               if (found) return found;
            }
         }
         return null;
      };

      // Find a block by ID
      const findBlock = (list, id) => {
         for (const b of list) {
            if (String(b.id) === id) return b;
            if (b.children) {
               const found = findBlock(b.children, id);
               if (found) return found;
            }
         }
         return null;
      };

      const snatched = findAndRemove(newBlocks, activeId);
      if (!snatched) return;

      // Determine where to insert
      if (overId === 'workspace-drop') {
         // Dropped on empty workspace — add to root
         newBlocks.push(snatched);
      } else if (overId.startsWith('drop-')) {
         // Dropped on a container's drop zone — insert as child
         const parentId = overId.slice(5);
         const parent = findBlock(newBlocks, parentId);
         if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(snatched);
         } else {
            newBlocks.push(snatched);
         }
      } else {
         // Dropped on another block — insert before it
         const location = findBlockLocation(newBlocks, overId);
         if (location) {
            location.parent.splice(location.index, 0, snatched);
         } else {
            newBlocks.push(snatched);
         }
      }

      setBlocks(newBlocks);
      console.log("DROP:", activeId, "→", overId);
   };

   const generateSolidity = () => {
      let code = "// SPDX-License-Identifier: MIT\n";
      code += `pragma solidity ${solVersion};\n\n`;
      const renderList = (blockList, indent = "") => {
         let output = "";
         blockList.forEach((b) => {
            // Contract
            if (b.type === "Contract") {
               output += `${indent}contract ${b.data?.name || "MyContract"} {\n`;
               output += renderList(b.children || [], indent + "    "); // recursion
               output += `${indent}}\n\n`;
            }
            // Function
            else if (b.type === "Function") {
               const args = (b.data?.params || []).map(p => `${p.type} ${p.name}`).join(", ");
               const vis = b.data?.visibility || "public";
               const mut = b.data?.mutability ? ` ${b.data.mutability}` : "";
               const ret = b.data?.returns ? ` returns (${b.data.returns})` : "";

               // Open the function
               output += `\n${indent}function ${b.data?.name || "func"}(${args}) ${vis}${mut}${ret} {\n`;

               // Call the kids recurser lol
               output += renderList(b.children || [], indent + "    ");

               // Close the function
               output += `${indent}}\n`;
            }
            // Logic
            else if (b.type === "Logic") {
               const codeSnippet = b.data?.code || "";
               // We indent every line of the snippet correctly
               output += codeSnippet.split('\n').map(l => `${indent}${l}`).join('\n') + "\n";
            }
            // State Var
            else if (b.type === "State Var") {
               const type = b.data?.varType || "uint256";
               const vis = b.data?.visibility || "public";
               const isConst = b.data?.isConst ? "constant" : "";
               const isImm = b.data?.isImm ? "immutable" : "";
               const modifiers = [isConst, isImm].filter(Boolean).join(" ");
               const modSpacer = modifiers ? ` ${modifiers}` : "";

               // Uppercase name if constant
               const name = b.data?.name || "v";
               let finalName = b.data?.isConst ? name.toUpperCase() : name;
               if (b.data?.isImm) {
                  finalName = `i_${finalName}`;
               }

               const val = b.data?.value ? ` = ${b.data.value}` : "";
               output += `${indent}${type} ${vis}${modSpacer} ${finalName}${val};\n`;
            }
            // Mapping
            else if (b.type === "Mapping") {
               const type1 = b.data?.varType1 || "address";
               const type2 = b.data?.varType2 || "uint256";
               const vis = b.data?.visibility || "public";
               const name = b.data?.name || "name";
               output += `${indent}mapping(${type1} => ${type2}) ${vis} ${name};\n`;
            }
            // Comment
            else if (b.type === "Comment") {
               const text = b.data?.text || "comment here";
               const commentLineStyle = text.split('\n').map(l => `${indent}    ${l}`).join('\n');
               output += `\n${indent}/*\n${commentLineStyle}\n${indent}*/\n`;
            }
            // Constructor
            else if (b.type === "Constructor") {
               const args = (b.data?.params || []).map(p => `${p.type} ${p.name}`).join(", ");
               output += `\n${indent}constructor(${args}) {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}\n`;
            }
            // Modifier
            else if (b.type === "Modifier") {
               const args = (b.data?.params || []).map(p => `${p.type} ${p.name}`).join(", ");
               output += `\n${indent}modifier ${b.data?.name || "mod"}(${args}) {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}\n`;
            }
            // While Loop
            else if (b.type === "While") {
               output += `\n${indent}while (${b.data?.condition || "true"}) {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}\n`;
            }
            // For Loop
            else if (b.type === "For") {
               const init = b.data?.init || "uint256 i = 0";
               const cond = b.data?.condition || "i < 10";
               const step = b.data?.step || "i++";
               output += `\n${indent}for (${init}; ${cond}; ${step}) {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}\n`;
            }
            // If
            else if (b.type === "If") {
               output += `${indent}if (${b.data?.condition || "true"}) {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}`;
               if (!followedByElse) output += `\n`;
            }
            // ElseIf
            else if (b.type === "ElseIf") {
               output += ` else if (${b.data?.condition || "true"}) {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}`;
               if (!followedByElse) output += `\n`;
            }
            // Else
            else if (b.type === "Else") {
               output += ` else {\n`;
               output += renderList(b.children || [], indent + "    ");
               output += `${indent}}\n`;
            }
            // Ternary
            else if (b.type === "Ternary") {
               const cond = b.data?.condition || "_x < 10";
               const t = b.data?.trueVal || "1";
               const f = b.data?.falseVal || "2";
               output += `${indent}return ${cond} ? ${t} : ${f};\n`;
            }
         });
         return output;
      };
      const finalBody = renderList(blocks);
      setGeneratedCode(code + finalBody);
   };
   useEffect(() => {
      generateSolidity();
   }, [blocks, solVersion]);

   const addBlock = (type) => {
      let initialData = { isOpen: true };
      if (type === 'Contract') initialData.name = "MyContract";
      else if (type === 'Function') initialData.name = "myFunc";
      else if (type === 'State Var') initialData.name = "newVar";
      else if (type === 'Mapping') {
         initialData.name = "myMapping";
         initialData.varType1 = "address";
         initialData.varType2 = "uint256";
      }
      else if (type === 'While') {
         initialData.condition = "true";
      }
      else if (type === 'For') {
         initialData.init = "uint256 i = 0";
         initialData.condition = "i < 10";
         initialData.step = "i++";
      }
      else if (type === 'If' || type === 'ElseIf') initialData.condition = "x < 10";
      else if (type === 'Ternary') {
         initialData.condition = "_x < 10";
         initialData.trueVal = "1";
         initialData.falseVal = "2";
      }
      const newBlock = {
         id: `block-${Date.now()}`,
         type,
         data: initialData,
         children: []
      };
      setBlocks([...blocks, newBlock]);
   };

   const updateBlock = (id, newData) => {
      const walk = (list) =>
         list.map(b => {
            // surface-level check
            if (b.id === id) return { ...b, data: { ...b.data, ...newData } };
            // Check the kids. (lmao)
            if (b.children) return { ...b, children: walk(b.children) };
            return b;
         });
      setBlocks(walk(blocks));
   };

   const removeBlock = (id) => {
      const walk = (list) =>
         list.filter(b => b.id !== id) // Remove if match
            .map(b => b.children ? { ...b, children: walk(b.children) } : b); // Recurse
      setBlocks(walk(blocks));
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
            <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
               <Workspace
                  blocks={blocks}
                  onUpdateBlock={updateBlock}
                  onRemoveBlock={removeBlock}
                  isCodeOpen={isCodeOpen}
                  solVersion={solVersion}
                  setSolVersion={setSolVersion}
                  onToggleCode={() => setIsCodeOpen(!isCodeOpen)}
               />
            </DndContext>
         </div>

         {/* Code Panel */}
         <div className={`transition-all duration-500 border-l border-gray-800 bg-[#050505] overflow-hidden flex flex-col
                       ${isFullscreenCode ? 'flex-1' : (isCodeOpen ? 'w-[450px]' : 'w-0')}`}>
            <CodePanel code={generatedCode} />
         </div>
      </div>
   )
}

export default App
